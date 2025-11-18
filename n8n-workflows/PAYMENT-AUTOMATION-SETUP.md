# 💰 Payment Automation & Ticket Generator - Setup Guide

## 🎯 What This Workflow Does

When a customer pays for their booking:
1. ✅ Receives payment notification via webhook
2. ✅ Updates booking status to "confirmed" in Supabase
3. ✅ Generates QR code ticket
4. ✅ Sends ticket via WhatsApp (with QR image)
5. ✅ Notifies staff via Telegram
6. ✅ Responds to payment system

---

## 📥 Step 1: Import Workflow to n8n

1. Open n8n
2. Click **"+"** → **"Import from File"**
3. Select: `02-payment-automation-FREE.json`
4. Click **Import**

---

## 🔧 Step 2: Configure Webhooks (IMPORTANT!)

### Get Your Webhook URL:

1. Open the workflow in n8n
2. Click on **"Payment Webhook"** node
3. Copy the **Production URL** (looks like):
   ```
   https://YOUR-N8N-URL/webhook/payment-received
   ```
4. **Save this URL** - you'll need it for payment integration!

---

## ✅ Step 3: Verify Credentials

The workflow should automatically use your existing credentials:

- ✅ **Supabase** (Header Auth account)
- ✅ **WhatsApp** (Phone ID: 825162557352737)
- ✅ **Telegram** (Chat ID: 1291038782)

If any credential shows error, click it and re-authenticate.

---

## 🧪 Step 4: Test the Workflow

### Method 1: Use n8n Test Webhook

1. Click **"Payment Webhook"** node
2. Click **"Listen for Test Event"**
3. Use this test data in Postman or curl:

```bash
curl -X POST https://YOUR-N8N-URL/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "payment_status": "succeeded",
      "booking_id": "YOUR-BOOKING-ID-FROM-SUPABASE",
      "amount": 100,
      "payment_method": "credit_card"
    }
  }'
```

Replace:
- `YOUR-N8N-URL` with your actual n8n URL
- `YOUR-BOOKING-ID-FROM-SUPABASE` with a real booking ID from your database

---

## 📊 Expected Workflow Flow:

```
Payment Received (Webhook)
    ↓
Check if payment succeeded
    ↓
Get booking details from Supabase
    ↓
Update booking status to "confirmed"
    ↓
Generate QR code ticket
    ↓
Send WhatsApp ticket with QR
    ↓
Notify Telegram
    ↓
Return success response
```

---

## 🔗 Step 5: Connect to Your Payment System

### Option A: Stripe Integration

Add this to your website's payment success handler:

```javascript
// After successful Stripe payment
await fetch('https://YOUR-N8N-URL/webhook/payment-received', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    body: {
      payment_status: 'succeeded',
      booking_id: bookingId,
      amount: paymentIntent.amount / 100,
      payment_method: 'stripe'
    }
  })
});
```

### Option B: Manual Payment

Create a button in your dashboard to trigger payment confirmation:

```javascript
async function confirmPayment(bookingId, amount) {
  const response = await fetch('https://YOUR-N8N-URL/webhook/payment-received', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      body: {
        payment_status: 'succeeded',
        booking_id: bookingId,
        amount: amount,
        payment_method: 'cash'
      }
    })
  });
  
  const result = await response.json();
  console.log('Ticket generated:', result.ticketId);
}
```

---

## 🎫 What Customer Receives

### WhatsApp Message:
```
🎉 Payment Confirmed!

🎫 Ticket: SKY-A1B2C3D4
👤 Name: John Doe
🪂 Tour: Paragliding Tandem Flight
📅 Date: 2025-11-20
⏰ Time: 10:00
👥 2 Adults, 1 Children

✅ Your booking is confirmed!

Show this QR code on arrival.
📱 Contact: +90 545 616 48 40

See you soon! 🌟
```

Plus a **QR Code** image they can scan.

---

## 📱 What Staff Receives (Telegram):

```
💰 PAYMENT RECEIVED

✅ Booking Confirmed

Customer: John Doe
Email: john@example.com
Phone: +905551234567

Tour: Paragliding Tandem Flight
Date: 2025-11-20
Time: 10:00
Participants: 2 adults, 1 children

Payment: $100
Method: credit_card

🎫 Ticket sent via WhatsApp
✅ Booking status updated
```

---

## ⚙️ Customization Options

### Change WhatsApp Message:

Edit the **"Send WhatsApp Ticket"** node and modify the `caption` field.

### Change Telegram Notification:

Edit the **"Notify Staff (Telegram)"** node and modify the `text` field.

### Add Email Ticket:

1. Add new **"Send Email"** node after "Prepare Ticket Data"
2. Use Gmail SMTP or other email provider
3. Include QR code URL in email HTML

---

## ✅ Activate Workflow

Once tested successfully:

1. Click the **toggle switch** at top to activate
2. Workflow will now process real payments automatically!

---

## 🔍 Troubleshooting

### Webhook not receiving data:
- Check firewall allows incoming webhooks
- Verify webhook URL is correct
- Test with curl first

### Booking not found:
- Make sure booking_id exists in Supabase
- Check Supabase credentials are correct

### WhatsApp not sending:
- Verify phone number has `+` prefix in database
- Check WhatsApp credentials

### Telegram not sending:
- Verify chat ID is correct (1291038782)
- Check Telegram bot token

---

## 🎯 Next Steps

1. ✅ Import workflow
2. ✅ Test with sample booking
3. ✅ Integrate with payment system
4. ✅ Activate workflow
5. ✅ Monitor first real payment

**Your automated ticket generation is ready!** 🎫✨
