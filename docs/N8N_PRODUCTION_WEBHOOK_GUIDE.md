# n8n Production Webhook Setup Guide

## 🚨 Issue: Webhook Only Working in Test Mode

Your webhook: `https://mvt36n7e.rpcld.com/webhook/payment-received`

---

## 🔍 The Problem

When you test the webhook manually in n8n (clicking "Test" button), it works.  
But when real data comes from your payment provider or database trigger, it doesn't trigger.

**Why?** n8n has TWO webhook URLs:
1. **Test URL** - Only active when you click "Test" in n8n
2. **Production URL** - Active when workflow is running in production

---

## ✅ Solution: Activate Production Mode

### Step 1: Activate Your Workflow in n8n

1. Open n8n: https://mvt36n7e.rpcld.com
2. Open your workflow: "Payment Automation with Your Ticket API"
3. **IMPORTANT:** Click the **Activate** toggle switch (top right)
   - Should show as **ON** (green)
   - Should say "Active"

4. Click on the "Payment Webhook" node
5. You'll see TWO webhook URLs:

```
Test URL: https://mvt36n7e.rpcld.com/webhook-test/payment-received
Production URL: https://mvt36n7e.rpcld.com/webhook/payment-received
```

**Use the PRODUCTION URL (without `-test`)!**

---

### Step 2: Update Your Database Trigger

The SQL trigger should use the **PRODUCTION** webhook URL:

```sql
-- Already updated in: database/AUTO_TICKET_GENERATION.sql
webhook_url TEXT := 'https://mvt36n7e.rpcld.com/webhook/payment-received';
```

✅ This is correct - uses `/webhook/` not `/webhook-test/`

---

### Step 3: Update Your Payment Provider

If you have a payment provider (Stripe, PayPal, iyzico, etc.), make sure it's configured to send webhooks to the **PRODUCTION** URL:

```
https://mvt36n7e.rpcld.com/webhook/payment-received
```

**NOT the test URL:**
```
https://mvt36n7e.rpcld.com/webhook-test/payment-received  ❌ DON'T USE THIS
```

---

## 🧪 How to Test Production Webhook

### Test 1: Direct Webhook Call (Using curl)

```bash
# Test production webhook directly
curl -X POST https://mvt36n7e.rpcld.com/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "body": {
        "booking_id": 1,
        "payment_status": "succeeded",
        "amount": 100.00
      }
    }
  }'
```

**Expected Result:**
- n8n execution should appear in "Executions" tab
- Should return success response
- Ticket should be generated and sent

---

### Test 2: Create Real Booking

1. Go to your website: https://ceyhun.vercel.app/book
2. Fill in booking form with YOUR phone number
3. Create booking (status: pending)
4. In Supabase, update status to 'confirmed':

```sql
-- Get your booking ID
SELECT id, customer_name, status FROM bookings ORDER BY id DESC LIMIT 1;

-- Update to confirmed (triggers automatic ticket!)
UPDATE bookings SET status = 'confirmed' WHERE id = YOUR_BOOKING_ID;
```

5. Check:
   - ✅ n8n execution appears in "Executions" tab
   - ✅ WhatsApp message received
   - ✅ Telegram notification received

---

## 🔍 Troubleshooting

### Problem: Workflow Not Triggering

**Check 1: Is Workflow Active?**
```
n8n → Workflows → Payment Automation → Toggle should be ON (green)
```

**Check 2: Is Production URL Correct?**
```
Should be: /webhook/payment-received
NOT: /webhook-test/payment-received
```

**Check 3: Check n8n Executions**
```
n8n → Executions tab
- If no executions: Webhook not being called
- If executions failed: Check error messages
```

---

### Problem: Webhook Returns 404

**Possible Causes:**
1. Workflow is not active
2. Webhook path is wrong
3. n8n instance is down

**Solution:**
```bash
# Test if n8n is running
curl -I https://mvt36n7e.rpcld.com

# Test webhook endpoint
curl -X POST https://mvt36n7e.rpcld.com/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

### Problem: Webhook Called But Nothing Happens

**Check n8n Execution Logs:**
1. Go to n8n → Executions
2. Find the failed execution
3. Click on it to see details
4. Check which node failed and why

**Common Issues:**
- Missing Supabase credentials
- Invalid booking ID
- WhatsApp API down
- Telegram bot token incorrect

---

## 📋 Production Checklist

Before going live, verify:

- [ ] n8n workflow is **ACTIVE** (toggle ON)
- [ ] Webhook URL uses `/webhook/` not `/webhook-test/`
- [ ] Database trigger has production webhook URL
- [ ] Payment provider webhook configured (if using)
- [ ] Test webhook with curl - works ✅
- [ ] Test with real booking - works ✅
- [ ] WhatsApp messages sent ✅
- [ ] Telegram notifications work ✅

---

## 🎯 Complete Flow - Production

### When Customer Books & Pays:

```
1. Customer fills booking form on website
   ↓
2. Includes phone number (required field now!)
   ↓
3. Creates booking (status: 'pending')
   ↓
4. Payment received from payment provider
   ↓
5. Payment provider sends webhook to n8n:
   https://mvt36n7e.rpcld.com/webhook/payment-received
   ↓
6. n8n workflow triggers (PRODUCTION MODE)
   ↓
7. Updates booking to 'confirmed'
   ↓
8. Generates ticket via API
   ↓
9. Sends WhatsApp with QR code
   ↓
10. Sends Telegram notification to you
```

### When You Manually Confirm:

```
1. Customer books via phone/WhatsApp
   ↓
2. You create booking in dashboard (pending)
   ↓
3. Customer pays cash
   ↓
4. You update status to 'confirmed' in dashboard
   ↓
5. Database trigger fires
   ↓
6. Calls n8n webhook (PRODUCTION):
   https://mvt36n7e.rpcld.com/webhook/payment-received
   ↓
7. n8n workflow executes
   ↓
8. Generates ticket
   ↓
9. Sends WhatsApp
   ↓
10. Sends Telegram notification
```

---

## 🔐 Security Note

Your production webhook is publicly accessible but secured by:
- n8n authentication
- HTTPS encryption
- Workflow logic validation

**Do NOT share:**
- n8n username/password
- Supabase service role key
- WhatsApp/Telegram API tokens

---

## 🚀 Quick Fix Summary

If webhook not working:

1. **Activate workflow** in n8n (toggle ON)
2. **Use production URL** (without `-test`)
3. **Test with curl** to verify
4. **Check n8n Executions** for errors

---

## 📞 Next Steps

1. Activate your n8n workflow
2. Test with curl command above
3. Create a test booking and confirm it
4. Verify you receive WhatsApp + Telegram
5. You're ready for production! 🎉

---

**Last Updated:** November 18, 2025  
**Production Webhook:** https://mvt36n7e.rpcld.com/webhook/payment-received  
**Status:** Ready for Testing ⚡
