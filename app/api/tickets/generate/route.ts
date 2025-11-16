import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate comprehensive ticket with proper ticket ID
    const generatedTicketId = booking.ticket_id || `TICKET-${booking.id}-${Date.now()}`;
    
    // Create comprehensive QR code data with all tour information
    const qrData = JSON.stringify({
      ticket_id: generatedTicketId,
      booking_id: booking.id,
      customer: booking.customer_name,
      tour: booking.tour_name,
      date: booking.booking_date,
      time: booking.tour_start_time || 'TBD',
      adults: booking.adults,
      children: booking.children,
      total: booking.total_amount,
      status: booking.status
    });
    
    const ticketData = {
      ticket_id: generatedTicketId,
      booking_id: booking.id,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      tour_name: booking.tour_name,
      booking_date: booking.booking_date,
      tour_start_time: booking.tour_start_time,
      duration: booking.duration,
      adults: booking.adults,
      children: booking.children,
      total_amount: booking.total_amount,
      hotel_name: booking.hotel_name,
      notes: booking.notes,
      status: booking.status,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
    };

    // If ticket_id was not present, update the booking with the new ticket_id
    if (!booking.ticket_id) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ ticket_id: ticketData.ticket_id })
        .eq('id', booking_id);

      if (updateError) {
        console.error('Error updating booking with ticket_id:', updateError);
        // Continue without failing the ticket generation, but log the error
      }
    }

    return NextResponse.json(ticketData, { status: 200 });
  } catch (error) {
    console.error('Error generating ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
