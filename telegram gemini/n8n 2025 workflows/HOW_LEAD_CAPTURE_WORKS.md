# 🎯 How Lead Capture Works

## ⚡ Automatic Lead Saving

The **Save_Lead** tool is connected to your AI Agent and saves data to Supabase `leads` table **automatically** during conversations.

## 📍 When Leads Are Saved:

The AI is instructed to call `Save_Lead` tool in these scenarios:

### 1. **After First Interaction** (Recommended)
When customer:
- Asks about tours
- Shows interest in activities
- Mentions dates or budget
- Provides any personal info

### 2. **During Conversation** 
When customer:
- Shares name, email, or phone
- Expresses specific interests
- Changes from browsing to interested

### 3. **Before Leaving** (If no booking)
When customer:
- Says "I'll think about it"
- Asks to be contacted later
- Shows hesitation

## 🤖 AI Decision Making

The AI Agent **automatically decides** when to use Save_Lead based on:
```
"For EVERY conversation, use Save_Lead tool to track:
- Customer interest level (browsing/interested/ready)
- Tours mentioned
- Budget hints
- Preferred dates if mentioned"
```

## 📊 What Gets Saved:

```javascript
{
  name: "Unknown" or actual name,
  email: null or actual email,
  phone: null or actual phone,
  interested_in: "Paragliding, Boat Tour",
  stage: "browsing" | "interested" | "ready",
  source: "telegram",
  preferred_date: "2025-01-15" or null,
  number_of_people: 2 or null,
  notes: "Asked about paragliding prices and weather"
}
```

## 🎯 Current Setup:

**The AI will save leads automatically** because:

1. ✅ Save_Lead tool is connected to AI Agent
2. ✅ System prompt instructs AI to use it for EVERY conversation
3. ✅ Supabase credentials are configured
4. ✅ Maps to your existing `leads` table

## ⚠️ Important Notes:

### The AI might NOT call Save_Lead if:
- Conversation is too short (just "hi" - "bye")
- No meaningful interaction happens
- Customer only asks for contact info

### To Make It More Reliable:

**Option 1: Make it mandatory** (Add to system prompt):
```
CRITICAL: At the end of EVERY conversation (after 2+ messages), 
you MUST use Save_Lead tool before saying goodbye.
```

**Option 2: Manual trigger** (Customer says keyword):
- "Save my info"
- "Contact me later"
- "I'll think about it"

**Option 3: Automatic on exit** (More complex):
- Add a separate workflow that monitors conversation end
- Automatically creates lead after 5 minutes of inactivity

## 🧪 Testing:

To test if it's working:

1. Message your bot: "Hi, I'm interested in paragliding"
2. Bot responds with info
3. Say: "I'll think about it, my email is test@example.com"
4. Check Supabase → leads table
5. You should see a new row!

## 📈 View Your Leads:

Go to Supabase Dashboard:
```
https://supabase.com/dashboard
→ Your Project (skywalker)
→ Table Editor
→ leads table
```

You'll see all captured leads with:
- When they contacted you
- What they're interested in
- Their contact info (if provided)
- Interest stage

## 🔧 Want Guaranteed Saving?

I can modify it to **always save** a lead at the end of every conversation. Would you like me to:

1. **Make lead saving mandatory** (AI must call it)
2. **Add a separate workflow** that auto-saves after conversation
3. **Keep current smart behavior** (AI decides when)

Which approach do you prefer?
