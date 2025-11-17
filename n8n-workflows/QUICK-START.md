# ⚡ Quick Start Guide - 15 Minutes to Full Automation

## 🎯 Goal
Get your 3 new n8n workflows live in 15 minutes

## ✅ Checklist (Do in Order)

### 1️⃣ Import Workflows (5 minutes)
- [ ] Go to https://n8n.io and login
- [ ] Import `02-payment-automation.json`
- [ ] Import `03-pilot-assignment.json`
- [ ] Import `04-preflight-reminders.json`

### 2️⃣ Set Environment Variables (3 minutes)
In n8n Settings → Environment, add:
```
SUPABASE_URL=https://wpprlxuqvrinqefybatt.supabase.co
WHATSAPP_PHONE_NUMBER_ID=825162557352737
FROM_EMAIL=noreply@skywalkers-fethiye.com
TELEGRAM_CHAT_ID=1291038782
VERCEL_APP_URL=https://your-vercel-app.vercel.app
OPENWEATHER_API_KEY=get-from-openweathermap.org
```

### 3️⃣ Get OpenWeather API Key (2 minutes)
- [ ] Go to https://openweathermap.org/api
- [ ] Click "Sign Up" (free)
- [ ] Copy your API key
- [ ] Add to n8n environment: `OPENWEATHER_API_KEY`

### 4️⃣ Configure Supabase Auth (2 minutes)
In each workflow, set credentials:
- [ ] Name: `supabase-auth`
- [ ] Type: HTTP Header Auth
- [ ] Add header: `apikey` = Your Supabase ANON key
- [ ] Add header: `Authorization` = `Bearer YOUR_SERVICE_ROLE_KEY`

### 5️⃣ Update Database (3 minutes)
Run this in Supabase SQL Editor:

```sql
-- Add payment & pilot columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_pilot UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pilot_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pilot_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);

-- Update pilots table
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS total_flights INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en','tr'];
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY['tandem'];
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
```

## 🚀 Activate Workflows

### Workflow #2: Payment Automation
- [ ] Open workflow
- [ ] Click "Execute Workflow" to test
- [ ] Toggle "Active" switch ON
- [ ] Copy webhook URL: `https://your-n8n-instance.app.n8n.cloud/webhook/payment-received`

### Workflow #3: Pilot Assignment
- [ ] Open workflow
- [ ] Test with manual execution
- [ ] Toggle "Active" switch ON
- [ ] Will run automatically every 5 minutes

### Workflow #4: Pre-Flight Reminders
- [ ] Open workflow
- [ ] Test with manual execution
- [ ] Toggle "Active" switch ON
- [ ] Will run automatically daily at 9 AM

## 🧪 Quick Test

### Test Payment Flow:
```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "1",
    "payment_status": "succeeded",
    "amount": 75.00,
    "payment_method": "card"
  }'
```

You should receive:
- ✅ WhatsApp message with ticket
- ✅ Email with ticket
- ✅ Telegram notification
- ✅ Calendar entry created

### Test Pilot Assignment:
1. Create a test booking in Supabase
2. Set `status = 'confirmed'`
3. Leave `assigned_pilot = null`
4. Wait 5 minutes
5. Check: Pilot should be assigned!

### Test Pre-Flight:
1. Create booking for tomorrow
2. Manually run workflow
3. Check WhatsApp for reminder

## 🎉 Done!

Your automation is now live! 

**What happens automatically:**
- 💳 Payment → Instant ticket via WhatsApp & Email
- 👨‍✈️ Pilot assignment every 5 minutes
- 📅 Pre-flight reminders every morning
- 🌤️ Weather safety checks

## 📊 Monitor

Check n8n Dashboard → Executions to see all workflows running.

All notifications go to your Telegram for easy monitoring!

---

## ⚠️ Troubleshooting

**Nothing happening?**
- Check workflow is Active (toggle switch)
- Verify credentials are set
- Check n8n execution logs

**WhatsApp not sending?**
- Verify phone format: +90XXXXXXXXXX
- Check WhatsApp credentials match your existing chatbot

**Weather not working?**
- Verify OpenWeather API key
- Check API limits (60 calls/min free tier)

---

## 🎯 Next Steps

Want more automation?
1. Post-flight photos & reviews
2. Marketing follow-ups
3. Payment reminders
4. Customer loyalty program

Just ask! 🚀
