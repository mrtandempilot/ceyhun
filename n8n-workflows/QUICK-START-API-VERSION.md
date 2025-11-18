# 🚀 Quick Start - API-Integrated Payment Workflow

## ✅ Your Workflow is READY TO USE!

I've already configured it with your domain: **ceyhun.vercel.app**

---

## 📥 Step 1: Import to n8n (2 minutes)

1. Open your n8n instance
2. Click **"+"** → **"Import from File"**
3. Select: `02-payment-automation-WITH-API.json`
4. Click **Import**

**That's it!** The workflow is pre-configured with:
- ✅ Your Vercel domain: `https://ceyhun.vercel.app`
- ✅ Your Supabase credentials
- ✅ Your WhatsApp settings
- ✅ Your Telegram chat ID

---

## 🧪 Step 2: Test It (5 minutes)

### Get a Booking ID:

Go to Supabase SQL Editor and run:
```sql
SELECT id FROM public.bookings LIMIT 1;
```

Copy the ID (something like: `c97c1e1e-f1c5-4000-8a6f-f1095ba0d6d3`)

### Test the Workflow:

1. In n8n, click **"Payment Webhook"** node
2. Click **"Listen for Test Event"**
3. Open Command Prompt and run:

```cmd
curl -X POST https://mvt36n7e.rpcld.com/webhook-test/payment-received -H "Content-Type: application/json" -d "{\"body\":{\"payment_status\":\"succeeded\",\"booking_id\":\"PUT-YOUR-BOOKING-ID-HERE\",\"amount\":2000,\"payment_method\":\"cash\"}}"
```

Replace `PUT-YOUR-BOOKING-ID-HERE` with your actual booking ID!

---

## ✨ What Will Happen:

When you run the test:

1. ✅ **Payment Webhook** receives the payment data
2. ✅ **Payment Successful?** checks if payment = "succeeded"
3. ✅ **Get Booking Details** fetches booking from Supabase
4. ✅ **Update Booking Status** changes status to "confirmed"
5. ✅ **Generate Ticket (Your API)** calls `https://ceyhun.vercel.app/api/tickets/generate`
6. ✅ **Send WhatsApp Ticket** sends ticket with QR code to customer
7. ✅ **Notify Staff (Telegram)** sends you a payment notification
8. ✅ **Webhook Response** returns success

---

## 🔍 Verify It Worked:

### Check Supabase:
```sql
SELECT id, ticket_id, status 
FROM public.bookings 
WHERE id = 'YOUR-BOOKING-ID';
```

You should see:
- `status` = "confirmed" ✅
- `ticket_id` = "TICKET-..." ✅

### Check WhatsApp:
- Customer receives QR code ticket ✅

### Check Telegram:
- You receive payment notification ✅

---

## 🎯 Activate for Production

Once testing is successful:

1. Click the **toggle switch** at the top of the workflow
2. Workflow is now **ACTIVE** and will process real payments automatically!

---

## 🔗 How to Trigger from Your App

### When a payment is successful, call the webhook:

```javascript
// After payment succeeds (Stripe, PayPal, etc.)
const response = await fetch('https://YOUR-N8N-URL/webhook/payment-received', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    body: {
      payment_status: 'succeeded',
      booking_id: bookingId,
      amount: paymentAmount,
      payment_method: 'stripe' // or 'cash', 'credit_card', etc.
    }
  })
});
```

Get your webhook URL from the "Payment Webhook" node in n8n!

---

## 🎁 Bonus: What This Gives You

### For Customers:
- 🎫 Instant ticket delivery via WhatsApp
- ✅ Professional QR code
- 📱 All booking details in one message
- 🌟 Great customer experience

### For You:
- 📲 Instant Telegram notification
- 🤖 Zero manual work
- 📊 Automatic status updates
- 💰 Track all payments
- 🎯 Focus on flying, not admin!

---

## ⚠️ Troubleshooting

### Workflow fails at "Generate Ticket (Your API)" node?

**Check:**
1. Is `https://ceyhun.vercel.app` deployed and accessible?
2. Test the API manually:
   ```bash
   curl -X POST https://ceyhun.vercel.app/api/tickets/generate \
     -H "Content-Type: application/json" \
     -d '{"booking_id":"YOUR-BOOKING-ID"}'
   ```
3. Check Vercel logs for errors

### WhatsApp not sending?

**Check:**
- Customer phone has `+` prefix (e.g., `+905551234567`)
- WhatsApp credentials in n8n are valid

### Telegram not sending?

**Check:**
- Chat ID is correct: `1291038782`
- Telegram bot token is valid

---

## 🚀 You're All Set!

Your payment automation with professional ticket generation is ready to go!

**Just import → test → activate!**

No more manual ticket creation. No more copy-pasting. Just automatic, professional service! ✨
