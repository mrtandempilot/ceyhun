# Chatbot Booking Calendar Sync Fix

## Problem
When bookings are created through the chatbot, they appear in the bookings database but **not in Google Calendar**. This happens because the n8n chatbot workflow creates bookings directly in Supabase, bypassing the `/api/bookings` endpoint which includes the calendar integration.

## Solution
Created a dedicated webhook endpoint at `/api/webhooks/bookings` that:
- ✅ Accepts booking data from n8n
- ✅ Creates the booking in Supabase
- ✅ Syncs to Google Calendar automatically
- ✅ Creates/updates customer records
- ✅ Sends email notifications

## Setup Instructions

### 1. Add Environment Variable

Add the following to your `.env.local` file:

```bash
# n8n Webhook Secret (for secure webhook authentication)
N8N_WEBHOOK_SECRET=your-secret-key-here
```

Replace `your-secret-key-here` with a strong random string (e.g., use `openssl rand -base64 32` to generate one).

### 2. Update n8n Workflow

In your n8n chatbot workflow, modify the booking creation step:

#### Before (Old Method - Direct Database Insert)
```
Supabase Node → Insert booking directly into bookings table
```

#### After (New Method - Use Webhook)
```
HTTP Request Node → POST to webhook endpoint
```

#### Configure the HTTP Request Node:

**URL:**
```
https://your-domain.com/api/webhooks/bookings
```

**Method:** `POST`

**Authentication:** None (we use header instead)

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-api-key": "your-secret-key-here"
}
```

**Body (JSON):**
```json
{
  "customer_email": "{{ $json.customer_email }}",
  "customer_name": "{{ $json.customer_name }}",
  "customer_phone": "{{ $json.customer_phone }}",
  "tour_name": "{{ $json.tour_name }}",
  "booking_date": "{{ $json.booking_date }}",
  "tour_start_time": "{{ $json.tour_start_time }}",
  "adults": {{ $json.adults }},
  "children": {{ $json.children }},
  "duration": {{ $json.duration }},
  "total_amount": {{ $json.total_amount }},
  "hotel_name": "{{ $json.hotel_name }}",
  "notes": "{{ $json.notes }}",
  "status": "pending"
}
```

### 3. Required Fields

The webhook requires these fields:
- ✅ `customer_email` (required)
- ✅ `customer_name` (required)
- ✅ `tour_name` (required)
- ✅ `booking_date` (required) - Format: `YYYY-MM-DD`
- ✅ `tour_start_time` (required) - Format: `HH:MM`

Optional fields:
- `customer_phone`
- `adults` (defaults to 1)
- `children` (defaults to 0)
- `duration` (defaults to 120 minutes)
- `total_amount` (defaults to 0)
- `hotel_name`
- `notes`
- `status` (defaults to "pending")

### 4. Date and Time Format

Ensure your chatbot extracts dates and times in the correct format:

**Date:** `YYYY-MM-DD` (e.g., `2025-01-15`)
**Time:** `HH:MM` in 24-hour format (e.g., `14:30` for 2:30 PM)

### 5. Deploy to Vercel

After making changes, deploy to Vercel:

```bash
git add .
git commit -m "Fix: Add chatbot booking calendar sync webhook"
git push
```

Then add the `N8N_WEBHOOK_SECRET` environment variable in Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add `N8N_WEBHOOK_SECRET` with your secret key
4. Redeploy

## Testing

### Test the Webhook Endpoint

Use this curl command to test:

```bash
curl -X POST https://your-domain.com/api/webhooks/bookings \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here" \
  -d '{
    "customer_email": "test@example.com",
    "customer_name": "Test User",
    "customer_phone": "+1234567890",
    "tour_name": "Tandem Paragliding",
    "booking_date": "2025-01-20",
    "tour_start_time": "10:00",
    "adults": 2,
    "children": 0,
    "duration": 120,
    "total_amount": 200,
    "hotel_name": "Test Hotel",
    "notes": "Test booking from webhook"
  }'
```

### Verify the Results

After testing, check:
1. ✅ Booking appears in `/dashboard/bookings`
2. ✅ Event appears in Google Calendar
3. ✅ Customer record created/updated in `/dashboard/customers`
4. ✅ Email notification sent to admin

### Check Logs

View logs in Vercel to see the webhook processing:
1. Vercel Dashboard → Your Project → Logs
2. Look for messages like:
   - `📥 Booking webhook received`
   - `✅ Booking created: [booking-id]`
   - `📅 Creating calendar event for chatbot booking...`
   - `✅ Calendar event created: [event-id]`

## Troubleshooting

### Issue: "Unauthorized" Error
**Solution:** Check that the `x-api-key` header matches your `N8N_WEBHOOK_SECRET` environment variable.

### Issue: Calendar Event Not Created
**Solution:** 
1. Verify Google Calendar credentials are set correctly
2. Check Vercel logs for calendar API errors
3. Ensure `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` are set

### Issue: Missing Required Fields
**Solution:** Ensure your n8n workflow extracts all required fields:
- customer_email
- customer_name
- tour_name
- booking_date (YYYY-MM-DD format)
- tour_start_time (HH:MM format)

### Issue: Date/Time Format Errors
**Solution:** Use n8n's date formatting nodes:
```javascript
// For booking_date
{{ $now.format('YYYY-MM-DD') }}

// For tour_start_time
{{ $now.format('HH:mm') }}
```

## What Happens When a Booking is Created

1. **Webhook receives data** - Security check with API key
2. **Customer record** - Created or updated in database
3. **Booking record** - Created in Supabase bookings table
4. **Calendar event** - Created in Google Calendar with booking details
5. **Database update** - Booking updated with calendar event ID
6. **Email notification** - Sent to admin about new booking
7. **Response** - JSON response with booking ID and calendar event ID

## Benefits

✅ **Automatic sync** - No manual calendar entry needed
✅ **One source of truth** - Bookings table has calendar event ID
✅ **Customer tracking** - CRM automatically updated
✅ **Email notifications** - Admin notified of new bookings
✅ **Audit trail** - Full logging of booking creation process
✅ **Error handling** - Graceful failures if calendar/email unavailable

## Files Modified

- ✅ `app/api/webhooks/bookings/route.ts` - New webhook endpoint
- ✅ `.env.local.example` - Added N8N_WEBHOOK_SECRET

## Next Steps

1. Update your n8n workflow to use the new webhook endpoint
2. Test with a real booking from the chatbot
3. Verify the booking and calendar event are created
4. Monitor Vercel logs for any issues
