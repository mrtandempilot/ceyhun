# Telegram Tour Inquiry Setup Guide

## 📋 Overview

This n8n workflow automatically detects when customers ask about tours on Telegram and responds with tour pictures and information from your Supabase database.

## 🎯 How It Works

1. **Customer sends message** on Telegram (e.g., "I want to book paragliding")
2. **Workflow detects keywords** like "paragliding", "diving", "boat", etc.
3. **Fetches matching tours** from Supabase `tour_packages` table
4. **Sends tour photos** with details (name, price, duration, booking link)

## 🚀 Setup Instructions

### Step 1: Import Workflow to n8n

1. Open your n8n instance
2. Click **"Workflows"** → **"Import from File"**
3. Select `telegram-tour-inquiry.json`
4. Click **"Import"**

### Step 2: Configure Supabase Connection

1. In the workflow, click on **"Fetch Tours from Supabase"** node
2. Click **"Create New Credential"** for PostgreSQL
3. Enter your Supabase database credentials:
   - **Host**: `your-project.supabase.co` (from Supabase dashboard)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your Supabase database password
   - **Port**: `5432`
   - **SSL**: Enable SSL

4. Save the credential as **"Supabase PostgreSQL"**
5. Apply the same credential to the **"Get Telegram Bot Token"** node

### Step 3: Get Your Telegram Bot Token

Your bot token should already be stored in your Supabase `credentials` table. If not:

1. Go to Supabase SQL Editor
2. Run this query to check:
```sql
SELECT * FROM credentials WHERE platform = 'telegram';
```

3. If missing, insert it:
```sql
INSERT INTO credentials (platform, credential_key, value)
VALUES ('telegram', 'telegram_bot_token', 'YOUR_BOT_TOKEN_HERE');
```

### Step 4: Activate the Workflow

1. Click the **"Active"** toggle in the top-right corner
2. The workflow is now listening for Telegram messages!

### Step 5: Get the Webhook URL

1. Click on the **"Telegram Webhook"** node
2. Copy the **"Production URL"** (e.g., `https://your-n8n.com/webhook/telegram-tour-inquiry`)
3. You'll need this to connect your Telegram bot

### Step 6: Connect Telegram Bot to n8n

You have two options:

#### Option A: Update Your Existing Telegram Webhook (Recommended)

Modify your existing Telegram webhook handler at `app/api/telegram/webhook/route.ts` to also call the n8n webhook:

```typescript
// After saving the message to database, also trigger n8n workflow
await fetch('https://your-n8n.com/webhook/telegram-tour-inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
```

#### Option B: Set Telegram Webhook Directly to n8n

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-n8n.com/webhook/telegram-tour-inquiry"}'
```

⚠️ **Note**: This will replace your existing webhook. Use Option A if you want to keep both.

## 🔧 Customization

### Add More Tour Keywords

Edit the **"Detect Tour Keywords"** node and add keywords to the `tourKeywords` object:

```javascript
const tourKeywords = {
  paragliding: ['paragliding', 'tandem', 'fly', 'flight'],
  diving: ['diving', 'scuba', 'underwater'],
  boat: ['boat', 'cruise', 'sailing'],
  safari: ['safari', 'jeep', 'adventure'],
  rafting: ['rafting', 'river', 'rapids'],
  // Add your own:
  hiking: ['hiking', 'trekking', 'walk'],
  camping: ['camping', 'tent', 'overnight']
};
```

### Change Response Message Format

Edit the **"Prepare Tour Messages"** node to customize the caption:

```javascript
const caption = `🎯 **${tour.name}**\n\n` +
  `${tour.description}\n\n` +
  `💰 **Price:** ${tour.base_price} ${tour.currency}\n` +
  `⏱️ **Duration:** ${durationText}\n\n` +
  `📅 Book now: https://ceyhun.vercel.app/tours/${tour.slug}`;
```

### Limit Number of Tours Shown

Edit the **"Fetch Tours from Supabase"** node SQL query:

```sql
LIMIT 3;  -- Change to 1, 2, 5, etc.
```

## 🧪 Testing

### Test 1: Send Tour Inquiry

1. Open Telegram and message your bot
2. Send: **"I want to book paragliding"**
3. Expected response:
   - Photo of paragliding tour
   - Tour name, description, price, duration
   - Booking link

### Test 2: Multiple Keywords

Send different messages:
- "diving tour" → Should show diving tours
- "boat trip" → Should show boat tours
- "tandem flight" → Should show paragliding tours

### Test 3: No Match

Send: **"hello"** or **"what's the weather"**
- Should NOT trigger the workflow (no tour keywords)

### Test 4: No Tours in Database

If no tours match the keyword:
- Should send: "Sorry, we couldn't find any tours..."

## 📊 Monitoring

### View Workflow Executions

1. Go to n8n → **"Executions"**
2. See all workflow runs with:
   - Input data (Telegram messages)
   - Output data (sent photos)
   - Errors (if any)

### Check Logs

In each execution, you can see:
- Detected keywords
- Tours fetched from database
- Messages sent to Telegram

## 🐛 Troubleshooting

### Issue: Workflow not triggering

**Solution**: Check that:
1. Workflow is **Active** (toggle in top-right)
2. Webhook URL is correct in Telegram bot settings
3. Your Telegram bot token is valid

### Issue: No tours found

**Solution**: 
1. Check your `tour_packages` table has data:
```sql
SELECT * FROM tour_packages WHERE status = 'active';
```
2. Verify tour names/descriptions contain the keywords

### Issue: Photos not sending

**Solution**:
1. Check `image_urls` field in database has valid URLs
2. Verify URLs are publicly accessible
3. Check Telegram bot token is correct

### Issue: Database connection error

**Solution**:
1. Verify Supabase credentials in n8n
2. Check database password is correct
3. Ensure SSL is enabled

## 📝 Database Requirements

Your `tour_packages` table should have:
- `id` (UUID)
- `name` (TEXT)
- `description` (TEXT)
- `base_price` (DECIMAL)
- `currency` (TEXT)
- `duration_minutes` (INTEGER)
- `image_urls` (TEXT[]) - Array of image URLs
- `slug` (TEXT)
- `status` (TEXT) - Must be 'active' for tours to show

## 🎨 Example Tour Data

```sql
INSERT INTO tour_packages (
  name, 
  description, 
  base_price, 
  currency, 
  duration_minutes, 
  image_urls, 
  slug, 
  status
) VALUES (
  'Tandem Paragliding Flight',
  'Experience the thrill of flying over the beautiful Blue Lagoon!',
  100.00,
  'USD',
  120,
  ARRAY['https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb'],
  'tandem-paragliding',
  'active'
);
```

## 🔗 Integration with Existing System

This workflow works alongside your existing Telegram webhook at `app/api/telegram/webhook/route.ts`. 

**Current flow:**
1. Telegram → Your API → Saves to database → Sends generic reply

**New flow:**
1. Telegram → Your API → Saves to database
2. Your API → n8n webhook → Detects keywords → Sends tour info

Both can run simultaneously!

## 📞 Support

If you encounter issues:
1. Check n8n execution logs
2. Verify Supabase database connection
3. Test Telegram bot token with: `https://api.telegram.org/bot<TOKEN>/getMe`

---

**🎉 You're all set!** Customers can now ask about tours on Telegram and get instant responses with pictures and details.
