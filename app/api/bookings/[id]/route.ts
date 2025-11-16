import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateCalendarEvent } from '@/lib/google-calendar';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update booking status using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update Google Calendar event if it exists
    if (data.google_calendar_event_id) {
      try {
        console.log(`Updating Google Calendar event ${data.google_calendar_event_id} with status: ${status}`);
        await updateCalendarEvent(data.google_calendar_event_id, data);
        console.log('✅ Google Calendar event updated successfully');
      } catch (calendarError) {
        console.error('Failed to update calendar event:', calendarError);
        // Continue even if calendar update fails - booking status is already updated
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch booking to get calendar event ID before deleting
    const { data: bookingToDelete, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('google_calendar_event_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching booking for deletion:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 404 });
    }

    // Delete booking using admin client to bypass RLS
    const { error: deleteError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Delete Google Calendar event if it exists
    if (bookingToDelete?.google_calendar_event_id) {
      try {
        console.log(`Deleting Google Calendar event ${bookingToDelete.google_calendar_event_id}`);
        const { deleteCalendarEvent } = await import('@/lib/google-calendar');
        await deleteCalendarEvent(bookingToDelete.google_calendar_event_id);
        console.log('✅ Google Calendar event deleted successfully');
      } catch (calendarError) {
        console.error('Failed to delete calendar event:', calendarError);
        // Continue even if calendar deletion fails - booking is already deleted
      }
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
