# Google Calendar Booking Sync Documentation

## Overview

This system automatically syncs bookings with Google Calendar, displaying the booking status and updating the calendar event when the status changes.

## Features

✅ **Automatic Calendar Event Creation**
- When a booking is created, a Google Calendar event is automatically generated
- The event includes all booking details (customer, tour, date, time, participants, etc.)

✅ **Status Indicators**
- Calendar events display visual status indicators in the event summary:
  - ⏳ [PENDING] - Initial booking status
  - ✅ [CONFIRMED] - When booking is confirmed
  - ✔️ [COMPLETED] - When booking is marked as completed
  - ❌ [CANCELLED] - When booking is cancelled

✅ **Automatic Status Sync**
- When you change a booking status in the dashboard, the Google Calendar event automatically updates
- The event summary and description reflect the new status immediately

## How It Works

### 1. Booking Creation
When a new booking is created via `/api/bookings`:
1. Booking is saved to database with `status: 'pending'`
2. Google Calendar event is created with `⏳ [PENDING]` in the title
3. Event ID is saved to the booking record as `google_calendar_event_id`

### 2. Status Updates
When a booking status is changed via `/api/bookings/[id]`:
1. Booking status is updated in the database
2. System checks if a `google_calendar_event_id` exists
3. If yes, the Google Calendar event is updated with new status emoji and label
4. Calendar event summary changes from `⏳ [PENDING]` to `✅ [CONFIRMED]` (or other status)

### 3. Event Details
Each calendar event includes:
- **Summary**: `{emoji} [{STATUS}] {Tour Name} - {Customer Name}`
- **Description**: Full booking details including:
  - Customer name, email, phone
  - Tour name
  - Number of adults and children
  - Total amount
  - Hotel name (if provided)
  - Booking notes
  - Booking ID for reference
- **Time**: Exact tour start and end time
- **Reminders**: 
  - 24 hours before
  - 1 hour before
- **Attachments**: Tour image (if available)

## Technical Implementation

### Files Modified

1. **lib/google-calendar.ts**
   - Added status emoji and label logic to `createCalendarEvent()`
   - Added status emoji and label logic to `updateCalendarEvent()`
   - Events now display: `{emoji} [{STATUS}] {Tour} - {Customer}`

2. **app/api/bookings/[id]/route.ts**
   - Added Google Calendar sync when booking status changes
   - Automatic calendar update on status change
   - Error handling ensures booking updates succeed even if calendar fails

### Status Mapping

```typescript
const statusEmoji = 
  booking.status === 'confirmed' ? '✅' : 
  booking.status === 'pending' ? '⏳' : 
  booking.status === 'completed' ? '✔️' : '❌';

const statusLabel = booking.status.toUpperCase();
```

## Usage Examples

### Scenario 1: New Booking
1. Customer books a paragliding tour on the website
2. Booking created with status: `pending`
3. Google Calendar shows: `⏳ [PENDING] Tandem Flight - John Doe`

### Scenario 2: Confirming a Booking
1. Admin opens booking in dashboard
2. Changes status from "pending" to "confirmed"
3. Google Calendar automatically updates to: `✅ [CONFIRMED] Tandem Flight - John Doe`

### Scenario 3: Completing a Booking
1. After the tour is completed, admin updates status to "completed"
2. Google Calendar shows: `✔️ [COMPLETED] Tandem Flight - John Doe`

### Scenario 4: Cancelling a Booking
1. Customer cancels, admin updates status to "cancelled"
2. Google Calendar shows: `❌ [CANCELLED] Tandem Flight - John Doe`

## Environment Variables Required

Ensure these are set in your `.env.local` file:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

## Error Handling

The system is designed to be resilient:
- If calendar event creation fails during booking, the booking still succeeds
- If calendar event update fails during status change, the booking status still updates
- All calendar errors are logged for debugging
- Users receive their booking confirmation even if calendar sync fails

## Testing

### Test Calendar Event Creation
1. Create a new booking via the website or API
2. Check Google Calendar for the event with ⏳ [PENDING] status
3. Verify all booking details are in the description

### Test Status Updates
1. Open the bookings dashboard
2. Change a booking status from "pending" to "confirmed"
3. Check Google Calendar - event should show ✅ [CONFIRMED]
4. Try changing to other statuses and verify calendar updates

## Troubleshooting

### Calendar events not appearing
- Verify Google Service Account credentials are correct
- Check that Calendar ID is correct
- Ensure service account has write access to the calendar
- Check server logs for error messages

### Status not updating in calendar
- Verify the booking has a `google_calendar_event_id` saved
- Check server logs when changing booking status
- Ensure Google Calendar API permissions are correct

### Event appears but details are missing
- Check that booking has all required fields populated
- Verify tour image URL is accessible if using attachments

## Benefits

1. **Single Source of Truth**: Calendar automatically reflects booking system
2. **Visual Status**: Quick status identification with emojis
3. **No Manual Updates**: Eliminates manual calendar entry
4. **Real-time Sync**: Calendar updates instantly when status changes
5. **Complete Information**: All booking details available in calendar event
6. **Mobile Access**: View booking status on Google Calendar mobile app

## Future Enhancements

Potential improvements:
- Email notifications when calendar events are created/updated
- Sync deleted bookings (remove from calendar)
- Color coding based on status
- Support for multiple calendars (different tours/pilots)
- Bulk status updates with batch calendar sync
