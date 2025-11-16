/**
 * Sync all existing bookings from Supabase to Google Calendar
 * This script reads all bookings without calendar events and creates them
 * 
 * Usage: npx tsx scripts/sync-bookings-to-calendar.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { supabaseAdmin } from '../lib/supabase-admin';
import { createCalendarEvent } from '../lib/google-calendar';
import { Booking } from '../types/booking';

async function syncBookingsToCalendar() {
  console.log('🚀 Starting sync of bookings to Google Calendar...\n');

  try {
    // Fetch all bookings that don't have a calendar event ID
    console.log('📥 Fetching bookings without calendar events...');
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .is('google_calendar_event_id', null)
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      process.exit(1);
    }

    if (!bookings || bookings.length === 0) {
      console.log('✅ No bookings to sync. All bookings already have calendar events!');
      process.exit(0);
    }

    console.log(`📊 Found ${bookings.length} booking(s) to sync\n`);

    let successCount = 0;
    let failCount = 0;

    // Process each booking
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i] as Booking;
      console.log(`\n[${i + 1}/${bookings.length}] Processing booking ${booking.id}`);
      console.log(`   Customer: ${booking.customer_name}`);
      console.log(`   Tour: ${booking.tour_name}`);
      console.log(`   Date: ${booking.booking_date} at ${booking.tour_start_time}`);

      try {
        // Create calendar event
        const eventId = await createCalendarEvent(booking);

        if (eventId) {
          // Update booking with calendar event ID
          const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({ google_calendar_event_id: eventId })
            .eq('id', booking.id);

          if (updateError) {
            console.log(`   ❌ Failed to update booking: ${updateError.message}`);
            failCount++;
          } else {
            console.log(`   ✅ Calendar event created: ${eventId}`);
            successCount++;
          }
        } else {
          console.log(`   ❌ Failed to create calendar event (no event ID returned)`);
          failCount++;
        }
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }

      // Small delay to avoid rate limiting
      if (i < bookings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log(`   Total bookings: ${bookings.length}`);
    console.log(`   ✅ Successfully synced: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n✅ Sync completed! Check your Google Calendar.');
    }

    if (failCount > 0) {
      console.log('\n⚠️  Some bookings failed to sync. Check the errors above.');
      process.exit(1);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncBookingsToCalendar();
