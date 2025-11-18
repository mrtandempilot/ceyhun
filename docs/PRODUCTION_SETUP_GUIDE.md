# Production Setup - Automatic Ticket Generation

## 🎯 Complete Automatic Flow - No Manual Commands!

Your n8n webhook: `https://mvt36n7e.rpcld.com/webhook/payment-received`

---

## 📋 Setup Steps (Do This Once)

### Step 1: Clean Old Data (Optional)

1. Open Supabase: https://supabase.com/dashboard
2. Select your project: `wpprlxuqvrinqefybatt`
3. Go to **SQL Editor** → **New Query**
4. Copy and paste from: `database/CLEAN_ALL_BOOKINGS.sql`
5. Click **Run**
6. ✅ Verify: Should show `total_bookings: 0`

---

### Step 2: Enable Automatic Ticket Generation

#### Enable pg_net Extension:
1. In Supabase, go to **Database** → **Extensions**
2. Search for `pg_net`
3. Click **Enable**
4. Wait for confirmation

#### Install the Trigger:
1. Go to **SQL Editor** → **New Query**
2. Copy and paste ALL content from: `database/AUTO_TICKET_GENERATION.sql`
3. Click **Run**
4. ✅ You should see: "trigger_auto_generate_ticket" in the results

---

### Step 3: Verify n8n Workflow is Active

1. Open your n8n: https://mvt36n7e.rpcld.com
2. Go to **Workflows**
3. Find: "Payment Automation with Your Ticket API"
4. Make sure it's **Active** (toggle should be ON)
5. ✅ Webhook URL should be: `https://mvt36n7e.rpcld.com/webhook/payment-received`

---

## ✅ You're Done! How It Now Works:

### Scenario 1: Online Payment Booking
```
1. Customer books on website: https://ceyhun.vercel.app/book
2. Customer pays with credit card
3. 💳 Payment provider sends webhook to n8n
4. ✅ n8n automatically:
   - Updates booking to 'confirmed'
   - Generates ticket with QR code
   - Sends WhatsApp to customer
   - Notifies you via Telegram
→ 100% AUTOMATIC - YOU DO NOTHING!
```

### Scenario 2: Manual/Cash Booking
```
1. Customer calls/WhatsApp you
2. You create booking in dashboard (status: 'pending')
3. Customer pays cash
4. You update booking status to 'confirmed' in dashboard
5. 🔥 Database trigger fires automatically:
   - Calls n8n webhook
   - Generates ticket with QR code
   - Sends WhatsApp to customer
   - Notifies you via Telegram
→ ONE CLICK - THEN AUTOMATIC!
```

---

## 🧪 Test Your Setup

### Test 1: Manual Booking Flow

**Option A: Using Supabase Dashboard**
```sql
-- 1. Create a test booking
INSERT INTO bookings (
  customer_name, 
  customer_email, 
  customer_phone,
  tour_id,
  booking_date,
  adults,
  status,
  total_amount
) VALUES (
  'Test Customer',
  'test@example.com',
  '+905551234567',
  1,
  '2025-11-25',
  2,
  'pending',
  100.00
);

-- 2. Get the booking ID
SELECT id, customer_name, status FROM bookings ORDER BY id DESC LIMIT 1;

-- 3. Update to confirmed (THIS TRIGGERS THE AUTOMATION!)
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = YOUR_BOOKING_ID; -- Replace with actual ID from step 2
```

**What Should Happen:**
- ✅ n8n workflow triggers
- ✅ Ticket generated
- ✅ WhatsApp sent (if phone number is valid)
- ✅ Telegram notification sent to you

**Option B: Using Your Dashboard**
1. Go to: https://ceyhun.vercel.app/dashboard/bookings
2. Create a new booking
3. Change status from 'pending' to 'confirmed'
4. Save
5. 🎫 Ticket should auto-send!

---

### Test 2: Payment Webhook Test

```bash
# Test the n8n webhook directly
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

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "ticketId": "TICKET_12345",
  "bookingId": "1"
}
```

---

## 🔍 Monitor & Debug

### Check if Trigger is Active:
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';
```

### View Recent Bookings:
```sql
SELECT 
  id,
  customer_name,
  customer_phone,
  status,
  ticket_id,
  total_amount,
  created_at,
  updated_at
FROM bookings
ORDER BY updated_at DESC
LIMIT 10;
```

### Check n8n Execution Logs:
1. Open n8n: https://mvt36n7e.rpcld.com
2. Click **Executions** in left sidebar
3. See all webhook calls and their status
4. Click any execution to see detailed logs

---

## 🚨 Troubleshooting

### Ticket Not Sending?

**1. Check Extension is Enabled:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```
Should return a row. If empty, enable it in Database → Extensions.

**2. Check Trigger Exists:**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_generate_ticket';
```

**3. Check n8n Workflow is Active:**
- Open n8n
- Workflow toggle should be ON (green)

**4. Check n8n Execution Logs:**
- Go to Executions tab
- Look for failed executions
- Check error messages

**5. Test Webhook Manually:**
```bash
curl -X POST https://mvt36n7e.rpcld.com/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{"body":{"body":{"booking_id":1,"payment_status":"succeeded","amount":100}}}'
```

---

## 📊 What Happens in Each Step

### Database Trigger Flow:
```
Booking Status Changed → confirmed
         ↓
Database Trigger Fires
         ↓
Calls n8n Webhook (https://mvt36n7e.rpcld.com/webhook/payment-received)
         ↓
n8n Workflow Executes:
  1. Validates payment status ✅
  2. Fetches booking details ✅
  3. Updates booking (already confirmed) ✅
  4. Calls: https://ceyhun.vercel.app/api/tickets/generate ✅
  5. Sends WhatsApp with QR code ✅
  6. Sends Telegram notification ✅
  7. Returns success response ✅
```

---

## 🎬 Production Ready!

**Payment Bookings:** ✅ Fully automatic
**Manual Bookings:** ✅ Auto-send on confirm
**No Commands:** ✅ Everything automatic
**Monitor:** ✅ n8n execution logs + Telegram notifications

---

## 🔐 Security Notes

- ✅ Webhook URL is public but secured by n8n
- ✅ Supabase credentials in n8n workflow
- ✅ Database trigger runs with SECURITY DEFINER
- ✅ All sensitive data in Supabase RLS protected

---

## 📞 Support

If something doesn't work:
1. Check n8n execution logs first
2. Check Supabase logs for errors
3. Verify pg_net extension is enabled
4. Test webhook manually with curl
5. Check booking has valid phone number

---

**Your System is Now 100% Automatic! 🚀**

Payment or manual - tickets send automatically!
No more running commands! Just confirm and go!

---

**Last Updated:** November 18, 2025
**Webhook URL:** https://mvt36n7e.rpcld.com/webhook/payment-received
**Status:** Production Ready ✅
