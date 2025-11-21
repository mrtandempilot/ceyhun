import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification, EmailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { email, type, subject, message } = requestBody;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let success = false;
    let responseMessage = '';

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
      responseMessage = success ? 'Test email sent successfully!' : 'Failed to send test email';
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
      responseMessage = success ? 'Booking notification sent successfully!' : 'Failed to send booking notification';
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
      responseMessage = success ? 'Customer confirmation sent successfully!' : 'Failed to send customer confirmation';

  } else if (type === 'custom') {
      // Send custom email from compose page
      const customEmail = {
        to: email,
        subject: subject || 'Custom Email from Oludeniz Tours',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="line-height: 1.6; color: #374151;">${(message || '').replace(/\n/g, '<br>')}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Best regards,</p>
              <p>Oludeniz Tours Team</p>
              <p>📞 +90 XXX XXX XX XX • 📧 info@oludeniztours.com</p>
            </div>
          </div>
        </div>`,
        text: message || 'Custom email from Oludeniz Tours',
      };

      success = await sendEmailNotification(customEmail);
      responseMessage = success ? 'Custom email sent successfully!' : 'Failed to send custom email';
    }

    return NextResponse.json({
      success,
      message: responseMessage,
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
