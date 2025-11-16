# WhatsApp Integration Troubleshooting Guide

## Issue: WhatsApp Messages Not Appearing in Conversations

Let's diagnose and fix this step-by-step.

## 🔍 Step 1: Verify Database Migration

First, check if the WhatsApp columns exist in your conversations table.

### Run this query in Supabase SQL Editor:

```sql
-- Check if WhatsApp columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'conversations';
```

**Expected columns:**
- id
- session_id
- customer_email
- customer_name
- message
- sender
- visitor_info
- created_at
- **channel** ← Must exist
- **whatsapp_message_id** ← Must exist
- **whatsapp_phone_number** ← Must exist
- **whatsapp_profile_name** ← Must exist
- **media_url** ← Must exist
- **media_type** ← Must exist

### ❌ If WhatsApp columns are missing, run this:

```sql
-- Add WhatsApp support columns
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web' 
CHECK (channel IN ('web', 'whatsapp', 'email', 'phone'));

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_profile_name TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_phone 
ON conversations(whatsapp_phone_number) 
WHERE channel = 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_conversations_channel 
ON conversations(channel);

-- Update existing records
UPDATE conversations SET channel = 'web' WHERE channel IS NULL;
```

## 🔍 Step 2: Test API Endpoint Locally

Test if your API endpoint works:

```bash
# Test from your local machine
curl -X POST http://localhost:3000/api/conversations/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session",
    "message": "Test message",
    "sender": "user",
    "channel": "whatsapp",
    "whatsappPhoneNumber": "1234567890",
    "whatsappProfileName": "Test User"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "messageId": "some-uuid",
  "sessionId": "test_session"
}
```

### ❌ If you get an error:

1. **Check .env.local has:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  ← REQUIRED!
```

2. **Restart your dev server:**
```bash
npm run dev
```

## 🔍 Step 3: Test API Endpoint (Deployed)

If your app is deployed, test the public endpoint:

```bash
curl -X POST https://your-domain.com/api/conversations/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session",
    "message": "Test from deployed app",
    "sender": "user",
    "channel": "whatsapp",
    "whatsappPhoneNumber": "1234567890",
    "whatsappProfileName": "Test User"
  }'
```

### ❌ If endpoint not accessible:
- Ensure app is deployed
- Check deployment logs for errors
- Verify route exists: `app/api/conversations/whatsapp/route.ts`

## 🔍 Step 4: Check n8n Workflow Configuration

### Open your n8n WhatsApp workflow and verify:

**After WhatsApp Trigger, you should have HTTP Request node:**

**Settings:**
- Method: `POST`
- URL: `https://your-domain.com/api/conversations/whatsapp`
- Body Content Type: `JSON`

**Body (click "Add Field" → "JSON"):**
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

**Important Settings:**
- Options → Continue On Fail: **ENABLED** ✅
- This ensures WhatsApp still works even if database save fails

## 🔍 Step 5: Test n8n Workflow

1. **Execute your n8n workflow manually** (send a test WhatsApp message)

2. **Check n8n execution logs:**
   - Click on the HTTP Request node
   - Look for the output
   - Should see status `200`
   - Should see response: `{"success": true, "messageId": "...", ...}`

### ❌ If HTTP Request fails:

**Common errors and fixes:**

**Error: "Could not connect to server"**
- Your app might not be deployed yet
- Use ngrok for local testing:
```bash
# Install ngrok
# Run: ngrok http 3000
# Use ngrok URL in n8n: https://abc123.ngrok.io/api/conversations/whatsapp
```

**Error: "404 Not Found"**
- Check URL spelling
- Ensure `/api/conversations/whatsapp` route exists
- Verify file exists: `app/api/conversations/whatsapp/route.ts`

**Error: "Missing required fields"**
- Check n8n body JSON is correct
- Verify field mapping: `{{ $json.from }}` etc.

**Error: "500 Internal Server Error"**
- Check server logs
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check database permissions

## 🔍 Step 6: Check Supabase Database

Run this query in Supabase SQL Editor:

```sql
-- Check if any WhatsApp messages exist
SELECT * FROM conversations 
WHERE channel = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 10;
```

### ❌ If no records:
- Messages aren't being saved
- Go back to Step 4 and check n8n configuration

### ✅ If records exist but not showing in dashboard:
- Check dashboard code
- Verify RLS policies allow reading
- Clear browser cache

## 🔍 Step 7: Check Dashboard

### Verify dashboard is fetching WhatsApp messages:

1. Open browser console (F12)
2. Go to `/dashboard/conversations`
3. Look for API calls to `/api/chat`
4. Check response includes WhatsApp messages

### Fix dashboard to show WhatsApp messages:

The dashboard should filter/display all channels. Check if it's filtering out WhatsApp.

## 🧪 Quick Diagnostic Script

Run this to test everything:

```bash
# Test database connection and API
node test-n8n-integration.js
```

If all tests pass ✅ but still no messages, the issue is in n8n configuration.

## 🆘 Common Issues & Solutions

### Issue 1: "Columns don't exist"
**Solution:** Run the migration SQL from Step 1

### Issue 2: "403 Forbidden"
**Solution:** Check RLS policies, verify service role key

### Issue 3: "n8n can't reach endpoint"
**Solution:** 
- Deploy your app
- Or use ngrok for local testing
- Check firewall settings

### Issue 4: "Messages in DB but not in dashboard"
**Solution:** 
- Clear browser cache
- Check dashboard isn't filtering out WhatsApp
- Verify GET endpoint works

### Issue 5: "Works locally but not in production"
**Solution:**
- Verify environment variables in production
- Check deployment logs
- Ensure SUPABASE_SERVICE_ROLE_KEY is set

## ✅ Verification Checklist

Check each item:

- [ ] Database has WhatsApp columns (channel, whatsapp_phone_number, etc.)
- [ ] `app/api/conversations/whatsapp/route.ts` file exists
- [ ] `.env.local` has SUPABASE_SERVICE_ROLE_KEY
- [ ] API endpoint responds to POST requests
- [ ] App is deployed (or using ngrok for local)
- [ ] n8n HTTP Request node configured correctly
- [ ] n8n workflow executes without errors
- [ ] n8n HTTP Request shows 200 status
- [ ] Records appear in Supabase conversations table
- [ ] Dashboard shows conversations

## 🎯 Next Steps

Once you've gone through all steps above, report which step fails:

1. **Database migration** - Does the table have all columns?
2. **API test** - Does curl test work?
3. **n8n execution** - Does n8n show successful HTTP request?
4. **Database records** - Do records appear in Supabase?
5. **Dashboard** - Do messages show in UI?

This will help pinpoint the exact issue!
