# N8N Workflow Setup Guide for Chatbot

## Current Issue

Your n8n workflow is returning a static response: "Please type your message to start." for every message.

## What You Need to Configure in N8N

Your n8n workflow at `https://mvt36n7e.rpcld.com/webhook/a487d0ab-c749-4703-9125-93e88642d355/chat` needs to:

### 1. **Receive the Webhook Data**
   - The chatbot sends:
     ```json
     {
       "message": "user's message text",
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
     ```

### 2. **Process the User's Message**
   You need to add nodes in n8n to process the incoming message. Common approaches:

   **Option A: OpenAI Integration**
   - Add an "OpenAI" node
   - Use the Chat model (GPT-3.5/GPT-4)
   - Pass the user's message: `{{ $json.message }}`
   - Set a system prompt for your paragliding business context

   **Option B: Other AI Services**
   - Claude (Anthropic)
   - Google's Gemini
   - Local LLM via Ollama
   - Any other AI service

   **Option C: Custom Logic**
   - Use "Function" node to create custom responses
   - Set up conditional logic based on keywords
   - Integrate with your own API

### 3. **Return Dynamic Response**
   Your workflow must return JSON with the AI's response:
   ```json
   {
     "output": "{{ $json.ai_response }}"
   }
   ```

## Example N8N Workflow Setup

Here's a basic workflow structure:

```
1. Webhook (Trigger)
   └─> Receives POST data with user message

2. OpenAI Node (or similar AI service)
   └─> Model: gpt-3.5-turbo or gpt-4
   └─> System Prompt: "You are a helpful assistant for a paragliding tour company in Oludeniz, Turkey. Help customers with bookings, tours, and information."
   └─> User Message: {{ $json.message }}

3. Set Node (Format Response)
   └─> output: {{ $json.choices[0].message.content }}

4. Respond to Webhook
   └─> Returns the formatted response
```

## Quick Fix Steps in N8N

1. **Open your n8n workflow** at the URL you provided
2. **Click on the webhook node** that receives data
3. **Add an AI node** (OpenAI, Claude, etc.)
   - Connect it after the webhook
   - Configure with your API key
   - Set the input to use `{{ $json.message }}`
4. **Add a "Set" node** to format the output
   - Set field name: `output`
   - Set field value: `{{ $json.response }}` (or wherever your AI puts the response)
5. **Make sure the "Respond to Webhook" node** returns the formatted output
6. **Save and activate** the workflow

## Testing Your N8N Workflow

After configuring, test with:

```bash
node test-chat-webhook.js
```

You should see a dynamic response based on your message, not the static "Please type your message to start."

## Common N8N Configuration Issues

### Issue 1: Static Response
**Problem**: Always returns same message
**Solution**: Make sure your response node uses dynamic data from AI, not hardcoded text

### Issue 2: No AI Integration
**Problem**: Workflow doesn't connect to AI service
**Solution**: Add OpenAI/Claude/other AI node and configure with API key

### Issue 3: Wrong Response Format
**Problem**: Response field name doesn't match
**Solution**: Ensure response uses `output`, `response`, or `message` field name

### Issue 4: Workflow Not Active
**Problem**: Workflow is paused
**Solution**: Click "Active" toggle in n8n to enable the workflow

## Recommended N8N Nodes for Chatbot

1. **Webhook** (trigger) - Already configured ✓
2. **OpenAI** - For intelligent responses
3. **Set** - To format response data
4. **Respond to Webhook** - Returns data to chatbot

## Example OpenAI Configuration in N8N

```
Resource: Chat
Operation: Message
Model: gpt-3.5-turbo (or gpt-4)

Messages:
- Role: system
  Content: You are a helpful assistant for Oludeniz paragliding tours. Help customers with bookings, tours, safety questions, and general information about paragliding in Oludeniz, Turkey.

- Role: user  
  Content: {{ $json.message }}

Temperature: 0.7
Max Tokens: 500
```

## Need Help?

Your chatbot frontend is working perfectly. The issue is purely in the n8n workflow configuration. Once you set up the AI processing in n8n, the chatbot will respond dynamically to user messages.
