# Deploy Chatbot Conversations with Email Collection

## ✅ What's Been Implemented

### 1. Email Collection Form
- Users must provide name and email before chatting
- Information stored in sessionStorage for persistence
- Personalized greeting using customer name

### 2. Enhanced Database Schema
- `customer_email` and `customer_name` fields added
- Indexed for fast searching by email
- All messages linked to customer identity

### 3. Updated Components
- **Chatbot**: Shows email form first, then chat interface
- **API**: Saves customer info with every message
- **Admin Dashboard**: Displays customer name/email prominently

## 🚀 Deployment Steps

### Step 1: Update Supabase Database

Go to your **Supabase Dashboard** → SQL Editor and run:

```sql
-- Drop existing table to fix schema
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table for chatbot with email tracking
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  visitor_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_customer_email ON conversations(customer_email);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for chatbot)
CREATE POLICY "Allow public insert" ON conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON conversations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access" ON conversations
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Step 2: Test the Implementation

Run the test script to verify everything works:

```bash
node test-conversation-storage.js
```

Expected output:
```
✅ User message saved successfully
✅ Bot response saved successfully
🎉 SUCCESS! Conversation storage is working correctly!
```

### Step 3: Test in Browser

1. Open your website (localhost:3001 or your production URL)
2. Click the chat button
3. Fill in name and email
4. Send a test message
5. Check `/dashboard/conversations` to see it saved

## 📊 Benefits

### For You (Admin):
✅ **Track All Customers**: Every chat linked to an email
✅ **Follow Up Easily**: Contact customers after chat
✅ **See History**: View all conversations per customer
✅ **Lead Generation**: Collect emails automatically
✅ **Better Support**: Know who you're talking to

### For Customers:
✅ **Personalized Service**: Greeted by name
✅ **Continuity**: Their info remembered in session
✅ **Professional**: More trust-worthy than anonymous chat

## 🎯 How It Works

### Customer Flow:
1. Customer clicks chat button
2. **Email form appears first** (name + email required)
3. After submitting → normal chat interface
4. Bot greets them by name: "Hello {name}!"
5. All messages saved with their email

### Admin View:
1. Go to `/dashboard/conversations`
2. See list of chats with customer names/emails
3. Click any conversation to view full history
4. Search by name, email, or message content

## 📧 Features

### Email Collection Form
- Clean, professional design
- Required fields (name + email)
- Email validation
- Stored in sessionStorage (persists across page reloads)
- Only shows once per session

### Admin Dashboard
- Customer name displayed prominently
- Email shown in blue for easy identification
- Search by customer name, email, or message
- Statistics: total sessions, messages, averages
- Real-time refresh button

## 🔍 Searching Conversations

You can search by:
- Customer name
- Customer email
- Session ID
- Message content
- Any visitor info

## 📈 Next Steps (Optional Enhancements)

### 1. Link to CRM
```sql
-- Add foreign key to customers table
ALTER TABLE conversations 
ADD COLUMN customer_id UUID REFERENCES customers(id);
```

### 2. Email Notifications
- Send email to admin when new chat starts
- Send follow-up email to customer after chat

### 3. Analytics
- Track conversion rate (chats → bookings)
- Most common questions
- Response time metrics

### 4. Export Data
- Add CSV export button
- Export conversations by date range
- Email transcripts to customers

## 🐛 Troubleshooting

### Issue: "Could not find the 'message' column"
**Solution**: Run the SQL script from Step 1 to recreate the table

### Issue: No conversations showing
**Solution**: 
1. Check Supabase RLS policies are correct
2. Verify SUPABASE_SERVICE_ROLE_KEY in .env.local
3. Check browser console for errors

### Issue: Email form not showing
**Solution**: 
1. Clear sessionStorage in browser DevTools
2. Refresh the page
3. Click chat button again

## ✨ Summary

You now have a professional chatbot that:
- ✅ Collects customer name and email before chatting
- ✅ Saves all conversations to Supabase  
- ✅ Shows customer info in admin dashboard
- ✅ Allows searching by customer details
- ✅ Maintains conversation history per customer
- ✅ Generates leads automatically

**Access your conversations at**: `/dashboard/conversations`

---

**Questions?** Check the detailed guides:
- [CONVERSATIONS_SETUP_GUIDE.md](./CONVERSATIONS_SETUP_GUIDE.md) - Full setup documentation
- [CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md) - Chatbot integration details
