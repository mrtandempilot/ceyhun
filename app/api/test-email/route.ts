import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification, EmailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let success = false;
    let message = '';

    if (type === 'test') {
      // Send a simple test email
      success = await sendEmailNotification({
        to: email,
        subject: 'Test Email from Oludeniz Tours',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Email Test Successful! 🎉</h1>
            <p>Your email configuration is working correctly.</p>
            <p>This email was sent from your Oludeniz Tours web application.</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
          </div>
        `,
        text: 'Email test successful! Your configuration is working.',
      });
      message = success ? 'Test email sent successfully!' : 'Failed to send test email';
    } else if (type === 'booking') {
      // Send a booking confirmation test
      const bookingTemplate = EmailTemplates.bookingNotification({
        customer_name: 'Test Customer',
        tour_name: 'Test Paragliding Tour',
        total_amount: 150,
        booking_date: new Date().toISOString(),
        customer_email: email,
        customer_phone: '+1234567890',
      });
      bookingTemplate.to = email;

      success = await sendEmailNotification(bookingTemplate);
      message = success ? 'Booking notification sent successfully!' : 'Failed to send booking notification';
    } else if (type === 'confirmation') {
      // Send a customer confirmation test
      const confirmationTemplate = EmailTemplates.customerBookingConfirmation({
        customer_name: 'Test Customer',
        tour_name: 'Test Paragliding Adventure',
        total_amount: 150,
        booking_date: new Date().toISOString(),
        tour_start_time: '10:00 AM',
        adults: 2,
        children: 1,
      });
      confirmationTemplate.to = email;

      success = await sendEmailNotification(confirmationTemplate);
      message = success ? 'Customer confirmation sent successfully!' : 'Failed to send customer confirmation';
    }

    return NextResponse.json({
      success,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint is working. Use POST method to send test emails.',
    available_types: ['test', 'booking', 'confirmation'],
    example: {
      email: 'your-test@email.com',
      type: 'test'
    }
  });
}
