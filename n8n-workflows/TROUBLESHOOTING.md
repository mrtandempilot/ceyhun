# 🔧 n8n Workflow Troubleshooting Guide

## ❌ Error: Invalid URL - URL must start with "http" or "https"

### Error Message You're Seeing:
```
Invalid URL: /rest/v1/bookings. URL must start with "http" or "https".
```

### 🎯 Root Cause
The workflows are using `{{ $env.SUPABASE_URL }}` environment variable, but **this variable is NOT set in your n8n instance**. 

When the variable is empty/undefined, the URL becomes just `/rest/v1/bookings` instead of the full URL like `https://yourproject.supabase.co/rest/v1/bookings`.

---

## ✅ SOLUTION: Set Environment Variables in n8n

### Option 1: n8n Cloud (Recommended)

1. **Log in to n8n Cloud**: https://app.n8n.cloud
2. **Go to Settings** → **Environments** (or **Variables**)
3. **Add these environment variables**:

```env
SUPABASE_URL=https://your-project-id.supabase.co
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-id
FROM_EMAIL=noreply@skywalkers-fethiye.com
TELEGRAM_CHAT_ID=your-telegram-chat-id
VERCEL_APP_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=your-openweather-api-key
```

4. **Save** the variables
5. **Restart all workflows** (deactivate & reactivate them)

### Option 2: Self-Hosted n8n

If you're running n8n on your own server, you need to set environment variables at the system level.

#### Using Docker Compose:
Edit your `docker-compose.yml`:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-password
      # Add your environment variables here:
      - SUPABASE_URL=https://your-project.supabase.co
      - WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-id
      - FROM_EMAIL=noreply@skywalkers-fethiye.com
      - TELEGRAM_CHAT_ID=your-telegram-chat-id
      - VERCEL_APP_URL=https://your-app.vercel.app
      - OPENWEATHER_API_KEY=your-openweather-key
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
```

Then restart Docker:
```bash
docker-compose down
docker-compose up -d
```

#### Using Environment File:
Create a `.env` file in your n8n directory:

```env
SUPABASE_URL=https://your-project.supabase.co
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-id
FROM_EMAIL=noreply@skywalkers-fethiye.com
TELEGRAM_CHAT_ID=your-telegram-chat-id
VERCEL_APP_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=your-openweather-key
```

Then start n8n with:
```bash
n8n start
```

---

## 📝 Where to Find These Values

### 1. SUPABASE_URL
- Go to your Supabase project: https://app.supabase.com
- Click on your project
- Go to **Settings** → **API**
- Copy the **Project URL** (looks like `https://abcdefghijk.supabase.co`)

### 2. WHATSAPP_PHONE_NUMBER_ID
- Go to your Meta/Facebook Developer account
- Navigate to **WhatsApp** → **API Setup**
- Copy your **Phone Number ID**

### 3. FROM_EMAIL
- Your email address for sending notifications (e.g., `noreply@yourdomain.com`)

### 4. TELEGRAM_CHAT_ID
- Already configured in your existing n8n chatbot workflow
- Or get it by messaging your bot `/start` and checking the chat_id in the response

### 5. VERCEL_APP_URL
- Your deployed Vercel URL (e.g., `https://your-app.vercel.app`)
- Find it in Vercel dashboard

### 6. OPENWEATHER_API_KEY
- Sign up at: https://openweathermap.org/api
- Get a free API key (Free tier: 60 calls/minute)
- Copy the API key from your account dashboard

---

## 🔍 How to Verify It's Fixed

### Test the Workflow:

1. **Go to your workflow** in n8n (e.g., "Pre-Flight Reminders & Weather Check")
2. **Click on the "Get Tomorrow's Bookings" node**
3. **Check the URL field** - it should now show:
   ```
   https://your-project.supabase.co/rest/v1/bookings
   ```
   (NOT just `/rest/v1/bookings`)

4. **Manually execute the workflow**:
   - Click **Execute Workflow** button
   - Check if it runs without errors

5. **Check execution logs**:
   - Go to **Executions** tab
   - Look for the latest run
   - Should show ✅ Success (or at least not the URL error)

---

## 🚨 Other Common Issues

### Issue 2: "Authentication failed" or "401 Unauthorized"

**Cause:** Supabase credentials are not configured correctly.

**Solution:**
1. Go to **Credentials** in n8n
2. Find or create **HTTP Header Auth** credential named "Supabase API Key"
3. Add TWO headers:
   - Header Name: `apikey` → Value: Your Supabase ANON key
   - Header Name: `Authorization` → Value: `Bearer YOUR_SERVICE_ROLE_KEY`

**Where to find keys:**
- Go to Supabase → **Settings** → **API**
- Copy **anon public** key
- Copy **service_role** key (⚠️ Keep this secret!)

### Issue 3: "WhatsApp credentials not found"

**Cause:** WhatsApp credentials are not set up.

**Solution:**
1. Go to **Credentials** in n8n
2. Create **WhatsApp** credential
3. Add your WhatsApp Business API credentials

### Issue 4: Weather API returns error

**Cause:** OpenWeather API key is invalid or missing.

**Solution:**
1. Verify your OpenWeather API key is active
2. Check you haven't exceeded the free tier limits (60 calls/min)
3. Wait ~10 minutes after creating a new API key for it to activate

---

## 📞 Still Having Issues?

### Debug Checklist:
- [ ] All environment variables are set in n8n
- [ ] Workflows have been deactivated and reactivated
- [ ] Supabase credentials have both `apikey` and `Authorization` headers
- [ ] WhatsApp credentials are configured
- [ ] OpenWeather API key is valid
- [ ] Telegram bot token is valid
- [ ] You can access your Supabase database (test with direct API call)

### Test Supabase Connection Manually:
```bash
curl "https://YOUR-PROJECT.supabase.co/rest/v1/bookings?select=*" \
  -H "apikey: YOUR-ANON-KEY" \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"
```

If this returns data, your Supabase setup is correct!

---

## 🎯 Quick Reference: All Required n8n Setup

### Environment Variables:
```
SUPABASE_URL=https://yourproject.supabase.co
WHATSAPP_PHONE_NUMBER_ID=123456789
FROM_EMAIL=noreply@yourdomain.com
TELEGRAM_CHAT_ID=your-chat-id
VERCEL_APP_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=your-api-key
```

### Credentials Needed:
1. ✅ **Supabase API Key** (HTTP Header Auth)
2. ✅ **WhatsApp API** (WhatsApp Business)
3. ✅ **Telegram Bot** (Telegram API)
4. ✅ **Gmail SMTP** (for email node - optional)

---

## ✨ After Fixing

Once you've set the environment variables:

1. **Deactivate all workflows**
2. **Reactivate them one by one**
3. **Test each workflow manually**
4. **Monitor the Executions tab** for the next few hours

Your workflows should now run smoothly! 🚀
