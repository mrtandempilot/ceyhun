# Testing Google Calendar Sync - Quick Guide

## Step 1: Restart Your Development Server

The code changes won't work until you restart the server!

**If using npm:**
1. Stop the current server (Ctrl+C in the terminal)
2. Run: `npm run dev`

**If using a different method, just restart however you normally start your server**

## Step 2: Test with a NEW Booking

The status sync only works for bookings that have a `google_calendar_event_id`. 

### Option A: Create a New Booking
1. Go to your booking page
2. Create a brand new booking
3. This will create a calendar event with `⏳ [PENDING]` status
4. Check Google Calendar - you should see the new format

### Option B: Update Existing Booking Status
1. Go to your bookings dashboard
2. Find a booking that already has a calendar event (has `google_calendar_event_id`)
3. Change its status from "pending" to "confirmed"
4. Check Google Calendar - the event should update to `✅ [CONFIRMED]`

## Step 3: Verify the Changes

Go to your Google Calendar and look for:
- New bookings: `⏳ [PENDING] Tour Name - Customer Name`
- Confirmed bookings: `✅ [CONFIRMED] Tour Name - Customer Name`
- Completed: `✔️ [COMPLETED] Tour Name - Customer Name`
- Cancelled: `❌ [CANCELLED] Tour Name - Customer Name`

## Important Notes

1. **Existing calendar events won't automatically update** - they need to have their status changed to trigger the update
2. **Only bookings with google_calendar_event_id will sync** - new bookings automatically get this ID
3. **Old bookings might not have the event ID** - they were created before calendar sync was implemented

## Troubleshooting

If you still don't see changes:
1. Check browser console for errors
2. Check server terminal for error messages
3. Verify Google Calendar credentials are correct in .env.local
4. Make sure the booking has a `google_calendar_event_id` value in the database
