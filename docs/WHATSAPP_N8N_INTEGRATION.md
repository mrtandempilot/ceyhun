# WhatsApp Integration with Existing n8n Chatbot

## Overview
This guide shows how to connect your existing n8n WhatsApp chatbot to your paragliding web app, enabling unified conversation tracking and dashboard management.

## 🎯 Architecture

```
WhatsApp Message → Meta API → n8n Webhook → n8n Workflow → 
                                             ↓
                                    AI Processing (OpenAI/etc.)
                                             ↓
                        ┌────────────────────┴────────────────────┐
                        ↓                                         ↓
                Your Web App API                         Meta WhatsApp API
            (Store in Database)                         (Send Response)
```

## Current Setup (What You Have)

✅ WhatsApp Business API configured in Meta
✅ n8n workflow receiving WhatsApp messages
✅ n8n chatbot processing and responding
✅ Web app with conversation storage

## What We'll Add

🔄 Connect n8n to web app database
📊 View WhatsApp conversations in dashboard
🔗 Unified conversation tracking
📱 Send WhatsApp messages from dashboard
🤖 Same AI responses across channels

## 🚀 Implementation Steps

### Step 1: Update Database (Already Done!)

Run the migration script in Supabase:
```sql
-- Run UPDATE_CONVERSATIONS_FOR_WHATSAPP.sql in Supabase SQL Editor
```

This adds WhatsApp support to your conversations table.

### Step 2: Configure n8n Workflow

Add these nodes to your **existing** n8n WhatsApp workflow:

#### A. After receiving WhatsApp message, add HTTP Request node:

**Node Name:** Save User Message to Database

**Settings:**
- Method: `POST`
- URL: `https://your-domain.com/api/conversations/whatsapp`
- Authentication: None (or add API key if you want)
- Body:
```json
{
  "sessionId": "whatsapp_{{ $json.from }}",
  "message": "{{ $json.text.body }}",
  "sender": "user",
  "channel": "whatsapp",
  "whatsappMessageId": "{{ $json.id }}",
  "whatsappPhoneNumber": "{{ $json.from }}",
  "whatsappProfileName": "{{ $json.profile.name }}",
  "mediaUrl": "{{ $json.image?.link || $json.video?.link || $json.document?.link || null }}",
  "mediaType": "{{ $json.type !== 'text' ? $json.type : null }}"
}
```

#### B. After AI generates response, add another HTTP Request node:

**Node Name:** Save Bot Response to Database

**Settings:**
- Method: `POST`
- URL: `https://your-domain.com/api/conversations/whatsapp`
- Body:
```json
{
  "sessionId": "whatsapp_{{ $json.from }}",
  "message": "{{ $json.aiResponse }}",
  "sender": "bot",
  "channel": "whatsapp",
  "whatsappPhoneNumber": "{{ $json.from }}",
  "whatsappProfileName": "{{ $json.profile.name }}"
}
```

### Step 3: Create API Endpoint in Your App

The endpoint is already created at:
- `app/api/conversations/whatsapp/route.ts`

This endpoint:
- Receives messages from n8n
- Stores them in Supabase
- Returns success/error status

### Step 4: Test the Integration

1. Send a test WhatsApp message to your business number
2. Check n8n workflow executes successfully
3. Verify message appears in Supabase `conversations` table
4. Check dashboard at `/dashboard/conversations`

## 📊 Dashboard Updates

The conversations dashboard will automatically show WhatsApp messages once they're in the database with `channel='whatsapp'`.

**Filter by channel:**
```typescript
// In /app/dashboard/conversations/page.tsx
const whatsappMessages = conversations.filter(c => c.channel === 'whatsapp');
const webMessages = conversations.filter(c => c.channel === 'web');
```

## 🔄 Optional: Send Messages from Dashboard

### Option 1: Through n8n (Recommended)

Create a new n8n workflow for sending:

**Webhook Trigger:**
- Method: POST
- Path: `/webhook/send-whatsapp`

**WhatsApp Node:**
- Action: Send Message
- Phone Number: `{{ $json.to }}`
- Message: `{{ $json.message }}`

**HTTP Request Node (Save to DB):**
```json
{
  "sessionId": "whatsapp_{{ $json.to }}",
  "message": "{{ $json.message }}",
  "sender": "bot",
  "channel": "whatsapp",
  "whatsappPhoneNumber": "{{ $json.to }}"
}
```

Then in your web app:
```typescript
// POST to your n8n webhook
await fetch('https://your-n8n.com/webhook/send-whatsapp', {
  method: 'POST',
  body: JSON.stringify({
    to: phoneNumber,
    message: messageText
  })
});
```

### Option 2: Direct API (Alternative)

Use the existing WhatsApp utilities in `lib/whatsapp.ts` to send directly to Meta API.

## 🎨 Message Templates

You can still use the pre-built templates in `lib/whatsapp-messages.ts`:

```typescript
import { sendBookingConfirmation } from '@/lib/whatsapp-messages';

// This will use your n8n workflow or direct API
await sendBookingConfirmation({
  customerName: 'John Doe',
  customerPhone: '1234567890',
  date: 'March 15, 2025',
  time: '10:00 AM',
  location: 'Ölüdeniz Beach',
  pilotName: 'Captain Sky'
});
```

## 🔐 Security (Optional)

Add API key authentication to prevent unauthorized access:

**In .env.local:**
```env
WHATSAPP_WEBHOOK_SECRET=your_secret_key_here
```

**In n8n HTTP Request:**
```
Headers:
  X-API-Key: your_secret_key_here
```

**In API route:**
```typescript
const apiKey = request.headers.get('x-api-key');
if (apiKey !== process.env.WHATSAPP_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 📈 Benefits of This Approach

✅ **No Duplication** - Uses your existing WhatsApp setup
✅ **Centralized Storage** - All conversations in one database
✅ **Unified Dashboard** - View web and WhatsApp chats together
✅ **Flexible** - Can send through n8n or directly
✅ **AI Consistency** - Same chatbot logic for all channels
✅ **Easy Maintenance** - One workflow to manage

## 🧪 Testing Checklist

- [ ] Database migration executed
- [ ] n8n workflow updated with HTTP Request nodes
- [ ] Test message sent and received
- [ ] Message appears in Supabase
- [ ] Message visible in dashboard
- [ ] Bot response saved to database
- [ ] Can filter by channel in dashboard

## 📝 n8n Workflow Example

Here's a complete example of what your n8n workflow should look like:

```
1. WhatsApp Trigger
   ↓
2. HTTP Request: Save User Message
   URL: https://your-app.com/api/conversations/whatsapp
   ↓
3. OpenAI/AI Processing
   ↓
4. HTTP Request: Save Bot Response
   URL: https://your-app.com/api/conversations/whatsapp
   ↓
5. WhatsApp: Send Response
```

## 🆘 Troubleshooting

**Messages not appearing in database:**
- Check n8n workflow execution logs
- Verify API endpoint URL is correct
- Check Supabase logs for errors
- Ensure database migration was run

**Dashboard not showing WhatsApp messages:**
- Verify `channel='whatsapp'` in database
- Check dashboard filtering logic
- Clear browser cache and refresh

**n8n can't reach your API:**
- Ensure your web app is deployed and accessible
- Check firewall/security settings
- Use ngrok for local testing

## 🎯 Next Steps

1. Run database migration
2. Update your n8n WhatsApp workflow
3. Test with a real message
4. Customize dashboard to show channel badges
5. Add message templates for common scenarios
6. Set up automated booking confirmations

---

**You're now ready to unify your WhatsApp and web chat conversations!** 🎉
