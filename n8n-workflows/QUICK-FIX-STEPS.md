# 🔧 QUICK FIX: Step-by-Step Instructions

## Based on your screenshot, here's EXACTLY what to change:

---

## 🎯 Fix the "Get Booking Details" Node

### Current Value (WRONG):
```
eq.{{ $json.body.booking_id }}
```

### New Value (CORRECT):
```
eq.{{ $json.booking_id }}
```

### How to Change It:

1. Click on the **"Get Booking Details"** node
2. Scroll down to **Query Parameters** section
3. Find the parameter with Name: **id**
4. Click in the **Value** field
5. Delete the current text: `eq.{{ $json.body.booking_id }}`
6. Type the new text: `eq.{{ $json.booking_id }}`
7. Click outside the field or press Enter
8. Click **"Execute Node"** button to test

---

## 🔧 Fix ALL Other Nodes Too

You need to remove `.body` from ALL nodes that reference the webhook data:

### 1. "Payment Successful?" Node
- **OLD:** `={{ $json.body.payment_status }}`
- **NEW:** `={{ $json.payment_status }}`

### 2. "Update Booking Status" Node

**Query Parameter:**
- **OLD:** `=eq.{{ $json.body.booking_id }}`
- **NEW:** `=eq.{{ $json.booking_id }}`

**JSON Body:** (click "JSON" tab in the body section)
- **OLD:**
  ```json
  {
    "status": "confirmed",
    "total_amount": {{ $('Payment Webhook').item.json.body.amount }}
  }
  ```
- **NEW:**
  ```json
  {
    "status": "confirmed",
    "total_amount": {{ $('Payment Webhook').item.json.amount }}
  }
  ```

### 3. "Prepare Ticket Data" Node

Find these two assignments and update:

**payment_amount assignment:**
- **OLD:** `={{ $('Payment Webhook').item.json.body.amount }}`
- **NEW:** `={{ $('Payment Webhook').item.json.amount }}`

**payment_method assignment:**
- **OLD:** `={{ $('Payment Webhook').item.json.body.payment_method }}`
- **NEW:** `={{ $('Payment Webhook').item.json.payment_method }}`

---

## 🧪 Test the Fixed Workflow

### Step 1: Get a Real Booking ID

Run this in Supabase SQL Editor:

```sql
SELECT id, customer_name, customer_phone, booking_date 
FROM public.bookings 
WHERE customer_phone LIKE '+%'
ORDER BY created_at DESC 
LIMIT 1;
```

Copy the `id` value.

### Step 2: Test with Windows Command Prompt

Replace `YOUR-BOOKING-ID-HERE` with the ID from Step 1:

```cmd
curl -X POST https://mvt36n7e.rpcld.com/webhook-test/payment-received -H "Content-Type: application/json" -d "{\"payment_status\":\"succeeded\",\"booking_id\":\"YOUR-BOOKING-ID-HERE\",\"amount\":100,\"payment_method\":\"credit_card\"}"
```

### Step 3: What Should Happen

✅ Workflow completes successfully  
✅ Booking status updated to "confirmed" in Supabase  
✅ Customer receives WhatsApp message with QR code  
✅ You receive Telegram notification  
✅ Response returns success JSON  

---

## 🔍 Still Having Issues?

### Check the Execution Log:

1. Go to **Executions** in n8n sidebar
2. Click on the latest execution
3. Look at each node to see where it fails
4. Take a screenshot of the **INPUT** tab of the failing node
5. Share that screenshot for specific help

### Common Issues:

❌ **"Booking not found" error** 
- Make sure the booking ID exists in Supabase
- Check the ID is a valid UUID format

❌ **"Cannot read property of undefined"**
- You missed updating one of the `.body` references
- Go through each node and verify all expressions

❌ **WhatsApp not sending**
- Phone number must have `+` prefix (e.g., `+905551234567`)
- Check WhatsApp credentials in n8n

---

## ✅ Quick Checklist

- [ ] Updated "Payment Successful?" node expression
- [ ] Updated "Get Booking Details" query parameter
- [ ] Updated "Update Booking Status" query parameter
- [ ] Updated "Update Booking Status" JSON body
- [ ] Updated "Prepare Ticket Data" payment_amount
- [ ] Updated "Prepare Ticket Data" payment_method
- [ ] Tested with curl command
- [ ] Verified booking updated in Supabase
- [ ] Confirmed WhatsApp message sent
- [ ] Confirmed Telegram notification received

---

## 🎯 The Key Point

**Remove `.body` from ALL webhook data references!**

Your webhook sends data like this:
```json
{
  "payment_status": "succeeded",
  "booking_id": "abc-123",
  "amount": 100
}
```

NOT like this:
```json
{
  "body": {
    "payment_status": "succeeded",
    "booking_id": "abc-123"
  }
}
```

So use `$json.booking_id` instead of `$json.body.booking_id` everywhere!

---

**Once you make these changes, save the workflow and test it!** 🚀
