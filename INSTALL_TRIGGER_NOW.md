# Install Database Trigger - Step by Step

## 🔍 The Problem:
- ✅ Ticket was generated: TICKET-MI4P5E1U-6JKCHQ
- ❌ No execution in n8n
- **This means:** Database trigger is NOT installed yet!

## 📋 Solution - Install the Trigger:

### Step 1: Go to Supabase
1. Open: https://supabase.com/dashboard
2. Select your project: `wpprlxuqvrinqefybatt`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"**

---

### Step 2: Enable pg_net Extension (REQUIRED FIRST!)

Copy and paste this:
```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verify it's enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_net';
```

Click **"Run"** ▶️

**Expected result:** Should show `pg_net` with a version number

---

### Step 3: Install the Trigger

**Option A: Quick Install (Recommended)**

1. Open the file: `database/AUTO_TICKET_GENERATION.sql`
2. Copy ALL the content
3. Paste into Supabase SQL Editor
4. Click **"Run"** ▶️

**Expected result:** Should see "trigger_auto_generate_ticket" in results

---

**Option B: Manual Copy-Paste**

Copy this complete script:

```sql
-- =====================================================
-- AUTOMATIC TICKET GENERATION & SENDING
-- =====================================================

-- Step 1: Create the function that will be triggered
CREATE OR REPLACE FUNCTION auto_generate_ticket()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://skywalkers.app.n8n.cloud/webhook/payment-received';
  payload JSON;
BEGIN
  -- Only trigger if status changed to 'confirmed' and ticket_id is null
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') AND NEW.ticket_id IS NULL THEN
    
    -- Prepare the payload - match n8n workflow structure
    payload := json_build_object(
      'body', json_build_object(
        'booking_id', NEW.id,
        'payment_status', 'succeeded',
        'amount', NEW.total_amount
      )
    );
    
    -- Call the n8n webhook using pg_net extension
    PERFORM
      net.http_post(
        url := webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload::jsonb
      );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_ticket ON bookings;

CREATE TRIGGER trigger_auto_generate_ticket
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket();

-- Step 3: Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';
```

Paste this into Supabase SQL Editor and click **"Run"** ▶️

---

### Step 4: Verify Installation

Run this to check:
```sql
-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation as "fires_on",
  event_object_table as "table_name"
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';
```

**Expected result:** Should show 1 row with:
- trigger_name: `trigger_auto_generate_ticket`
- fires_on: `INSERT` or `UPDATE`
- table_name: `bookings`

---

## ✅ After Installation - Test It!

### Test 1: Create New Booking
1. Go to your dashboard: https://ceyhun.vercel.app/dashboard/bookings
2. Create a new booking with status = `pending`
3. Change status to `confirmed`
4. Save

### Test 2: Check n8n
1. Go to: https://skywalkers.app.n8n.cloud
2. Click **"Executions"**
3. You should see a NEW execution appear!

### Test 3: Check Booking
- Booking should have `ticket_id` populated
- WhatsApp should be sent (if WhatsApp is configured)
- Telegram notification should arrive

---

## 📊 How to Know It's Working:

**Before trigger installed:**
- ❌ No execution in n8n when you confirm booking
- ❌ Manual intervention needed

**After trigger installed:**
- ✅ New execution appears in n8n IMMEDIATELY when you confirm
- ✅ Ticket auto-generated
- ✅ WhatsApp auto-sent
- ✅ Fully automatic!

---

## 🚨 Troubleshooting:

### If pg_net fails to enable:
- You may need to contact Supabase support
- Or check if your plan supports extensions

### If trigger creation fails:
- Check error message
- Make sure you have admin permissions
- Try running each part separately

### If trigger doesn't fire:
- Check if it's installed: `CHECK_IF_TRIGGER_INSTALLED.sql`
- Check Supabase logs for errors
- Verify pg_net is enabled

---

## 🎯 Quick Checklist:

- [ ] Open Supabase SQL Editor
- [ ] Enable pg_net extension
- [ ] Run AUTO_TICKET_GENERATION.sql
- [ ] Verify trigger exists
- [ ] Test with new booking
- [ ] Check n8n executions
- [ ] Confirm ticket generated
- [ ] WhatsApp sent!

---

**Let me know once you've run these steps and I'll help you test!**
