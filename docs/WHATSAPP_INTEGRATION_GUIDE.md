# WhatsApp Integration Guide

## Overview
This guide will help you integrate WhatsApp Business API with your paragliding web app, allowing customers to communicate via WhatsApp and have their conversations stored alongside web chat messages.

## 🎯 Features

- **Two-way messaging**: Receive and send WhatsApp messages
- **Unified conversations**: Store WhatsApp and web chat in the same database
- **AI chatbot integration**: Connect WhatsApp to your n8n chatbot
- **Multi-channel support**: Track message source (web, WhatsApp, etc.)
- **Status updates**: Send booking confirmations, reminders via WhatsApp
- **Rich media**: Support for images, documents, location sharing

## 📋 Prerequisites

### 1. WhatsApp Business Account
You need a WhatsApp Business API account. Options:

**Option A: Meta (Facebook) WhatsApp Business API** (Recommended)
- Sign up at: https://business.facebook.com/
- Go to WhatsApp → API Setup
- Verify your business
- Get phone number approved

**Option B: Third-party providers** (Easier setup)
- Twilio WhatsApp Business API: https://www.twilio.com/whatsapp
- 360dialog: https://www.360dialog.com/
- Vonage (Nexmo): https://www.vonage.com/communications-apis/messages/

### 2. Required Credentials
After setup, you'll need:
- `WHATSAPP_PHONE_NUMBER_ID` - Your WhatsApp Business phone number ID
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - Your Business Account ID
- `WHATSAPP_ACCESS_TOKEN` - Permanent access token
- `WHATSAPP_VERIFY_TOKEN` - Webhook verification token (you create this)
- `WHATSAPP_API_VERSION` - API version (usually v17.0 or later)

## 🗄️ Database Setup

### Update Conversations Table

Add a channel field to track message source:

```sql
-- Add channel column
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web' 
CHECK (channel IN ('web', 'whatsapp', 'email', 'phone'));

-- Add WhatsApp-specific fields
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_profile_name TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Create index for WhatsApp lookups
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_phone 
ON conversations(whatsapp_phone_number) 
WHERE channel = 'whatsapp';

-- Create index for channel filtering
CREATE INDEX IF NOT EXISTS idx_conversations_channel 
ON conversations(channel);

COMMENT ON COLUMN conversations.channel IS 'Message source: web, whatsapp, email, phone';
COMMENT ON COLUMN conversations.whatsapp_message_id IS 'WhatsApp message ID for tracking';
COMMENT ON COLUMN conversations.whatsapp_phone_number IS 'Customer WhatsApp number';
COMMENT ON COLUMN conversations.whatsapp_profile_name IS 'WhatsApp profile name';
COMMENT ON COLUMN conversations.media_url IS 'URL for media attachments';
COMMENT ON COLUMN conversations.media_type IS 'Type of media: image, video, document, audio';
```

## 🔧 Environment Variables

Add to your `.env.local`:

```env
# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_webhook_verify_token
WHATSAPP_API_VERSION=v18.0

# Webhook URL (your deployed app URL)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📁 File Structure

```
app/
  api/
    whatsapp/
      webhook/
        route.ts          # Main webhook endpoint
      send/
        route.ts          # Send messages endpoint
lib/
  whatsapp.ts             # WhatsApp utilities
  whatsapp-messages.ts    # Message templates
```

## 🚀 Implementation Steps

### Step 1: Set up environment variables

Update `.env.local` with your WhatsApp credentials.

### Step 2: Run database migration

Execute the SQL above in your Supabase SQL Editor.

### Step 3: Deploy webhook endpoint

The webhook endpoint is created at `/api/whatsapp/webhook/route.ts`.

### Step 4: Configure Meta Webhook

1. Go to Meta for Developers: https://developers.facebook.com/
2. Select your app → WhatsApp → Configuration
3. Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
4. Set verify token: (same as `WHATSAPP_VERIFY_TOKEN` in .env)
5. Subscribe to webhook fields:
   - `messages` - Incoming messages
   - `message_status` - Delivery status
   - `message_template_status_update` - Template approvals

### Step 5: Test the integration

Use the webhook test script:
```bash
node test-whatsapp-webhook.js
```

## 📨 Message Flow

### Incoming Messages (Customer → Your App)

1. Customer sends WhatsApp message
2. Meta sends POST request to `/api/whatsapp/webhook`
3. Message is validated and parsed
4. Saved to `conversations` table with `channel='whatsapp'`
5. Forwarded to n8n chatbot for AI response
6. Bot response sent back to customer via WhatsApp
7. Bot response saved to database

### Outgoing Messages (Your App → Customer)

1. Admin/system triggers message send
2. POST to `/api/whatsapp/send`
3. WhatsApp API sends message
4. Message saved to database
5. Status updates received via webhook

## 🎨 Message Templates

WhatsApp requires pre-approved templates for business-initiated conversations.

### Example Templates:

**Booking Confirmation**
```
Hello {{1}},

Your tandem paragliding flight is confirmed! ✅

📅 Date: {{2}}
🕐 Time: {{3}}
📍 Location: {{4}}
👨‍✈️ Pilot: {{5}}

We'll send you a reminder 24 hours before your flight.

See you in the sky! 🪂
```

**Reminder (24h before)**
```
Hi {{1}},

Reminder: Your paragliding flight is tomorrow!

📅 {{2}} at {{3}}
📍 {{4}}

Weather conditions: {{5}}

🔴 Important: Please arrive 15 minutes early.

Reply CONFIRM to confirm or CANCEL if you need to reschedule.
```

**Payment Confirmation**
```
Payment Received ✅

Thank you {{1}}! Payment of €{{2}} confirmed.

Invoice: {{3}}

Your booking is now fully confirmed. We look forward to your flight!
```

## 🔐 Security Best Practices

### 1. Verify Webhook Signatures
WhatsApp signs requests with SHA-256:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex');
  return `sha256=${expectedSignature}` === signature;
}
```

### 2. Rate Limiting
Implement rate limiting to prevent abuse:

```typescript
const rateLimiter = new Map<string, number>();
const MAX_MESSAGES_PER_MINUTE = 10;

function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const lastSent = rateLimiter.get(phoneNumber) || 0;
  
  if (now - lastSent < 60000 / MAX_MESSAGES_PER_MINUTE) {
    return false;
  }
  
  rateLimiter.set(phoneNumber, now);
  return true;
}
```

### 3. Input Validation
Always validate incoming data:

```typescript
function isValidWhatsAppNumber(phone: string): boolean {
  return /^\d{10,15}$/.test(phone.replace(/\+/g, ''));
}
```

## 📊 Dashboard Integration

Update `/app/dashboard/conversations/page.tsx` to:

1. Filter by channel (web, WhatsApp, etc.)
2. Display WhatsApp-specific metadata (phone number, profile name)
3. Show media attachments
4. Enable sending WhatsApp messages from dashboard

### Filter Example:
```typescript
const filterByChannel = (channel: string) => {
  const filtered = allSessions.filter(session => 
    session.messages.some(msg => msg.channel === channel)
  );
  setSessions(filtered);
};
```

## 🎯 Use Cases

### 1. Booking Confirmations
Automatically send WhatsApp confirmation when booking is created:

```typescript
import { sendWhatsAppTemplate } from '@/lib/whatsapp-messages';

// In your booking creation logic
await sendWhatsAppTemplate(
  customerPhone,
  'booking_confirmation',
  {
    customerName,
    date,
    time,
    location,
    pilotName
  }
);
```

### 2. Payment Reminders
Send payment reminders for pending bookings:

```typescript
// Scheduled job (daily)
const pendingBookings = await getPendingPayments();

for (const booking of pendingBookings) {
  if (booking.customer_whatsapp) {
    await sendWhatsAppTemplate(
      booking.customer_whatsapp,
      'payment_reminder',
      {
        customerName: booking.customer_name,
        amount: booking.amount,
        dueDate: booking.payment_due_date
      }
    );
  }
}
```

### 3. Weather Updates
Notify customers about weather-related changes:

```typescript
await sendWhatsAppMessage(
  customerPhone,
  `⚠️ Weather Update: Due to strong winds, your flight scheduled for ${date} may need to be rescheduled. We'll keep you updated.`
);
```

### 4. Customer Support
Enable two-way support conversations via WhatsApp with AI assistance.

## 🧪 Testing

### Test Webhook Locally (ngrok)

1. Install ngrok: https://ngrok.com/
2. Run your Next.js app: `npm run dev`
3. Start ngrok tunnel: `ngrok http 3000`
4. Use ngrok URL in Meta webhook settings
5. Send test message to your WhatsApp number

### Test Script
Create `test-whatsapp.js`:

```javascript
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

async function sendTestMessage(to, message) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumber}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    }
  );
  
  return await response.json();
}

// Test
sendTestMessage('1234567890', 'Hello from test script!')
  .then(console.log)
  .catch(console.error);
```

## 📈 Analytics

Track WhatsApp engagement:

```sql
-- Message volume by channel
SELECT 
  channel,
  COUNT(*) as message_count,
  COUNT(DISTINCT session_id) as unique_conversations
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY channel;

-- WhatsApp response time
SELECT 
  AVG(EXTRACT(EPOCH FROM (bot_time.created_at - user_time.created_at))) as avg_response_seconds
FROM conversations user_time
JOIN conversations bot_time ON user_time.session_id = bot_time.session_id
WHERE user_time.sender = 'user' 
  AND bot_time.sender = 'bot'
  AND user_time.channel = 'whatsapp'
  AND bot_time.created_at > user_time.created_at
  AND bot_time.created_at <= user_time.created_at + INTERVAL '5 minutes';

-- Most active WhatsApp users
SELECT 
  whatsapp_phone_number,
  whatsapp_profile_name,
  COUNT(*) as message_count,
  MAX(created_at) as last_message
FROM conversations
WHERE channel = 'whatsapp'
GROUP BY whatsapp_phone_number, whatsapp_profile_name
ORDER BY message_count DESC
LIMIT 20;
```

## 🚨 Troubleshooting

### Messages not receiving
- Check webhook URL is publicly accessible
- Verify token matches in Meta settings and .env
- Check Meta webhook logs for errors
- Ensure phone number is verified in Business Manager

### Messages not sending
- Check access token validity
- Verify phone number ID is correct
- Ensure message template is approved (for template messages)
- Check API response for error details

### Duplicate messages
- Implement idempotency using `whatsapp_message_id`
- Check for webhook retry logic

## 📚 Resources

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/webhooks)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)

## 🎉 Next Steps

1. [ ] Set up WhatsApp Business Account
2. [ ] Run database migration
3. [ ] Configure environment variables
4. [ ] Deploy webhook endpoint
5. [ ] Configure Meta webhook settings
6. [ ] Create and approve message templates
7. [ ] Test with a real WhatsApp number
8. [ ] Update dashboard to show WhatsApp conversations
9. [ ] Set up automated notifications
10. [ ] Monitor and optimize

---

**Status**: Ready for implementation

Follow this guide step-by-step to integrate WhatsApp into your paragliding booking system!
