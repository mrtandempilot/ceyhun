import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createCalendarEvent } from '@/lib/google-calendar';
import { checkPilotAvailability } from '@/lib/bookings';

/**
 * POST - Webhook endpoint for n8n to create bookings with calendar sync
 * This endpoint is called by n8n chatbot when a booking is created
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret for security
    const apiKey = request.headers.get('x-api-key');
    if (process.env.N8N_WEBHOOK_SECRET && apiKey !== process.env.N8N_WEBHOOK_SECRET) {
      console.error('❌ Unauthorized webhook request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Booking webhook received:', JSON.stringify(body, null, 2));

    const {
      customer_email,
      customer_name,
      customer_phone,
      tour_name,
      booking_date,
      tour_start_time,
      adults,
      children,
      duration,
      total_amount,
      hotel_name,
      notes,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!customer_email || !customer_name || !tour_name || !booking_date || !tour_start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_email, customer_name, tour_name, booking_date, tour_start_time' },
        { status: 400 }
      );
    }

    // Check pilot availability before creating booking
    const requestedPassengers = (adults || 1) + (children || 0);
    try {
      const availability = await checkPilotAvailability(
        booking_date,
        tour_start_time,
        requestedPassengers
      );

      if (!availability.available) {
        console.log('✅ Capacity check passed for chatbot booking');
        return NextResponse.json({
          error: availability.message || 'Not enough pilot capacity for this time slot'
        }, { status: 400 });
      }
    } catch (capacityError: any) {
      console.error('❌ Error checking pilot capacity:', capacityError);
      return NextResponse.json({
        error: 'Unable to verify pilot availability at this time'
      }, { status: 500 });
    }

    // Create or update customer record
    const nameParts = customer_name.trim().split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', customer_email)
      .single();

    let customerId;

    if (!existingCustomer) {
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          name: customer_name,
          first_name: firstName,
          last_name: lastName,
          email: customer_email,
          phone: customer_phone || '',
          status: 'active',
          customer_type: 'individual',
          vip_status: false,
          total_bookings: 1,
          total_spent: total_amount || 0,
          lifetime_value: total_amount || 0,
          average_booking_value: total_amount || 0,
          source: 'chatbot',
          last_booking_date: new Date().toISOString(),
          notes: `Auto-created from chatbot booking on ${new Date().toLocaleDateString()}`
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
      } else {
        customerId = newCustomer?.id;
        console.log('✅ New customer created from chatbot:', customer_email);
      }
    } else {
      customerId = existingCustomer.id;
      await supabaseAdmin
        .from('customers')
        .update({
          last_booking_date: new Date().toISOString(),
          phone: customer_phone || existingCustomer.phone
        })
        .eq('id', customerId);
      console.log('✅ Existing customer found:', customer_email);
    }

    // Create booking in database
    const bookingData = {
      customer_email,
      customer_name,
      customer_phone: customer_phone || null,
      tour_name,
      booking_date,
      tour_start_time,
      adults: adults || 1,
      children: children || 0,
      duration: duration || 120,
      total_amount: total_amount || 0,
      hotel_name: hotel_name || null,
      notes: notes || null,
      channel: 'chatbot',
      status: status,
      created_at: new Date().toISOString(),
    };

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json({ error: bookingError.message }, { status: 400 });
    }

    console.log('✅ Booking created:', booking.id);

    // Update customer statistics
    if (customerId) {
      try {
        const { data: completedBookings } = await supabaseAdmin
          .from('bookings')
          .select('total_amount')
          .eq('customer_email', customer_email)
          .eq('status', 'completed');

        const totalSpent = completedBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
        const totalBookings = completedBookings?.length || 0;

        const { data: allBookings } = await supabaseAdmin
          .from('bookings')
          .select('id')
          .eq('customer_email', customer_email);

        await supabaseAdmin
          .from('customers')
          .update({
            total_bookings: allBookings?.length || 0,
            total_spent: totalSpent,
            lifetime_value: totalSpent,
            average_booking_value: totalBookings > 0 ? totalSpent / totalBookings : 0,
            last_booking_date: new Date().toISOString()
          })
          .eq('id', customerId);
      } catch (updateError) {
        console.error('Error updating customer stats:', updateError);
      }
    }

    // Create Google Calendar event
    try {
      console.log('📅 Creating calendar event for chatbot booking...');
      const eventId = await createCalendarEvent(booking);
      
      if (eventId) {
        // Update booking with calendar event ID
        await supabaseAdmin
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', booking.id);

        booking.google_calendar_event_id = eventId;
        console.log('✅ Calendar event created:', eventId);
      }
    } catch (calendarError) {
      console.error('❌ Failed to create calendar event:', calendarError);
      // Continue even if calendar creation fails
    }

    // Send email notification to admin
    console.log('📧 Attempting to send booking email notification...');
    try {
      const { sendEmailNotification, EmailTemplates } = await import('@/lib/email');
      
      const emailData = {
        customer_name: booking.customer_name,
        tour_name: booking.tour_name,
        total_amount: booking.total_amount,
        booking_date: booking.booking_date,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone || ''
      };

      const emailNotification = EmailTemplates.bookingNotification(emailData);
      emailNotification.to = 'faralyaworks@gmail.com';

      const result = await sendEmailNotification(emailNotification);
      console.log('📧 Email send result:', result ? 'Success' : 'Failed');
    } catch (emailError: any) {
      console.error('📧 Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      calendar_event_id: booking.google_calendar_event_id,
      message: 'Booking created and synced to calendar successfully'
    });
  } catch (error: any) {
    console.error('❌ Error in booking webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
