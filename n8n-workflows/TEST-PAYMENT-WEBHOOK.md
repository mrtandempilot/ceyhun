# 🧪 Test Payment Automation Webhook

## Your Webhook URL:
```
https://mvt36n7e.rpcld.com/webhook-test/payment-received
```

**Note:** This is the TEST webhook URL. For production, you'll have a different URL without `-test`.

---

## ✅ Step 1: Get a Real Booking ID

Run this in Supabase SQL Editor to get a booking ID:

```sql
SELECT id, customer_name, customer_phone, tour_name, booking_date 
FROM public.bookings 
WHERE customer_phone LIKE '+%'
ORDER BY created_at DESC 
LIMIT 5;
```

Pick one of the booking IDs from the results.

---

## 🧪 Step 2: Test with curl

### Windows (Command Prompt):
```cmd
cmd
```

### Windows (PowerShell):
```powershell
$body = @{
    body = @{
        payment_status = "succeeded"
        booking_id = "PUT-YOUR-BOOKING-ID-HERE"
        amount = 100
        payment_method = "credit_card"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mvt36n7e.rpcld.com/webhook-test/payment-received" -Method Post -Body $body -ContentType "application/json"
```

### Mac/Linux:
```bash
curl -X POST https://mvt36n7e.rpcld.com/webhook-test/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "payment_status": "succeeded",
      "booking_id": "PUT-YOUR-BOOKING-ID-HERE",
      "amount": 100,
      "payment_method": "credit_card"
    }
  }'
```

---

## 📱 Step 3: Test with Postman

1. Open Postman
2. Create new **POST** request
3. URL: `https://mvt36n7e.rpcld.com/webhook-test/payment-received`
4. Headers:
   - `Content-Type`: `application/json`
5. Body (raw JSON):
```json
{
  "body": {
    "payment_status": "succeeded",
    "booking_id": "PUT-YOUR-BOOKING-ID-HERE",
    "amount": 100,
    "payment_method": "credit_card"
  }
}
```
6. Click **Send**

---

## ✅ What Should Happen:

1. ✅ Booking status updated to "confirmed" in Supabase
2. ✅ QR code ticket generated
3. ✅ WhatsApp message sent to customer (with QR image)
4. ✅ Telegram notification sent to you (Chat ID: 1291038782)
5. ✅ Response returned:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "ticketId": "SKY-XXXXX",
  "bookingId": "your-booking-id"
}
```

---

## 📱 Check Results:

### 1. Check WhatsApp:
- Customer should receive QR code ticket
- Message includes booking details

### 2. Check Telegram:
- You should receive payment notification
- Includes customer & payment info

### 3. Check Supabase:
```sql
SELECT id, customer_name, status, total_amount 
FROM public.bookings 
WHERE id = 'YOUR-BOOKING-ID';
```
- Status should be "confirmed"
- total_amount should be updated

---

## 🔍 Troubleshooting:

### No WhatsApp received:
- Check phone number has `+` prefix
- Verify WhatsApp credentials in n8n

### No Telegram notification:
- Verify Telegram chat ID: 1291038782
- Check Telegram bot token

### Booking not updated:
- Check booking ID is correct
- Verify Supabase credentials

### Webhook error:
- Check workflow is **activated** in n8n
- Look at n8n execution logs for errors

---

## 🎯 Example with Real Data:

If your booking ID is: `67968342-04e5-4b6f-bdd2-8ac04b7bfc80`

```bash
curl -X POST https://mvt36n7e.rpcld.com/webhook-test/payment-received \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "payment_status": "succeeded",
      "booking_id": "67968342-04e5-4b6f-bdd2-8ac04b7bfc80",
      "amount": 2000,
      "payment_method": "cash"
    }
  }'
```

---

## 🚀 Ready to Test!

1. Get a booking ID from Supabase
2. Copy one of the commands above
3. Replace `PUT-YOUR-BOOKING-ID-HERE` with your actual booking ID
4. Run it!
5. Check WhatsApp, Telegram, and Supabase!

**Let me know when you're ready to test!** 🧪✨
