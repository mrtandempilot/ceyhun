# Clean Setup Guide - Working with Real Data

## 🎯 Objective
Delete all test/old bookings and prepare the system to work with real customer data.

---

## 📋 Step-by-Step Process

### Step 1: Clean All Bookings from Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `wpprlxuqvrinqefybatt`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Cleanup Script**
   - Open the file: `database/CLEAN_ALL_BOOKINGS.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" button
   - ✅ Verify the result shows: `total_bookings: 0`

---

### Step 2: Verify System is Ready for Real Data

#### Check Your APIs are Working:

**A. Test Ticket Generation API**
```bash
# This should return an error since no bookings exist yet
curl -X POST https://ceyhun.vercel.app/api/tickets/generate \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "1"}'
```

**B. Test Booking Creation**
- Go to: https://ceyhun.vercel.app/book
- Try creating a test booking to verify everything works
- Check if it appears in Supabase

---

### Step 3: Configure for Real Bookings

#### Update Your Booking Flow:

1. **Payment Integration** (if needed)
   - Ensure your payment provider webhook is pointing to your n8n workflow
   - Webhook URL should be: `YOUR_N8N_URL/webhook/payment-received`

2. **WhatsApp Integration**
   - Verify WhatsApp Business API is active
   - Test sending messages from n8n

3. **Telegram Notifications**
   - Verify Telegram bot is connected (Chat ID: 1291038782)
   - Test notifications work

---

### Step 4: Import n8n Payment Workflow

1. **Open n8n Dashboard**
   - Go to your n8n instance

2. **Import the Workflow**
   - Click "Workflows" → "Add Workflow" → "Import from File"
   - Select: `n8n-workflows/Payment Automation with Your Ticket API.json`
   - Click "Import"

3. **Activate the Workflow**
   - Open the imported workflow
   - Click the toggle to activate it
   - Note the webhook URL (you'll need this for payment providers)

---

### Step 5: Create Your First Real Booking

#### Option A: Through the Website
1. Go to: https://ceyhun.vercel.app/book
2. Fill in real customer details
3. Select tour, date, and participants
4. Submit the booking
5. Status will be "pending" until payment is received

#### Option B: Through API
```bash
curl -X POST https://ceyhun.vercel.app/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+905551234567",
    "tour_id": 1,
    "booking_date": "2025-11-20",
    "adults": 2,
    "children": 0,
    "status": "pending"
  }'
```

---

### Step 6: Test Complete Payment Flow

**When a real customer pays:**

1. **Payment Received** → Your payment provider sends webhook to n8n
2. **n8n Workflow Triggers:**
   - ✅ Validates payment status = "succeeded"
   - ✅ Fetches booking details from Supabase
   - ✅ Updates booking status to "confirmed"
   - ✅ Generates QR code ticket via API
   - ✅ Sends ticket to customer via WhatsApp
   - ✅ Notifies your team via Telegram

3. **Customer Receives:**
   - WhatsApp message with QR code ticket
   - Email confirmation (if configured)

4. **You Receive:**
   - Telegram notification with booking details
   - Updated booking in dashboard

---

## 🔍 Verification Checklist

After cleaning and before going live:

- [ ] All old bookings deleted from Supabase
- [ ] Bookings table is empty (count = 0)
- [ ] Website booking form works
- [ ] API endpoints respond correctly
- [ ] n8n payment workflow is imported and active
- [ ] WhatsApp API is connected and tested
- [ ] Telegram notifications work
- [ ] Payment webhook URL is configured
- [ ] Google Calendar sync is working (if enabled)

---

## 📊 Monitor Real Bookings

### Supabase Dashboard
```sql
-- View all real bookings
SELECT 
  id,
  customer_name,
  customer_email,
  tour_id,
  booking_date,
  status,
  ticket_id,
  total_amount,
  created_at
FROM bookings
ORDER BY created_at DESC;
```

### Check Booking Status
```sql
-- See booking status breakdown
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM bookings
GROUP BY status;
```

---

## 🚀 You're Ready!

Your system is now clean and ready to handle real customer bookings. The complete automation flow will:
- Receive bookings through your website
- Process payments automatically
- Generate and send QR tickets
- Sync with Google Calendar
- Notify your team
- Track everything in your dashboard

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for database errors
2. Check n8n execution logs for workflow errors
3. Check Vercel logs for API errors
4. Test each component individually

---

**Last Updated:** November 18, 2025
**Status:** Ready for Production ✅
