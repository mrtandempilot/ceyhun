import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import qrcode from 'qrcode';

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
    const generatedTicketId = booking.ticket_id || `TK-${booking.id}-${Date.now().toString().slice(-6)}`;

    // Create QR code that links to ticket verification page
    const ticketUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:3000`}/ticket/${generatedTicketId}`;

    // Generate QR code data URL locally
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await qrcode.toDataURL(ticketUrl, {
        width: 400,
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('✅ QR code generated successfully');
    } catch (qrError: any) {
      console.error('❌ QR code generation failed:', qrError);
      // Fallback to external service
      qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(ticketUrl)}`;
      console.log('⚠️ Using fallback QR code service');
    }

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
      ticket_url: ticketUrl,
      qr_code_url: qrCodeDataUrl,
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

    // Automatically send email with ticket to customer
    console.log('📧 Sending ticket email to customer...');
    try {
      const { sendEmailNotification, EmailTemplates } = await import('@/lib/email');

      const emailData = {
        customer_name: booking.customer_name,
        tour_name: booking.tour_name,
        total_amount: booking.total_amount,
        booking_date: booking.booking_date,
        tour_start_time: booking.tour_start_time,
        adults: booking.adults,
        children: booking.children,
        customer_phone: booking.customer_phone || '',
        ticket_id: ticketData.ticket_id,
        qr_code_url: ticketData.qr_code_url
      };

      const customerEmailNotification = EmailTemplates.customerBookingConfirmationWithTicket(emailData);
      customerEmailNotification.to = booking.customer_email;

      const customerResult = await sendEmailNotification(customerEmailNotification);
      console.log('📧 Ticket email result:', customerResult ? 'Success' : 'Failed');
    } catch (emailError: any) {
      console.error('📧 Failed to send ticket email:', emailError);
    }

    return NextResponse.json(ticketData, { status: 200 });
  } catch (error) {
    console.error('Error generating ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
