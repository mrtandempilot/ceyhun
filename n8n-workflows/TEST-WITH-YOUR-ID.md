# 🚀 Test Your Workflow NOW!

## Your Booking ID: `c97c1e1e-f1c5-4000-8a6f-f1095ba0d6d3`

---

## ✅ Step-by-Step Test Instructions

### Step 1: Prepare n8n
1. Open your n8n workflow
2. Click on the **"Payment Webhook"** node
3. Click **"Listen for Test Event"**
4. You should see "Waiting for test event..."
5. **Keep this window open!**

---

### Step 2: Run This Exact Command

Open **Windows Command Prompt** (Win + R, type `cmd`, press Enter)

Then copy and paste this EXACT command:

```cmd
curl -X POST https://mvt36n7e.rpcld.com/webhook-test/payment-received -H "Content-Type: application/json" -d "{\"body\":{\"payment_status\":\"succeeded\",\"booking_id\":\"c97c1e1e-f1c5-4000-8a6f-f1095ba0d6d3\",\"amount\":2000,\"payment_method\":\"cash\"}}"
```

Press **Enter**

---

### Step 3: Check n8n

Go back to n8n and you should see:

✅ **Payment Webhook** - Received data  
✅ **Payment Successful?** - Condition passed (TRUE)  
✅ **Get Booking Details** - Retrieved booking from Supabase  
✅ **Update Booking Status** - Updated to "confirmed"  
✅ **Prepare Ticket Data** - Generated QR code  
✅ **Send WhatsApp Ticket** - Sent to customer  
✅ **Notify Staff (Telegram)** - Notification sent to you  
✅ **Webhook Response** - Success response returned  

---

### Step 4: Verify Results

**Check Supabase:**
```sql
SELECT id, status, total_amount 
FROM public.bookings 
WHERE id = 'c97c1e1e-f1c5-4000-8a6f-f1095ba0d6d3';
```

You should see:
- `status` = "confirmed"
- `total_amount` = 2000

**Check WhatsApp:**
- The customer's phone should receive a ticket with QR code

**Check Telegram:**
- You should receive a payment notification

---

## 🎯 Expected Response

After running the curl command, you should see a JSON response like:

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "ticketId": "SKY-C97C1E1E",
  "bookingId": "c97c1e1e-f1c5-4000-8a6f-f1095ba0d6d3"
}
```

---

## 🔍 If It Doesn't Work

1. **Check n8n execution logs**
   - Go to "Executions" in sidebar
   - Click the latest execution
   - See which node failed and what error it shows

2. **Common issues:**
   - ❌ Customer phone doesn't have `+` prefix → WhatsApp won't send
   - ❌ WhatsApp credentials expired → Re-authenticate in n8n
   - ❌ Telegram bot token invalid → Check Telegram credentials

3. **Share the error**
   - Take a screenshot of the failed node
   - Show me the error tab
   - I'll help you fix it!

---

## 🚀 Ready to Test!

**Just run the command above and watch the magic happen!** ✨

The workflow should complete all 8 nodes and:
- Update booking in database ✅
- Send QR ticket via WhatsApp ✅
- Notify you via Telegram ✅
- Return success response ✅

---

**GO AHEAD AND TEST IT NOW!** 🎉
