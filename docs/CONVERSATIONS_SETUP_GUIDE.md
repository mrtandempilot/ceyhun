# Chatbot Conversations Storage - Setup Guide

## Overview
This guide explains how chatbot conversations are stored in Supabase and how to use the admin dashboard to view and manage them.

## ✅ What's Already Implemented

Your chatbot conversations are **already being stored in Supabase**! Here's what's working:

### 1. Database Table: `conversations`
Located in your Supabase project with the following structure:

```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  visitor_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes for Performance:**
- `idx_conversations_session_id` - Fast session lookups
- `idx_conversations_created_at` - Chronological queries

**Row Level Security:**
- ✅ Public can insert (chatbot functionality)
- ✅ Authenticated users can read all (admin dashboard)
- ✅ Service role has full access

### 2. API Endpoints

#### POST `/api/chat` - Send Messages
Automatically stores both user messages and bot responses:

```typescript
// User message is automatically saved
await supabaseAdmin.from('conversations').insert({
  session_id: currentSessionId,
  message: message,
  sender: 'user',
  visitor_info: visitorInfo || null,
  created_at: new Date().toISOString()
});

// Bot response is automatically saved
await supabaseAdmin.from('conversations').insert({
  session_id: currentSessionId,
  message: botResponse,
  sender: 'bot',
  created_at: new Date().toISOString()
});
```

#### GET `/api/chat` - Retrieve Conversations
Two modes:
1. **All sessions**: `GET /api/chat`
2. **Specific session**: `GET /api/chat?sessionId=session_xxxxx`

### 3. Admin Dashboard
Access at: **`/dashboard/conversations`**

Features:
- 📊 View all chat sessions
- 🔍 Search by content, session ID, or visitor info
- 📈 Real-time statistics (total sessions, messages, averages)
- 💬 Message-by-message conversation view
- 👤 Visitor information display
- 🔄 Refresh button for live updates

### 4. Frontend Component
The `components/Chatbot.tsx` component:
- Generates unique session IDs
- Stores session ID in sessionStorage
- Sends messages with session context
- Displays chat history

## 📋 Setup Checklist

### Database Setup
- [x] Run `CREATE_CONVERSATIONS_TABLE.sql` in Supabase SQL Editor
- [x] Verify table exists in Supabase dashboard
- [x] Check Row Level Security policies are enabled
- [x] Confirm indexes are created

### API Configuration
- [x] Chat API route configured at `/app/api/chat/route.ts`
- [x] Supabase admin client imported (`@/lib/supabase-admin`)
- [x] Error handling for database operations
- [x] GET endpoint for retrieving conversations

### Frontend Integration
- [x] Chatbot component includes session management
- [x] SessionStorage persists session IDs
- [x] Admin dashboard created at `/app/dashboard/conversations/page.tsx`

## 🚀 Usage Instructions

### For Visitors (Public)
1. Click the chat button on any page
2. Type a message and send
3. Conversation is automatically saved with a unique session ID
4. Session persists across page refreshes (via sessionStorage)

### For Admins
1. Log in to the dashboard
2. Navigate to `/dashboard/conversations`
3. View all chat sessions in the left panel
4. Click any session to see full conversation history
5. Use search to find specific messages or sessions
6. Monitor real-time statistics at the bottom

## 📊 Data Structure

### Session ID Format
```
session_1699876543210_abc123xyz
```
- Timestamp-based for uniqueness
- Stored in browser sessionStorage
- Persists until tab is closed

### Message Object
```typescript
{
  id: "uuid",
  session_id: "session_xxxxx",
  message: "Message content",
  sender: "user" | "bot",
  visitor_info: {
    // Optional metadata
    userAgent: "...",
    referrer: "...",
    etc.
  },
  created_at: "2025-01-12T13:09:35.000Z"
}
```

## 🔧 Customization Options

### Add Visitor Metadata
Update `components/Chatbot.tsx` to collect visitor info:

```typescript
const sendMessage = async (e: React.FormEvent) => {
  // ... existing code ...
  
  const visitorInfo = {
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: inputValue,
      sessionId: sessionId,
      visitorInfo: visitorInfo  // Add this
    }),
  });
};
```

### Export Conversations
Add export functionality to admin dashboard:

```typescript
const exportToCSV = (sessions: ConversationSession[]) => {
  const rows = sessions.flatMap(session => 
    session.messages.map(msg => ({
      session_id: session.sessionId,
      timestamp: msg.created_at,
      sender: msg.sender,
      message: msg.message
    }))
  );
  
  const csv = [
    ['Session ID', 'Timestamp', 'Sender', 'Message'],
    ...rows.map(r => [r.session_id, r.timestamp, r.sender, r.message])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversations-${new Date().toISOString()}.csv`;
  a.click();
};
```

### Filter by Date Range
Add date filtering to the dashboard:

```typescript
const { data } = await supabaseAdmin
  .from('conversations')
  .select('*')
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .order('created_at', { ascending: false });
```

## 📈 Analytics Queries

### Most Active Hours
```sql
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as message_count
FROM conversations
GROUP BY hour
ORDER BY message_count DESC;
```

### Average Messages Per Session
```sql
SELECT 
  session_id,
  COUNT(*) as message_count,
  MIN(created_at) as first_message,
  MAX(created_at) as last_message
FROM conversations
GROUP BY session_id
ORDER BY message_count DESC;
```

### Busiest Days
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as messages
FROM conversations
GROUP BY date
ORDER BY date DESC;
```

## 🔒 Security & Privacy

### Data Retention
Consider implementing automatic cleanup:

```sql
-- Delete conversations older than 90 days
DELETE FROM conversations 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Anonymization
Remove visitor info for privacy:

```sql
UPDATE conversations 
SET visitor_info = NULL 
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Access Control
Current policies:
- Anonymous users: Can INSERT only (send messages)
- Authenticated users: Can SELECT (view in dashboard)
- Service role: Full access (API operations)

## 🐛 Troubleshooting

### Messages not being stored
1. Check Supabase service role key in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key  ← Required for API
   ```

2. Verify table exists:
   - Go to Supabase Dashboard → Table Editor
   - Look for `conversations` table

3. Check API logs in terminal for database errors

### Admin dashboard shows no conversations
1. Ensure you're authenticated
2. Check RLS policies are correctly set
3. Try refreshing with the refresh button
4. Check browser console for errors

### Session not persisting
- Session IDs use sessionStorage (clears on tab close)
- Check browser doesn't block sessionStorage
- Verify session ID is being sent in API requests

## 📚 Related Documentation

- [CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md) - Full chatbot setup
- [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md) - n8n integration
- [CREATE_CONVERSATIONS_TABLE.sql](./CREATE_CONVERSATIONS_TABLE.sql) - Database schema

## 🎯 Next Steps

1. **Test the setup:**
   - Send test messages through the chatbot
   - View them in `/dashboard/conversations`
   - Verify database storage in Supabase

2. **Customize (optional):**
   - Add visitor metadata collection
   - Implement conversation export
   - Set up data retention policies

3. **Monitor:**
   - Regularly check conversation quality
   - Analyze common questions
   - Improve bot responses based on data

## ✨ Benefits

- **Customer Insights**: Understand what users are asking about
- **Quality Assurance**: Review bot responses for accuracy
- **Lead Generation**: Identify potential customers from conversations
- **Performance Tracking**: Monitor response times and satisfaction
- **Training Data**: Use real conversations to improve AI responses
- **Compliance**: Maintain records for regulatory requirements

---

**Status**: ✅ Fully Implemented and Operational

All chatbot conversations are being automatically saved to Supabase!
