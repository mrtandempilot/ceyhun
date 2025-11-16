# Sync All Bookings to Google Calendar

This guide explains how to sync all existing bookings from Supabase to Google Calendar.

## Problem
You have bookings in the database that don't have corresponding Google Calendar events. This happens when:
- Bookings were created through the chatbot before the calendar integration existed
- Calendar sync failed during booking creation
- Bookings were manually added to the database

## Solutions

You have **two methods** to sync all bookings to Google Calendar:

### Method 1: Using the Script (Recommended for Local)

Run the sync script from your local machine:

```bash
# Install tsx if you haven't already
npm install

# Run the sync script
npm run sync-calendar
```

The script will:
1. Find all bookings without calendar event IDs
2. Create calendar events for each booking
3. Update the bookings with the calendar event IDs
4. Show progress and results

**Output Example:**
```
🚀 Starting sync of bookings to Google Calendar...

📥 Fetching bookings without calendar events...
📊 Found 5 booking(s) to sync

[1/5] Processing booking abc123
   Customer: John Doe
   Tour: Tandem Paragliding
   Date: 2025-01-15 at 10:00
   ✅ Calendar event created: event_xyz789

[2/5] Processing booking def456
   Customer: Jane Smith
   Tour: Sunset Tour
   Date: 2025-01-16 at 14:30
   ✅ Calendar event created: event_abc456

...

============================================================
📊 Sync Summary:
   Total bookings: 5
   ✅ Successfully synced: 5
   ❌ Failed: 0
============================================================

✅ Sync completed! Check your Google Calendar.
```

### Method 2: Using the API Endpoint (For Production/Vercel)

Call the API endpoint to sync bookings:

**Check how many bookings need syncing:**
```bash
curl https://your-domain.com/api/calendar/sync
```

**Response:**
```json
{
  "count": 5,
  "bookings": [
    {
      "id": "abc123",
      "customer_name": "John Doe",
      "tour_name": "Tandem Paragliding",
      "booking_date": "2025-01-15"
    },
    ...
  ]
}
```

**Sync all bookings:**
```bash
curl -X POST https://your-domain.com/api/calendar/sync
```

**Response:**
```json
{
  "success": true,
  "message": "Sync completed. 5 bookings synced, 0 failed.",
  "synced": 5,
  "failed": 0,
  "total": 5,
  "results": [
    {
      "booking_id": "abc123",
      "customer_name": "John Doe",
      "tour_name": "Tandem Paragliding",
      "success": true,
      "calendar_event_id": "event_xyz789"
    },
    ...
  ]
}
```

## Requirements

Before running the sync, ensure you have:

1. **Google Calendar API configured** with these environment variables:
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

2. **Supabase credentials** configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **For local script:** Node.js and npm installed

## Verification

After syncing, verify the results:

1. **Check Google Calendar**
   - Open your Google Calendar
   - Look for the synced booking events
   - Events should show customer names, tour details, and dates

2. **Check Database**
   - Query bookings table in Supabase
   - Verify `google_calendar_event_id` is populated for synced bookings

3. **Check Dashboard**
   - Go to `/dashboard/bookings`
   - Synced bookings should show calendar icon/badge

## Troubleshooting

### Error: "Failed to create calendar event"
**Possible causes:**
- Google Calendar API credentials are incorrect or expired
- Calendar ID doesn't exist or service account doesn't have access
- API quota exceeded

**Solution:**
1. Verify Google Calendar credentials in `.env.local`
2. Check that the service account has "Make changes to events" permission on the calendar
3. Check Google Cloud Console for API errors

### Error: "Booking date/time format invalid"
**Possible causes:**
- Booking has invalid date or time format in database

**Solution:**
1. Check booking data in Supabase
2. Ensure `booking_date` is in `YYYY-MM-DD` format
3. Ensure `tour_start_time` is in `HH:MM` format

### Some Bookings Failed to Sync
**What to do:**
1. Check the error messages for specific bookings
2. Fix the data in Supabase if needed
3. Run the sync again - it will only process bookings without calendar events

### Rate Limiting
The script includes a 500ms delay between each booking to avoid rate limiting. If you have many bookings (100+), the sync may take a few minutes.

## How It Works

### For Each Booking Without a Calendar Event:

1. **Fetch booking data** from Supabase
2. **Extract booking details:**
   - Customer name and email
   - Tour name and details
   - Date and time
   - Number of participants
   - Hotel and notes

3. **Create calendar event** with:
   - Event title: `[STATUS] Tour Name - Customer Name`
   - Description: All booking details
   - Start time: Booking date + tour start time
   - End time: Start time + duration
   - Reminders: 1 day before and 1 hour before
   - Attachment: Tour image (if available)

4. **Update booking** with calendar event ID

5. **Log result** (success or failure)

## Automatic Sync for Future Bookings

After running this one-time sync, all **future bookings** will automatically sync to Google Calendar because:

1. **Website bookings** use `/api/bookings` endpoint which includes calendar sync
2. **Chatbot bookings** should use `/api/webhooks/bookings` endpoint (see CHATBOT_CALENDAR_SYNC_FIX.md)

## Re-running the Sync

You can safely re-run the sync anytime:
- It only processes bookings without `google_calendar_event_id`
- Already synced bookings are skipped
- No duplicate calendar events will be created

## Files

- **scripts/sync-bookings-to-calendar.ts** - Command-line sync script
- **app/api/calendar/sync/route.ts** - API endpoint for syncing
- **lib/google-calendar.ts** - Calendar integration functions
- **package.json** - Added `sync-calendar` script

## Support

If you encounter issues:
1. Check Vercel logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a single booking first before syncing all
4. Check Google Calendar API quota in Google Cloud Console
