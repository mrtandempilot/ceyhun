# Chatbot Integration Documentation

## Overview
The paragliding web app now includes an AI-powered chatbot integrated with n8n workflow automation. All conversations are automatically stored in Supabase for analysis and support tracking.

## Components

### 1. Chatbot Component (`components/Chatbot.tsx`)
- **Location**: Bottom-right corner of all pages
- **Features**:
  - Floating chat button with hover effect
  - Expandable chat window (396px width, 512px height)
  - Message history with timestamps
  - User/bot message differentiation
  - Loading indicators
  - Auto-scroll to latest messages
  - Responsive design

### 2. Chat API Route (`app/api/chat/route.ts`)
- **Endpoint**: `/api/chat`
- **Methods**: 
  - POST: Send messages
  - GET: Retrieve conversation history
- **Request Body** (POST):
  ```json
  {
    "message": "User's message text",
    "sessionId": "session_xxxxx (optional)",
    "visitorInfo": { "optional metadata" }
  }
  ```
- **Webhook URL**: `https://mvt36n7e.rpcld.com/webhook/a487d0ab-c749-4703-9125-93e88642d355/chat`
- **Response Format**: Handles multiple n8n response formats:
  - `{ "output": "..." }`
  - `{ "response": "..." }`
  - `{ "message": "..." }`
- **Database Storage**: Both user messages and bot responses are automatically saved to the `conversations` table in Supabase

### 3. Supabase Conversations Table
- **Table**: `conversations`
- **Schema**:
  - `id`: UUID (primary key)
  - `session_id`: TEXT (indexed) - Groups messages by conversation
  - `message`: TEXT - The message content
  - `sender`: TEXT - Either 'user' or 'bot'
  - `visitor_info`: JSONB - Optional metadata about the visitor
  - `created_at`: TIMESTAMP - When the message was sent
- **Security**: Row Level Security enabled
  - Public can insert (for chatbot functionality)
  - Authenticated users can read all (for admin dashboard)
  - Service role has full access

### 4. Admin Dashboard (`app/dashboard/conversations/page.tsx`)
Access at `/dashboard/conversations` to:
- View all chat sessions
- Search conversations by content or session ID
- Track conversation metrics (total sessions, messages, averages)
- Review visitor information
- Monitor chat history in real-time

### 5. Integration
The chatbot is integrated into `components/LayoutWrapper.tsx` and appears on all pages of the application. Sessions are automatically managed with persistent IDs stored in sessionStorage.

## Testing

### 1. Test Webhook Connection
Run the test script to verify the n8n webhook is working:

```bash
node test-chat-webhook.js
```

Expected output:
```
✅ Webhook connection successful!
Response data: { "output": "..." }
```

### 2. Test Database Storage
1. Send a message through the chatbot
2. Check Supabase dashboard > conversations table
3. Verify both user and bot messages are stored
4. Access `/dashboard/conversations` to view in the admin interface

### Manual Testing
1. Open the application: `http://localhost:3001`
2. Click the blue chat button in the bottom-right corner
3. Type a message and press Send
4. Verify the bot responds with the n8n workflow output

## N8N Workflow Configuration

Your n8n webhook should:
1. Accept POST requests
2. Receive JSON body with:
   ```json
   {
     "message": "user message",
     "timestamp": "ISO 8601 timestamp"
   }
   ```
3. Return JSON response with one of:
   - `{ "output": "bot response" }`
   - `{ "response": "bot response" }`
   - `{ "message": "bot response" }`

## Customization

### Change Webhook URL
Edit `app/api/chat/route.ts`:
```typescript
const N8N_WEBHOOK_URL = 'your-new-webhook-url';
```

### Customize Appearance
Edit `components/Chatbot.tsx`:
- Change colors: Modify Tailwind classes (e.g., `bg-blue-600` → `bg-green-600`)
- Adjust size: Modify `w-96` and `h-[32rem]` classes
- Change position: Modify `bottom-6 right-6` classes

### Customize Initial Message
Edit `components/Chatbot.tsx`:
```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: 'Your custom greeting message here!',
    sender: 'bot',
    timestamp: new Date(),
  },
]);
```

## Troubleshooting

### Chatbot not appearing
1. Check that the dev server is running: `npm run dev`
2. Clear browser cache and refresh
3. Check browser console for errors

### Messages not sending
1. Verify n8n webhook is active and running
2. Check network tab in browser DevTools
3. Run test script: `node test-chat-webhook.js`
4. Check API route logs in terminal

### Bot not responding
1. Verify n8n workflow is configured to return proper JSON format
2. Check n8n workflow execution logs
3. Test webhook directly with curl or Postman

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **Input Validation**: Messages are validated for empty content
3. **Error Handling**: Graceful error messages shown to users
4. **CORS**: Configured for Next.js API routes

## Database Queries

### Get all conversations
```typescript
const { data } = await supabaseAdmin
  .from('conversations')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get specific session
```typescript
const { data } = await supabaseAdmin
  .from('conversations')
  .select('*')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: true });
```

### Get conversation statistics
```sql
-- Total conversations
SELECT COUNT(DISTINCT session_id) FROM conversations;

-- Total messages
SELECT COUNT(*) FROM conversations;

-- Messages by sender
SELECT sender, COUNT(*) FROM conversations GROUP BY sender;
```

## Future Enhancements

Potential improvements:
- Load chat history from database on page load
- Export conversations to CSV
- Sentiment analysis on conversations
- User authentication integration
- File upload support
- Rich media messages (images, links, buttons)
- Typing indicators
- Sound notifications
- Mobile-optimized UI
- Multi-language support
- AI-powered conversation insights
- Lead scoring based on conversation content
