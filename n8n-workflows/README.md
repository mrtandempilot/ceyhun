# 🚀 n8n Full Automation Workflows for Skywalkers Tours

Complete automation system for your paragliding tour business using n8n Cloud.

## 📦 What's Included

You already have:
- ✅ **Workflow #1**: AI Chatbot (WhatsApp booking assistant)

I've created for you:
- ✅ **Workflow #2**: Payment Automation & Ticket Generator
- ✅ **Workflow #3**: Smart Pilot Assignment
- ✅ **Workflow #4**: Pre-Flight Reminders & Weather Check

## 🎯 How to Import Workflows

### Step 1: Access n8n Cloud
1. Go to https://n8n.io
2. Log in to your n8n Cloud account

### Step 2: Import Each Workflow
1. Click **Workflows** in the sidebar
2. Click **+ Add Workflow**
3. Click the **⋮** menu → **Import from File**
4. Select the JSON file (e.g., `02-payment-automation.json`)
5. Click **Save**
6. Repeat for each workflow

### Step 3: Configure Credentials

Each workflow needs these credentials (set once, use everywhere):

#### Required Credentials:

1. **Supabase API** (`supabase-auth`)
   - Type: HTTP Header Auth
   - Header Name: `apikey`
   - Header Value: Your Supabase ANON key
   - Also add header: `Authorization` = `Bearer YOUR_SERVICE_ROLE_KEY`

2. **WhatsApp API** (`whatsapp-credentials`)
   - Already configured from your existing chatbot ✅

3. **Telegram Bot** (`telegram-credentials`)
   - Already configured from your existing chatbot ✅

4. **Gmail SMTP** (`smtp-credentials`)
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail
   - Password: Your Gmail App Password

5. **OpenWeather API** (for weather workflow)
   - Get free API key: https://openweathermap.org/api
   - Add to n8n environment variables: `OPENWEATHER_API_KEY`

### Step 4: Set Environment Variables

In n8n Cloud Settings → Environment:

```env
SUPABASE_URL=https://your-project.supabase.co
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-id
FROM_EMAIL=noreply@skywalkers-fethiye.com
TELEGRAM_CHAT_ID=your-telegram-chat-id
VERCEL_APP_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=your-openweather-key
```

---

## 📋 Workflow Details

### Workflow #2: Payment Automation & Ticket Generator

**Trigger:** Webhook (when payment is received)

**What it does:**
1. ✅ Verifies payment succeeded
2. ✅ Gets booking details from Supabase
3. ✅ Updates booking status to "confirmed"
4. ✅ Generates QR code ticket
5. ✅ Sends ticket via WhatsApp (with QR image)
6. ✅ Sends ticket via Email (beautiful HTML)
7. ✅ Adds booking to Google Calendar
8. ✅ Notifies staff via Telegram

**Webhook URL:** `https://your-n8n.app.n8n.cloud/webhook/payment-received`

**How to trigger:**
Your payment provider (Stripe/PayPal) should call this webhook when payment succeeds with:
```json
{
  "booking_id": "123",
  "payment_status": "succeeded",
  "amount": 75.00,
  "payment_method": "card"
}
```

---

### Workflow #3: Smart Pilot Assignment

**Trigger:** Scheduled (runs every 5 minutes)

**What it does:**
1. ✅ Finds bookings without assigned pilot
2. ✅ Gets all active pilots
3. ✅ AI scores pilots based on:
   - Rating & experience
   - Language match
   - Specialty match
   - Workload balance
4. ✅ Assigns best pilot
5. ✅ Notifies pilot via WhatsApp
6. ✅ Notifies customer about their pilot
7. ✅ Notifies staff via Telegram

**AI Selection Logic:**
- Rating: 0-50 points (5 stars = 50 pts)
- Experience: 0-30 points (based on total flights)
- Language match: +20 points
- Specialty match: +10 points

---

### Workflow #4: Pre-Flight Reminders & Weather Check

**Trigger:** Scheduled (daily at 9:00 AM)

**What it does:**
1. ✅ Gets tomorrow's bookings
2. ✅ Fetches weather forecast for each
3. ✅ Analyzes flight safety:
   - Wind speed check (>25 km/h = unsafe)
   - Rain check
   - Cloud coverage
4. ✅ **Good weather:**
   - Sends reminder with instructions
   - Weather details
   - What to bring info
5. ✅ **Bad weather:**
   - Sends warning to customer
   - Offers reschedule options
6. ✅ Notifies pilot about conditions
7. ✅ Notifies staff via Telegram

---

## 🔧 Database Requirements

Make sure your Supabase `bookings` table has these columns:

```sql
-- Add these columns if missing:
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_pilot UUID REFERENCES pilots(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pilot_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pilot_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assignment_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;
```

Make sure your `pilots` table has:
```sql
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS total_flights INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en'];
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY['tandem'];
```

---

## 🚦 Activation Checklist

### Before Activating Each Workflow:

- [ ] Import workflow JSON
- [ ] Configure all credentials
- [ ] Set environment variables
- [ ] Test with sample data
- [ ] Check Telegram notifications work
- [ ] Verify WhatsApp messages send
- [ ] Activate workflow (toggle switch)

### Testing:

**Test Payment Workflow:**
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "your-test-booking-id",
    "payment_status": "succeeded",
    "amount": 75.00,
    "payment_method": "test"
  }'
```

**Test Pilot Assignment:**
1. Create a booking in Supabase with `status='confirmed'` and `assigned_pilot=null`
2. Wait 5 minutes (or manually trigger workflow)
3. Check if pilot was assigned

**Test Pre-Flight:**
1. Create a booking for tomorrow
2. Manually trigger the workflow
3. Check WhatsApp messages

---

## 📱 Integration with Your Next.js App

### Add Payment Webhook Handler

Create: `app/api/webhooks/payment/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Forward to n8n workflow
  const n8nResponse = await fetch(
    'https://your-n8n.app.n8n.cloud/webhook/payment-received',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: body.metadata.booking_id,
        payment_status: body.status,
        amount: body.amount / 100, // Stripe cents to dollars
        payment_method: body.payment_method_types[0]
      })
    }
  );
  
  return NextResponse.json({ success: true });
}
```

---

## 🎨 Customization

### Modify Messages:
Edit the WhatsApp message templates in each workflow's "Send WhatsApp" nodes.

### Change Schedule:
- Pilot assignment: Currently every 5 min → Edit cron expression
- Pre-flight reminder: Currently 9 AM daily → Edit cron expression

### Add More Safety Checks:
Edit the "Analyze Weather Safety" code node to add custom rules.

---

## 📊 Monitoring

### Check Workflow Execution:
1. Go to n8n Dashboard
2. Click **Executions**
3. See all runs, errors, success

### Common Issues:

**Workflow not triggering:**
- Check if workflow is **Active** (toggle on)
- Verify schedule/webhook configuration
- Check n8n logs

**WhatsApp not sending:**
- Verify WhatsApp credentials
- Check phone number format (+country code)
- Verify WhatsApp Business API is active

**Weather data missing:**
- Check OpenWeather API key is valid
- Verify Fethiye coordinates are correct
- API might have rate limits (free tier: 60 calls/min)

---

## 🚀 Next Steps

1. **Import all 3 workflows** ✅
2. **Configure credentials** (one time setup)
3. **Test each workflow** with sample data
4. **Activate workflows** (toggle on)
5. **Monitor for 24 hours** to ensure working
6. **Customize messages** to match your brand

Would you like me to create:
- ⭐ Post-Flight automation (photos + reviews)?
- ⭐ Marketing automation (follow-ups)?
- ⭐ Payment reminders for unpaid bookings?

---

## 💡 Pro Tips

1. **Start with one workflow at a time** - Don't activate all at once
2. **Test thoroughly** - Use test bookings before going live
3. **Monitor Telegram** - All notifications go there for oversight
4. **Check weather accuracy** - OpenWeather forecast is usually accurate 24-48hrs ahead
5. **Backup your workflows** - Export JSON files regularly

---

## 📞 Support

If you encounter issues:
1. Check n8n execution logs
2. Verify all credentials are set
3. Check Supabase data is correct
4. Test webhooks with curl/Postman
5. Review Telegram for error messages

---

🪂 **Happy Flying!** Your business is now fully automated! 🚀
