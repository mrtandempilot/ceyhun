# WhatsApp Conversations - Step by Step Setup 📱

Let's get your WhatsApp messages showing in the conversations dashboard.

---

## STEP 1: Check if WhatsApp Tables Exist (1 minute)

### Go to Supabase:
1. Open **https://supabase.com**
2. Go to your project
3. Click **"Table Editor"** (left sidebar)
4. Look for these tables:
   - `whatsapp_conversations`
   - `whatsapp_messages`

### Do you see these tables?
- ✅ **YES** → Go to STEP 2
- ❌ **NO** → Go to STEP 1B

---

## STEP 1B: Create WhatsApp Tables (If Missing)

1. **In Supabase, click "SQL Editor"**
2. **Open file:** `database/CREATE_WHATSAPP_CONVERSATIONS.sql` from your project
3. **Copy ALL the content**
4. **Paste into Supabase SQL Editor**
5. **Click "RUN"**
6. **Verify:** You should see "Success"

---

## STEP 2: Check WhatsApp Business API Setup (2 minutes)

### You need:
1. **WhatsApp Business API** phone number
2. **Meta Developer Account** with WhatsApp app
3. **Webhook configured** pointing to your app

### Check if webhook is configured:
1. Go to **Meta Developer Console**: https://developers.facebook.com
2. Find your WhatsApp app
3. Click **WhatsApp** → **Configuration**
4. Check **Webhook**:
   - Callback URL should be: `https://ceyhun.vercel.app/api/whatsapp/webhook`
   - Verify token: (whatever you set)

### Is webhook configured?
- ✅ **YES** → Go to STEP 3
- ❌ **NO** → You need to configure WhatsApp Business API first

---

## STEP 3: Check Environment Variables (1 minute)

### In your `.env.local` file, you should have:
```
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### Do you have these?
- ✅ **YES** → Go to STEP 4
- ❌ **NO** → You need WhatsApp Business API credentials

---

## STEP 4: Test Receiving a WhatsApp Message (2 minutes)

### Send a test message:
1. **From your phone**, send a WhatsApp message to your **business number**
2. Say something like: "Test message"
3. Wait 5 seconds

### Check where it appears:

**Option 1 - Check Supabase Database:**
1. Go to Supabase → **Table Editor**
2. Click **`whatsapp_conversations`** table
3. Look for your phone number
4. Click **`whatsapp_messages`** table
5. Look for your message

**Option 2 - Check Dashboard:**
1. Go to: https://ceyhun.vercel.app/dashboard/conversations
2. Filter by WhatsApp
3. Look for your conversation

### What happens?
- ✅ **Message appears in database** → Webhook is working, go to STEP 5
- ✅ **Message appears in dashboard** → Everything working perfectly! Done!
- ❌ **Message doesn't appear anywhere** → Go to STEP 5 (troubleshooting)

---

## STEP 5: Troubleshooting (If Messages Don't Appear)

### Check 1: Verify Webhook is Receiving Messages

1. Go to **Vercel Dashboard**: https://vercel.com
2. Find your project
3. Click **"Deployments"** → Click latest deployment
4. Click **"Functions"** → Find `/api/whatsapp/webhook`
5. Click to see **logs**
6. Send a WhatsApp message
7. Check if you see logs like: `📨 WhatsApp webhook received:`

**Do you see webhook logs?**
- ✅ **YES** → Webhook receiving messages, go to Check 2
- ❌ **NO** → Webhook not configured correctly in Meta

### Check 2: Verify Database is Saving Messages

1. In Vercel logs (from Check 1), look for:
   - `✅ WhatsApp message saved to database`
   - OR `❌ Database error saving WhatsApp message:`

2. If you see database error, check:
   - Tables exist (`whatsapp_conversations`, `whatsapp_messages`)
   - RLS policies allow inserts
   - Service role key is correct in Vercel env vars

### Check 3: Verify Frontend is Reading Messages

1. Check `/dashboard/conversations` page
2. Open browser console (F12)
3. Look for errors
4. Refresh page

---

## STEP 6: Quick Test - Manual Insert (To Check Dashboard)

### Let's manually add a test conversation to see if dashboard works:

1. **Go to Supabase → SQL Editor**
2. **Run this SQL:**

```sql
-- Insert test WhatsApp conversation
INSERT INTO whatsapp_conversations (phone_number, customer_name, status)
VALUES ('+905551234567', 'Test Customer', 'active')
RETURNING id;

-- Copy the ID from result, then insert a message (replace <conversation_id> with the actual ID)
INSERT INTO whatsapp_messages (conversation_id, sender, message_type, content, status)
VALUES ('<conversation_id>', 'customer', 'text', 'This is a test WhatsApp message', 'received');
```

3. **Go to dashboard:** https://ceyhun.vercel.app/dashboard/conversations
4. **Check:** Do you see the test conversation?

**Result:**
- ✅ **YES, I see it** → Dashboard works! Problem is webhook not saving real messages
- ❌ **NO** → Dashboard has issue reading from database

---

## Common Issues & Solutions:

### Issue 1: "Tables don't exist"
**Solution:** Run `database/CREATE_WHATSAPP_CONVERSATIONS.sql` in Supabase

### Issue 2: "Webhook not receiving messages"
**Solution:** 
- Check Meta webhook configuration
- Verify callback URL is correct
- Check WHATSAPP_VERIFY_TOKEN matches

### Issue 3: "Messages in database but not in dashboard"
**Solution:**
- Check RLS policies on tables
- Verify frontend is querying correct table
- Check browser console for errors

### Issue 4: "No WhatsApp Business API"
**Solution:**
You need to set up WhatsApp Business API first:
1. Create Meta Developer account
2. Create WhatsApp Business app
3. Get phone number
4. Configure webhook

---

## Tell Me:

**Where are you stuck?**

A) Tables don't exist in Supabase
B) Don't have WhatsApp Business API set up
C) Webhook not receiving messages (no logs in Vercel)
D) Messages received but not in database
E) Messages in database but not in dashboard
F) Something else

Just tell me the letter and I'll help with that specific step!
