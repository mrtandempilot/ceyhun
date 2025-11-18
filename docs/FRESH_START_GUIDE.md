# Fresh Start Guide - Clean All Data (Keep Admin)

## 🎯 Goal
Delete all customer data and start fresh with real production bookings, while keeping your admin account safe.

---

## ⚠️ IMPORTANT - Read Before Proceeding

This will **permanently delete**:
- ✗ All bookings
- ✗ All customers
- ✗ All invoices
- ✗ All conversations (WhatsApp/Email)
- ✗ All customer user accounts

This will **keep**:
- ✅ Admin account (mrtandempilot@gmail.com)
- ✅ Database structure/tables
- ✅ Tours data
- ✅ Pilots data (optional)

**This action cannot be undone!**

---

## 📋 Step-by-Step Process

### Step 1: Verify What Will Be Deleted

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `wpprlxuqvrinqefybatt`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Verification Script**
   - Open file: `database/VERIFY_BEFORE_CLEAN.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run"

4. **Review Results**
   - ✅ Check: Admin user (mrtandempilot@gmail.com) appears in first result
   - ✅ Check: Count of items to be deleted
   - ❌ If admin doesn't appear, **STOP and contact support**

**Example Expected Output:**
```
ADMIN USER TO KEEP
email: mrtandempilot@gmail.com
id: abc123...
created_at: 2024-XX-XX

Bookings to delete: 5
Customers to delete: 3
Invoices to delete: 2
Users to delete (excluding admin): 3
```

---

### Step 2: Clean All Data (Keep Admin)

**Only proceed if Step 1 looks correct!**

1. **In SQL Editor, create a new query**
2. **Open file:** `database/CLEAN_ALL_DATA_KEEP_ADMIN.sql`
3. **Copy ALL the SQL code**
4. **Paste into Supabase SQL Editor**
5. **Click "Run"**
6. **Wait for completion** (may take a few seconds)

---

### Step 3: Verify Cleanup Successful

The script automatically runs verification at the end. Check the results:

**Expected Results:**
```
Bookings: 0
Customers: 0
Invoices: 0
Conversations: 0
Users (should be 1 - admin): 1

Admin user still exists ✅
email: mrtandempilot@gmail.com
```

✅ **Perfect!** Your database is now clean and ready for production.

---

### Step 4: Setup Automatic Ticket Generation

Now that your database is clean, set up the automatic workflow:

1. **Enable pg_net Extension** (if not already)
   - Supabase → Database → Extensions
   - Search "pg_net"
   - Click "Enable"

2. **Install Database Trigger**
   - SQL Editor → New query
   - Open: `database/AUTO_TICKET_GENERATION.sql`
   - Copy and paste all code
   - Click "Run"
   - ✅ Trigger installed!

3. **Activate n8n Workflow**
   - Open: https://mvt36n7e.rpcld.com
   - Find: "Payment Automation with Your Ticket API"
   - Toggle to **ACTIVE** (green)
   - ✅ Workflow active!

---

### Step 5: Create Your First Real Booking

**Test the complete flow:**

1. **Go to booking page:** https://ceyhun.vercel.app/book
2. **Fill in the form** with YOUR real details:
   - Tour type
   - Date and time
   - Number of people
   - **Phone number** (with country code: +90...)
   - Hotel/pickup location
3. **Submit booking**
4. **Booking created with status: "pending"**

---

### Step 6: Test Automatic Ticket Sending

**Manually confirm the booking to trigger auto-send:**

1. **In Supabase SQL Editor:**
```sql
-- Get your new booking ID
SELECT id, customer_name, customer_phone, status 
FROM bookings 
ORDER BY id DESC 
LIMIT 1;

-- Update to confirmed (THIS TRIGGERS AUTO TICKET!)
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = YOUR_BOOKING_ID;  -- Replace with actual ID
```

2. **What happens automatically:**
   - ⚡ Database trigger fires
   - 🔗 Calls n8n webhook
   - 🎫 Ticket generated with QR code
   - 📱 WhatsApp sent to your phone
   - 📬 Telegram notification sent to you

3. **Verify everything worked:**
   - ✅ Check WhatsApp - ticket received?
   - ✅ Check Telegram - notification received?
   - ✅ Check n8n Executions - workflow ran?

---

## 🎉 You're Done!

Your system is now:
- ✅ Clean database with only admin
- ✅ Automatic ticket generation enabled
- ✅ Phone numbers captured in bookings
- ✅ WhatsApp delivery working
- ✅ Ready for real customers

---

## 🔍 Troubleshooting

### Problem: Admin user deleted by mistake

**Prevention:** Always run `VERIFY_BEFORE_CLEAN.sql` first!

**If it happens:**
1. Create new admin account through Supabase Authentication
2. Update email in the app to the new admin email

---

### Problem: Trigger not working

**Check:**
```sql
-- Verify trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- Verify pg_net enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

**Fix:** Re-run `AUTO_TICKET_GENERATION.sql`

---

### Problem: n8n not receiving webhooks

**Check:**
1. n8n workflow is **ACTIVE** (toggle ON)
2. Using production URL: `/webhook/payment-received`
3. Test manually:
```bash
curl -X POST https://mvt36n7e.rpcld.com/webhook/payment-received \
  -H "Content-Type: application/json" \
  -d '{"body":{"body":{"booking_id":1,"payment_status":"succeeded","amount":100}}}'
```

**See:** `docs/N8N_PRODUCTION_WEBHOOK_GUIDE.md`

---

## 📊 Monitor Your Production Data

### View all bookings:
```sql
SELECT 
  id,
  customer_name,
  customer_phone,
  tour_name,
  booking_date,
  status,
  total_amount,
  ticket_id,
  created_at
FROM bookings
ORDER BY created_at DESC;
```

### Check ticket generation:
```sql
SELECT 
  id,
  customer_name,
  customer_phone,
  status,
  ticket_id,
  CASE 
    WHEN ticket_id IS NOT NULL THEN '✅ Has ticket'
    ELSE '⚠️ No ticket yet'
  END as ticket_status
FROM bookings
ORDER BY id DESC;
```

### Revenue tracking:
```sql
SELECT 
  status,
  COUNT(*) as bookings,
  SUM(total_amount) as total_revenue
FROM bookings
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'completed' THEN 1
    WHEN 'confirmed' THEN 2
    WHEN 'pending' THEN 3
    WHEN 'cancelled' THEN 4
  END;
```

---

## 🔐 Security Reminders

After cleanup, **make sure you've secured:**
- ✅ Supabase database credentials
- ✅ n8n workflow credentials
- ✅ WhatsApp API tokens
- ✅ Telegram bot tokens
- ✅ Payment provider webhooks

**Do not share:**
- Admin password
- Supabase service role key
- API keys

---

## 🚀 Production Checklist

Before accepting real customers:

- [ ] Database cleaned and verified
- [ ] Admin account working
- [ ] n8n workflow active
- [ ] Database trigger installed
- [ ] Phone field in booking form (required)
- [ ] Test booking created successfully
- [ ] Test ticket received on WhatsApp
- [ ] Telegram notifications working
- [ ] Payment provider configured (if using)
- [ ] Website live and working

---

## 📞 Need Help?

If something goes wrong:
1. Check n8n execution logs: https://mvt36n7e.rpcld.com
2. Check Supabase logs in dashboard
3. Review: `docs/N8N_PRODUCTION_WEBHOOK_GUIDE.md`
4. Review: `docs/PRODUCTION_SETUP_GUIDE.md`

---

**Last Updated:** November 18, 2025  
**Status:** Production Ready 🎉  
**Admin Email:** mrtandempilot@gmail.com  
**Webhook URL:** https://mvt36n7e.rpcld.com/webhook/payment-received
