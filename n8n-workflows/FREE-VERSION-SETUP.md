# 🆓 n8n Free Version Setup Guide

## ❌ Problem: "Invalid URL" Error

You're seeing this error because **environment variables are a PAID feature** in n8n Cloud.

The original workflows use `{{ $env.SUPABASE_URL }}` which requires a paid plan.

## ✅ Solution: Use FREE Version Workflows

I've created FREE versions that work with n8n's free tier! These workflows use **direct values** instead of environment variables.

---

## 📦 FREE Version Workflows

Use these files instead:
- ✅ `03-pilot-assignment-FREE.json` (instead of 03-pilot-assignment.json)
- ✅ `04-preflight-reminders-FREE.json` (instead of 04-preflight-reminders.json)

---

## 🔧 Setup Instructions (5 Minutes)

### Step 1: Import FREE Workflow

1. Go to your n8n instance
2. Click **Workflows** → **+ Add Workflow**
3. Click **⋮** menu → **Import from File**
4. Select `03-pilot-assignment-FREE.json` or `04-preflight-reminders-FREE.json`
5. The workflow will open in the editor

### Step 2: Replace Placeholders

You need to replace these placeholders with YOUR actual values:

#### 🔹 Replace: `YOUR_SUPABASE_PROJECT_ID`

**Where to find it:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
5. Your project ID is the part before `.supabase.co` (e.g., `abcdefghijk`)

**What to replace:**
- Find: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co`
- Replace with: `https://abcdefghijk.supabase.co` (use YOUR actual project ID)

**Where to replace it:**
- Node: "Get Tomorrow's Bookings" → URL field
- Node: "Get Unassigned Bookings" → URL field
- Node: "Get Available Pilots" → URL field
- Node: "Assign Pilot to Booking" → URL field

#### 🔹 Replace: `YOUR_WHATSAPP_PHONE_NUMBER_ID_HERE`

**Where to find it:**
1. Go to https://developers.facebook.com
2. Select your app
3. Go to **WhatsApp** → **API Setup**
4. Copy your **Phone Number ID**

**What to replace:**
- Find: `YOUR_WHATSAPP_PHONE_NUMBER_ID_HERE`
- Replace with: Your WhatsApp Phone Number ID (e.g., `123456789012345`)

**Where to replace it:**
- Node: "Send Reminder (Good Weather)" → Phone Number ID field
- Node: "Send Weather Warning" → Phone Number ID field
- Node: "Notify Pilot" → Phone Number ID field
- Node: "Notify Pilot (WhatsApp)" → Phone Number ID field
- Node: "Notify Customer" → Phone Number ID field

#### 🔹 Replace: `YOUR_TELEGRAM_CHAT_ID_HERE`

**Where to find it:**
1. Message your Telegram bot with `/start`
2. Copy the chat ID from the response
3. Or check your existing n8n chatbot workflow

**What to replace:**
- Find: `YOUR_TELEGRAM_CHAT_ID_HERE`
- Replace with: Your Telegram Chat ID (e.g., `-1001234567890`)

**Where to replace it:**
- Node: "Notify Staff" → Chat ID field
- Node: "Notify Staff (Telegram)" → Chat ID field

#### 🔹 Replace: `YOUR_OPENWEATHER_API_KEY_HERE`

**Where to find it:**
1. Sign up at: https://openweathermap.org/api
2. Get a free API key
3. Wait ~10 minutes for it to activate

**What to replace:**
- Find: `YOUR_OPENWEATHER_API_KEY_HERE`
- Replace with: Your OpenWeather API key

**Where to replace it:**
- Node: "Get Weather Forecast" → Query Parameters → appid value

---

## 🎯 Quick Replace Method

### Using n8n's Find & Replace:

1. Open the workflow in n8n editor
2. Press `Ctrl+F` (or `Cmd+F` on Mac)
3. Type the placeholder text (e.g., `YOUR_SUPABASE_PROJECT_ID`)
4. Click through each occurrence and replace manually

### OR Edit Each Node:

1. Click on a node (e.g., "Get Tomorrow's Bookings")
2. Find the URL or parameter field
3. Replace the placeholder text with your actual value
4. Click outside the field to save
5. Repeat for all nodes with placeholders

---

## ✅ Verify Setup

### Test the workflow:

1. Click **Execute Workflow** (manual trigger)
2. Check for errors in the execution panel
3. If successful, you'll see green checkmarks ✅
4. If error, double-check you replaced ALL placeholders

### Common mistakes:

- ❌ Forgot to replace in all nodes
- ❌ Used wrong format (e.g., included `https://` twice)
- ❌ OpenWeather API key not activated yet (wait 10 min)
- ❌ WhatsApp Phone Number ID is wrong

---

## 📝 Summary: What Needs Replacing

For **Pilot Assignment** workflow:
```
1. YOUR_SUPABASE_PROJECT_ID (appears 4 times)
2. YOUR_WHATSAPP_PHONE_NUMBER_ID_HERE (appears 2 times)
3. YOUR_TELEGRAM_CHAT_ID_HERE (appears 1 time)
```

For **Pre-Flight Reminders** workflow:
```
1. YOUR_SUPABASE_PROJECT_ID (appears 1 time)
2. YOUR_WHATSAPP_PHONE_NUMBER_ID_HERE (appears 3 times)
3. YOUR_TELEGRAM_CHAT_ID_HERE (appears 1 time)
4. YOUR_OPENWEATHER_API_KEY_HERE (appears 1 time)
```

---

## 🚀 After Setup

Once all placeholders are replaced:

1. **Save** the workflow
2. **Test manually** using "Execute Workflow" button
3. **Activate** the workflow (toggle switch)
4. **Monitor** executions for the first few hours

---

## 💡 Pro Tips

### Save Your Values

Create a notepad file with your values for easy copy/paste:

```
SUPABASE_PROJECT_ID=abcdefghijk
WHATSAPP_PHONE_ID=123456789012345
TELEGRAM_CHAT_ID=-1001234567890
OPENWEATHER_KEY=your-api-key-here
```

### Export After Setup

Once you've configured the workflow:
1. Click **⋮** menu → **Export**
2. Save as backup
3. No need to replace placeholders again if you re-import

---

## 🆘 Still Having Issues?

### Error: "Invalid URL"
- ✅ Check you replaced `YOUR_SUPABASE_PROJECT_ID` everywhere
- ✅ Make sure URL is `https://yourproject.supabase.co/rest/v1/bookings`
- ✅ No extra spaces or characters

### Error: "401 Unauthorized"
- ✅ Supabase credentials need to be configured
- ✅ See main README for credential setup

### Error: "WhatsApp failed"
- ✅ Check you replaced `YOUR_WHATSAPP_PHONE_NUMBER_ID_HERE`
- ✅ Verify WhatsApp credentials are configured in n8n

---

## 📚 Documentation

- **TROUBLESHOOTING.md** - Detailed error solutions
- **README.md** - Complete workflow documentation
- **QUICK-START.md** - Step-by-step setup guide

---

🎉 **That's it!** Your workflows are now configured for n8n FREE version! No environment variables needed!
