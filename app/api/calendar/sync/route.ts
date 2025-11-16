import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createCalendarEvent } from '@/lib/google-calendar';
import { Booking } from '@/types/booking';

/**
 * POST - Sync all bookings without calendar events to Google Calendar
 * This endpoint can be called from the dashboard to sync existing bookings
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting sync of bookings to Google Calendar...');

    // Fetch all bookings that don't have a calendar event ID
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .is('google_calendar_event_id', null)
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bookings to sync. All bookings already have calendar events!',
        synced: 0,
        failed: 0,
        total: 0
      });
    }

    console.log(`📊 Found ${bookings.length} booking(s) to sync`);

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Process each booking
    for (const booking of bookings as Booking[]) {
      console.log(`Processing booking ${booking.id} - ${booking.customer_name}`);

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
            console.log(`❌ Failed to update booking ${booking.id}:`, updateError.message);
            failCount++;
            results.push({
              booking_id: booking.id,
              customer_name: booking.customer_name,
              tour_name: booking.tour_name,
              success: false,
              error: updateError.message
            });
          } else {
            console.log(`✅ Calendar event created for booking ${booking.id}: ${eventId}`);
            successCount++;
            results.push({
              booking_id: booking.id,
              customer_name: booking.customer_name,
              tour_name: booking.tour_name,
              success: true,
              calendar_event_id: eventId
            });
          }
        } else {
          console.log(`❌ Failed to create calendar event for booking ${booking.id}`);
          failCount++;
          results.push({
            booking_id: booking.id,
            customer_name: booking.customer_name,
            tour_name: booking.tour_name,
            success: false,
            error: 'No event ID returned'
          });
        }
      } catch (error: any) {
        console.log(`❌ Error processing booking ${booking.id}:`, error.message);
        failCount++;
        results.push({
          booking_id: booking.id,
          customer_name: booking.customer_name,
          tour_name: booking.tour_name,
          success: false,
          error: error.message
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('📊 Sync Summary:');
    console.log(`   Total bookings: ${bookings.length}`);
    console.log(`   ✅ Successfully synced: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    return NextResponse.json({
      success: true,
      message: `Sync completed. ${successCount} bookings synced, ${failCount} failed.`,
      synced: successCount,
      failed: failCount,
      total: bookings.length,
      results
    });
  } catch (error: any) {
    console.error('❌ Fatal error in sync:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync bookings' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check how many bookings need to be synced
 */
export async function GET(request: NextRequest) {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_name, tour_name, booking_date')
      .is('google_calendar_event_id', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      count: bookings?.length || 0,
      bookings: bookings || []
    });
  } catch (error: any) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
