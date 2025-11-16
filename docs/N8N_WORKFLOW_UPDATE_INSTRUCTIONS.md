# Update Your n8n WhatsApp Workflow

## 🎯 What We're Adding

2 new HTTP Request nodes to save WhatsApp conversations to your database:
1. **Save User Message** - After receiving WhatsApp message
2. **Save Bot Response** - After AI generates response

## 📋 Step-by-Step Instructions

### Step 1: Add "Save User Message" Node

**Location:** Between "Edit Fields" and "AI Agent"

1. Click **+** button after "Edit Fields" node
2. Search for **"HTTP Request"**
3. Add it
4. Configure:

**Node Name:** `Save User Message to Database`

**Settings:**
- **Method:** POST
- **URL:** `https://YOUR-DEPLOYED-APP-URL.com/api/conversations/whatsapp`
  *(Replace with your actual deployed app URL)*

**Body → JSON:**
```json
{
  "sessionId": "whatsapp_{{ $('WhatsApp Trigger').item.json.messages[0].from }}",
  "message": "{{ $('Edit Fields').item.json.text }}",
  "sender": "user",
  "channel": "whatsapp",
  "whatsappMessageId": "{{ $('WhatsApp Trigger').item.json.messages[0].id }}",
  "whatsappPhoneNumber": "{{ $('WhatsApp Trigger').item.json.messages[0].from }}",
  "whatsappProfileName": "{{ $('WhatsApp Trigger').item.json.contacts[0].profile.name }}"
}
```

**Options:**
- **Continue On Fail:** ✅ Enabled
  *(This ensures WhatsApp works even if database save fails)*

**Connect:**
- **Input:** From "Edit Fields"
- **Output:** To "AI Agent"

---

### Step 2: Add "Save Bot Response" Node

**Location:** Between "AI Agent" and "Send WhatsApp Reply"

1. Click **+** button after "AI Agent" node
2. Search for **"HTTP Request"**
3. Add it
4. Configure:

**Node Name:** `Save Bot Response to Database`

**Settings:**
- **Method:** POST
- **URL:** `https://YOUR-DEPLOYED-APP-URL.com/api/conversations/whatsapp`
  *(Same URL as above)*

**Body → JSON:**
```json
{
  "sessionId": "whatsapp_{{ $('WhatsApp Trigger').item.json.messages[0].from }}",
  "message": "{{ $('AI Agent').item.json.output }}",
  "sender": "bot",
  "channel": "whatsapp",
  "whatsappPhoneNumber": "{{ $('WhatsApp Trigger').item.json.messages[0].from }}",
  "whatsappProfileName": "{{ $('WhatsApp Trigger').item.json.contacts[0].profile.name }}"
}
```

**Options:**
- **Continue On Fail:** ✅ Enabled

**Connect:**
- **Input:** From "AI Agent"
- **Output:** To "Send WhatsApp Reply"

---

## 🔄 Your Updated Workflow Flow

```
WhatsApp Trigger
    ↓
If (checks text exists)
    ↓
Edit Fields (extract text)
    ↓
[NEW] Save User Message to Database ← HTTP Request
    ↓
AI Agent (Gemini processing)
    ↓
[NEW] Save Bot Response to Database ← HTTP Request
    ↓
Send WhatsApp Reply
```

## ⚙️ Important Settings

### For BOTH HTTP Request nodes:

**Authentication:** None

**Headers:**
```
Content-Type: application/json
```

**Options → Continue On Fail:** ✅ MUST be enabled

This ensures if the database save fails, WhatsApp still works!

---

## 🚀 Before You Can Test

### You need:

1. **Deploy your web app** (Vercel, Netlify, etc.)
2. **Get your deployed URL** (e.g., `https://skywalkers.vercel.app`)
3. **Replace** `YOUR-DEPLOYED-APP-URL.com` in both HTTP Request nodes
4. **Add environment variables** in your deployment:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

---

## ✅ Testing

1. **Save your n8n workflow**
2. **Send a WhatsApp message** to your business number
3. **Check n8n execution log:**
   - Both HTTP Request nodes should show `200 OK`
4. **Check Supabase:**
   ```sql
   SELECT * FROM conversations 
   WHERE channel = 'whatsapp' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
5. **Check your dashboard:**
   - Go to `/dashboard/conversations`
   - Should see WhatsApp messages!

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────┐
│ WhatsApp Trigger                        │
│ (Receives message)                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ If (check text exists)                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Edit Fields (extract text)              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 🆕 Save User Message to Database        │
│ (HTTP POST to your app)                 │
│ Continue On Fail: ✅                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ AI Agent (Gemini + Tools)               │
│ - Get_Tour_Info                         │
│ - Create_Booking                        │
│ - Send_Telegram_Notification            │
│ - etc.                                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 🆕 Save Bot Response to Database        │
│ (HTTP POST to your app)                 │
│ Continue On Fail: ✅                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Send WhatsApp Reply                     │
│ (Customer receives response)            │
└─────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### "404 Not Found"
- Check your deployed app URL is correct
- Ensure `/api/conversations/whatsapp` route exists
- Verify app is actually deployed

### "500 Internal Server Error"
- Check `SUPABASE_SERVICE_ROLE_KEY` is in environment variables
- Verify database migration was run
- Check deployment logs

### "Connection timeout"
- App might not be deployed yet
- Use ngrok for local testing:
  ```bash
  ngrok http 3000
  # Use ngrok URL in n8n temporarily
  ```

### "WhatsApp works but no database save"
- This is OK! "Continue On Fail" lets it work
- Check n8n execution logs for error details
- Fix the error, then it will save

---

## 📱 What Happens After Setup

Every WhatsApp conversation will be:
- ✅ Saved to Supabase `conversations` table
- ✅ Tagged with `channel='whatsapp'`
- ✅ Visible in `/dashboard/conversations`
- ✅ Searchable and exportable
- ✅ Unified with web chat

---

Need your deployed app URL to complete the setup! 🚀
