# Your n8n WhatsApp Integration - Quick Setup Guide

## 🎯 Your n8n Webhook URLs

**GET/POST Webhook:**
```
https://mvt36n7e.rpcld.com/webhook-test/37768972-ec77-42d6-b67c-bc6eb511c204/webhook
```

## 📋 Step-by-Step Integration

### Step 1: Run Database Migration ✅

Execute this SQL in your Supabase SQL Editor:

```sql
-- Copy from UPDATE_CONVERSATIONS_FOR_WHATSAPP.sql
-- Or run this directly:

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web' 
CHECK (channel IN ('web', 'whatsapp', 'email', 'phone'));

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_profile_name TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_phone 
ON conversations(whatsapp_phone_number) 
WHERE channel = 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_conversations_channel 
ON conversations(channel);

UPDATE conversations SET channel = 'web' WHERE channel IS NULL;
```

### Step 2: Update Your n8n WhatsApp Workflow

Your current n8n workflow probably looks like:
```
WhatsApp Trigger → Process Message → Send Response
```

You need to add 2 HTTP Request nodes to save conversations:

#### 🔵 Node 1: Save User Message (Add after WhatsApp Trigger)

**Node Type:** HTTP Request  
**Node Name:** Save User Message to Database  
**Method:** POST  
**URL:** `https://your-domain.com/api/conversations/whatsapp`

**Authentication:** None (or add X-API-Key header if you set WHATSAPP_WEBHOOK_SECRET)

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "sessionId": "whatsapp_{{ $json.from }}",
  "message": "{{ $json.text?.body || '[Media]' }}",
  "sender": "user",
  "channel": "whatsapp",
  "whatsappMessageId": "{{ $json.id }}",
  "whatsappPhoneNumber": "{{ $json.from }}",
  "whatsappProfileName": "{{ $json.profile?.name || 'Unknown' }}"
}
```

**Continue On Fail:** ✅ Enabled (so WhatsApp still responds even if database save fails)

---

#### 🔵 Node 2: Save Bot Response (Add after AI Processing, before sending WhatsApp response)

**Node Type:** HTTP Request  
**Node Name:** Save Bot Response to Database  
**Method:** POST  
**URL:** `https://your-domain.com/api/conversations/whatsapp`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "sessionId": "whatsapp_{{ $json.from }}",
  "message": "{{ $json.output || $json.response || $json.aiResponse }}",
  "sender": "bot",
  "channel": "whatsapp",
  "whatsappPhoneNumber": "{{ $json.from }}",
  "whatsappProfileName": "{{ $json.profile?.name || 'Unknown' }}"
}
```

**Continue On Fail:** ✅ Enabled

---

### Step 3: Your Complete Workflow Should Look Like This

```
1. WhatsApp Webhook Trigger
   ↓
2. [NEW] HTTP Request: Save User Message 
   URL: https://your-domain.com/api/conversations/whatsapp
   ↓
3. OpenAI / AI Processing
   (your existing chatbot logic)
   ↓
4. [NEW] HTTP Request: Save Bot Response
   URL: https://your-domain.com/api/conversations/whatsapp
   ↓
5. WhatsApp: Send Message
   (your existing send response node)
```

### Step 4: Deploy Your Web App

Make sure your web app is deployed and accessible at your domain. The endpoint must be publicly accessible:
```
https://your-domain.com/api/conversations/whatsapp
```

### Step 5: Test the Integration

1. **Test the API endpoint first:**
```bash
node test-n8n-integration.js
```

2. **Send a test WhatsApp message** to your business number

3. **Check n8n execution logs** to see if HTTP requests succeeded

4. **Check Supabase** `conversations` table for new records

5. **View in dashboard** at `/dashboard/conversations`

## 🔍 What to Look For

### In n8n Execution Logs:
✅ Both HTTP Request nodes should show `200 OK` status  
✅ Response should include `"success": true`  
✅ Should see `messageId` in response

### In Supabase:
✅ New records in `conversations` table  
✅ `channel` field = `'whatsapp'`  
✅ `sender` field = `'user'` or `'bot'`  
✅ `whatsapp_phone_number` populated

### In Dashboard:
✅ WhatsApp conversations appear in list  
✅ Messages show correct timestamp  
✅ Can filter by channel

## 🎨 Optional: Add Channel Badge to Dashboard

Update `app/dashboard/conversations/page.tsx` to show WhatsApp icon:

```typescript
{message.channel === 'whatsapp' && (
  <span className="text-green-600 text-xs">📱 WhatsApp</span>
)}
{message.channel === 'web' && (
  <span className="text-blue-600 text-xs">🌐 Web</span>
)}
```

## 🔐 Optional Security: Add API Key

**In .env.local:**
```env
WHATSAPP_WEBHOOK_SECRET=your_secret_key_123
```

**In n8n HTTP Request nodes, add header:**
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "your_secret_key_123"
}
```

## 🆘 Troubleshooting

### "Error saving to database"
- Check your web app is deployed and accessible
- Verify URL in n8n is correct: `https://your-domain.com/api/conversations/whatsapp`
- Check Supabase service role key is in `.env.local`

### "Messages not showing in dashboard"
- Run database migration if not done yet
- Check `channel='whatsapp'` in Supabase
- Clear browser cache and refresh dashboard

### "n8n can't reach endpoint"
- Ensure your app is deployed (not just localhost)
- Test endpoint with curl:
```bash
curl -X POST https://your-domain.com/api/conversations/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"test","sender":"user"}'
```

## 📊 Analytics Queries

Once integrated, run these in Supabase to see your data:

**Count messages by channel:**
```sql
SELECT channel, COUNT(*) as count
FROM conversations
GROUP BY channel;
```

**Recent WhatsApp conversations:**
```sql
SELECT 
  whatsapp_profile_name,
  whatsapp_phone_number,
  COUNT(*) as message_count,
  MAX(created_at) as last_message
FROM conversations
WHERE channel = 'whatsapp'
GROUP BY whatsapp_profile_name, whatsapp_phone_number
ORDER BY last_message DESC
LIMIT 10;
```

## ✅ Checklist

- [ ] Database migration executed in Supabase
- [ ] Added "Save User Message" HTTP Request node in n8n
- [ ] Added "Save Bot Response" HTTP Request node in n8n
- [ ] Tested with `node test-n8n-integration.js`
- [ ] Sent real WhatsApp message to test end-to-end
- [ ] Messages appear in Supabase conversations table
- [ ] Messages visible in dashboard at `/dashboard/conversations`
- [ ] Can filter by channel (WhatsApp vs Web)

---

**Once all checkboxes are complete, your WhatsApp integration is live! 🎉**

All WhatsApp conversations will now be stored alongside your web chat, giving you complete visibility into all customer interactions in one unified dashboard.
