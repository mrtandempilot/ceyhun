# ⚡ Quick Fix: n8n Environment Variables Setup

## 🚨 URGENT: Fix the "Invalid URL" Error

Your workflows are failing because **environment variables are not set in n8n**.

### ✅ Solution (5 minutes):

#### Step 1: Log into n8n
- Go to https://app.n8n.cloud (or your self-hosted n8n URL)
- Log in to your account

#### Step 2: Navigate to Settings
- Click on **Settings** (gear icon) in the left sidebar
- Click on **Environments** or **Variables** tab

#### Step 3: Add ALL These Variables

Copy and paste these, then replace with YOUR actual values:

```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
WHATSAPP_PHONE_NUMBER_ID=YOUR_WHATSAPP_PHONE_ID
FROM_EMAIL=noreply@skywalkers-fethiye.com
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
VERCEL_APP_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
```

**Important:** Click **Save** after adding all variables!

#### Step 4: Restart Workflows
1. Go to **Workflows**
2. For each workflow (Pre-Flight Reminders, Pilot Assignment, Payment Automation):
   - Toggle **OFF** (deactivate)
   - Wait 2 seconds
   - Toggle **ON** (reactivate)

---

## 📝 Where to Get Your Values

### 🔹 SUPABASE_URL
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** (e.g., `https://xyzabcdef.supabase.co`)

### 🔹 WHATSAPP_PHONE_NUMBER_ID
1. Go to https://developers.facebook.com
2. Select your app
3. Go to **WhatsApp** → **API Setup**
4. Copy **Phone Number ID**

### 🔹 FROM_EMAIL
- Your sending email (e.g., `noreply@yourdomain.com`)

### 🔹 TELEGRAM_CHAT_ID
1. Message your Telegram bot
2. Send `/start`
3. Copy the chat ID from the response
4. (Or check your existing n8n chatbot workflow - it's already configured there)

### 🔹 VERCEL_APP_URL
1. Go to https://vercel.com
2. Select your project
3. Copy the deployment URL (e.g., `https://your-app.vercel.app`)

### 🔹 OPENWEATHER_API_KEY
1. Sign up at https://openweathermap.org/api
2. Click **Get API Key** (free tier available)
3. Copy your API key
4. **Wait 10 minutes** for the key to activate

---

## ✅ Verify It's Fixed

### Test the workflow:

1. Go to your **Pre-Flight Reminders** workflow in n8n
2. Click **Execute Workflow** button (manual trigger)
3. Check the execution:
   - ✅ **Success** = It's fixed!
   - ❌ **Error** = Check troubleshooting guide

### What should happen:
- Workflow should run without the "Invalid URL" error
- If there are no bookings for tomorrow, that's OK - it just means no data to process
- The URL should show `https://yourproject.supabase.co/rest/v1/bookings` (NOT just `/rest/v1/bookings`)

---

## 🆘 Still Getting Errors?

### Common Issues:

**Error: "401 Unauthorized"**
- → Your Supabase credentials need to be configured
- → See TROUBLESHOOTING.md for detailed setup

**Error: "WhatsApp credentials not found"**
- → You need to add WhatsApp credentials in n8n
- → Go to Credentials → Add WhatsApp credential

**Error: "Invalid API key" (OpenWeather)**
- → Wait 10 minutes after creating the API key
- → Verify you copied the full key correctly

---

## 📚 Full Documentation

For complete setup instructions and troubleshooting:
- **TROUBLESHOOTING.md** - Detailed error solutions
- **README.md** - Complete workflow documentation
- **QUICK-START.md** - Step-by-step setup guide

---

## 🎯 Summary Checklist

- [ ] Added ALL 6 environment variables in n8n Settings
- [ ] Saved the variables
- [ ] Deactivated and reactivated all workflows
- [ ] Tested one workflow manually
- [ ] No more "Invalid URL" errors
- [ ] Workflows are running successfully

**Once completed, your workflows will be fully operational!** 🚀
