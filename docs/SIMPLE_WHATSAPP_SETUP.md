# Simple WhatsApp Integration (No n8n Required)

## 🎯 Direct WhatsApp Integration for Your Web App

This is the simplest way to get WhatsApp working with your paragliding booking system.

## 📋 3-Step Setup

### Step 1: Get WhatsApp Business API Credentials

1. **Go to Meta for Developers:** https://developers.facebook.com/
2. **Create or select your app**
3. **Add WhatsApp Product** to your app
4. **Get your credentials:**
   - Phone Number ID
   - Business Account ID  
   - Access Token
   - Create a Verify Token (any random string you choose)

**Where to find these:**
- Phone Number ID: WhatsApp → API Setup → Phone number ID
- Access Token: WhatsApp → API Setup → Temporary/Permanent access token
- Business Account ID: WhatsApp → API Setup → Business Account ID

### Step 2: Add Credentials to Your Web App

**Update your `.env.local` file:**

```env
# Existing Supabase config (keep these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Add WhatsApp credentials
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_meta
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_VERIFY_TOKEN=MySecretToken123  # Choose any random string
WHATSAPP_API_VERSION=v18.0

# Your deployed app URL (fill in after deployment)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 3: Run Database Migration

**In Supabase SQL Editor, run this:**

```sql
-- Add WhatsApp support to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web' 
CHECK (channel IN ('web', 'whatsapp', 'email', 'phone'));

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_profile_name TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_phone 
ON conversations(whatsapp_phone_number) 
WHERE channel = 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_conversations_channel 
ON conversations(channel);

-- Update existing records
UPDATE conversations SET channel = 'web' WHERE channel IS NULL;
```

## 🚀 That's It! Now Deploy

### Deploy Your App

Deploy to Vercel, Netlify, or your preferred platform. Make sure to:
1. Add all environment variables from `.env.local`
2. Note your deployed URL (e.g., `https://yourapp.vercel.app`)
3. Update `NEXT_PUBLIC_APP_URL` in environment variables

### Configure Meta Webhook

1. Go to Meta for Developers → Your App → WhatsApp → Configuration
2. **Webhook URL:** `https://your-domain.com/api/whatsapp/webhook`
3. **Verify Token:** Same as `WHATSAPP_VERIFY_TOKEN` in your .env
4. **Subscribe to:** messages, message_status

## ✅ Test Everything

### 1. Test Webhook Verification

Meta will send a GET request to verify your webhook. This should work automatically!

### 2. Send Test WhatsApp Message

Send a message to your WhatsApp Business number from any phone.

**What happens:**
1. ✅ Your webhook receives the message
2. ✅ Message saved to database with `channel='whatsapp'`
3. ✅ n8n chatbot (your existing one) processes the message
4. ✅ Bot response sent back via WhatsApp
5. ✅ Bot response saved to database
6. ✅ View all in `/dashboard/conversations`

### 3. Check Dashboard

Go to `/dashboard/conversations` and you should see:
- Your web chat conversations
- Your WhatsApp conversations
- Filter by channel

## 🎨 Send WhatsApp Messages from Dashboard

You can now send WhatsApp messages programmatically!

### Send a simple message:

```typescript
// In your code (e.g., after booking creation)
const response = await fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '1234567890',  // Customer's WhatsApp number
    message: 'Your booking is confirmed! 🪂',
    type: 'text'
  })
});
```

### Send booking confirmation:

```typescript
import { sendBookingConfirmation } from '@/lib/whatsapp-messages';

await sendBookingConfirmation({
  customerName: 'John Doe',
  customerPhone: '1234567890',
  date: 'March 15, 2025',
  time: '10:00 AM',
  location: 'Ölüdeniz Beach',
  pilotName: 'Captain Sky',
  flightType: 'Tandem Discovery',
  price: '€120'
});
```

## 🔄 How It Works

```
Customer sends WhatsApp → Meta API → Your Webhook
                                           ↓
                              Save to Database (Supabase)
                                           ↓
                              Forward to n8n Chatbot
                                           ↓
                              AI Processes Message
                                           ↓
                              Send Response via WhatsApp API
                                           ↓
                              Save Bot Response to Database
                                           ↓
                              View in Dashboard
```

## 📱 What You Get

✅ **Receive WhatsApp messages** - Automatically saved to database  
✅ **AI Responses** - Uses your existing n8n chatbot  
✅ **Send Messages** - Booking confirmations, reminders, etc.  
✅ **Unified Dashboard** - Web + WhatsApp conversations together  
✅ **Message History** - Full conversation tracking  
✅ **Media Support** - Images, videos, documents, audio  

## 🎯 Pre-Built Features

### Automatic Booking Confirmation
When a booking is created, automatically send WhatsApp:

```typescript
// In your booking creation code
if (customer.whatsapp_number) {
  await sendBookingConfirmation({...});
}
```

### 24-Hour Flight Reminder
Set up a cron job to send reminders:

```typescript
import { send24HourReminder } from '@/lib/whatsapp-messages';

// Get bookings for tomorrow
const tomorrowBookings = await getBookingsForTomorrow();

for (const booking of tomorrowBookings) {
  await send24HourReminder({
    customerName: booking.customer_name,
    customerPhone: booking.customer_whatsapp,
    date: booking.date,
    time: booking.time,
    location: booking.location,
    weatherConditions: 'Perfect conditions!'
  });
}
```

### Payment Reminders

```typescript
import { sendPaymentReminder } from '@/lib/whatsapp-messages';

await sendPaymentReminder({
  customerName: 'John',
  customerPhone: '1234567890',
  amount: '120',
  dueDate: 'March 10',
  invoiceNumber: 'INV-001'
});
```

## 🔐 Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Keep your access token secure
- Use permanent access token (not temporary)
- Verify webhook requests from Meta

## 📊 View Analytics

Query your WhatsApp conversations:

```sql
-- Count messages by channel
SELECT 
  channel, 
  COUNT(*) as total_messages,
  COUNT(DISTINCT session_id) as unique_conversations
FROM conversations
GROUP BY channel;

-- Top WhatsApp customers
SELECT 
  whatsapp_profile_name,
  whatsapp_phone_number,
  COUNT(*) as message_count,
  MAX(created_at) as last_contact
FROM conversations
WHERE channel = 'whatsapp'
GROUP BY whatsapp_profile_name, whatsapp_phone_number
ORDER BY message_count DESC
LIMIT 10;

-- Recent activity
SELECT 
  channel,
  sender,
  message,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 20;
```

## 🆘 Troubleshooting

### "Webhook verification failed"
- Check `WHATSAPP_VERIFY_TOKEN` matches in both .env and Meta settings
- Ensure app is deployed (not localhost)

### "Messages not received"
- Check webhook is configured in Meta
- Verify webhook URL is correct
- Check server logs for errors

### "Can't send messages"
- Verify `WHATSAPP_ACCESS_TOKEN` is valid
- Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure phone number is verified in Meta

### "Messages not in dashboard"
- Run database migration
- Check Supabase service role key is set
- Verify records exist: `SELECT * FROM conversations WHERE channel='whatsapp'`

## ✅ Quick Checklist

- [ ] Got WhatsApp credentials from Meta
- [ ] Added credentials to `.env.local`
- [ ] Ran database migration in Supabase
- [ ] Deployed app to production
- [ ] Configured webhook in Meta dashboard
- [ ] Sent test WhatsApp message
- [ ] Verified message appears in database
- [ ] Checked dashboard shows WhatsApp conversations
- [ ] Tested sending message via API

---

**That's it! Simple and clean WhatsApp integration! 🎉**

No n8n complexity needed - just add your WhatsApp credentials and everything works automatically!
