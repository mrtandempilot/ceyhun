import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email notification types
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create email transporter
function createTransporter() {
  // For development/demo purposes, we'll use a simple configuration
  // In production, use services like SendGrid, Mailgun, AWS SES, etc.

  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
}

// Send email notification
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  try {
    console.log('📧 Creating email transporter...');
    const transporter = createTransporter();

    console.log('📧 Verifying SMTP connection...');
    // Verify connection
    await transporter.verify();
    console.log('📧 SMTP connection verified successfully');

    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Oludeniz Tours" <noreply@oludeniztours.com>',
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    };

    console.log('📧 Sending email to:', notification.to);
    console.log('📧 Subject:', notification.subject);

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    console.log('📧 Full response:', info);
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error command:', error.command);

    // Log more details for debugging
    if (error.response) {
      console.error('❌ SMTP Response:', error.response);
    }
    if (error.responseCode) {
      console.error('❌ SMTP Response Code:', error.responseCode);
    }

    return false;
  }
}

// Email templates for different notification types
export class EmailTemplates {
  static bookingNotification(data: {
    customer_name: string;
    tour_name: string;
    total_amount: number;
    booking_date: string;
    customer_email: string;
    customer_phone?: string;
  }): EmailNotification {
    return {
      to: '', // Will be set by caller
      subject: `🎉 New Booking: ${data.customer_name} - ${data.tour_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">🎉 New Booking Alert!</h1>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Customer:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.customer_name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tour:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.tour_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Amount:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: bold;">$${data.total_amount}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Booking Date:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${new Date(data.booking_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.customer_email}</td>
                </tr>
                ${data.customer_phone ? `
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.customer_phone}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings"
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Booking Details
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated notification from Oludeniz Tours CRM System.</p>
              <p>Please respond to the customer promptly to confirm their booking.</p>
            </div>
          </div>
        </div>
      `,
      text: `
New Booking Alert!

Customer: ${data.customer_name}
Tour: ${data.tour_name}
Amount: $${data.total_amount}
Booking Date: ${new Date(data.booking_date).toLocaleDateString()}
Email: ${data.customer_email}
${data.customer_phone ? `Phone: ${data.customer_phone}` : ''}

Please check the dashboard for more details and confirm the booking.
      `.trim(),
    };
  }

  static paymentNotification(data: {
    customer_name: string;
    amount: number;
    payment_method: string;
    booking_reference?: string;
  }): EmailNotification {
    return {
      to: '', // Will be set by caller
      subject: `💰 Payment Received: $${data.amount} from ${data.customer_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #059669; text-align: center; margin-bottom: 30px;">💰 Payment Received!</h1>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #166534; margin-top: 0;">Payment Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Customer:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.customer_name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Amount:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">$${data.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.payment_method}</td>
                </tr>
                ${data.booking_reference ? `
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Booking Reference:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.booking_reference}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/accounting/payments"
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Payment Details
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated notification from Oludeniz Tours CRM System.</p>
            </div>
          </div>
        </div>
      `,
      text: `
Payment Received!

Customer: ${data.customer_name}
Amount: $${data.amount}
Payment Method: ${data.payment_method}
${data.booking_reference ? `Booking Reference: ${data.booking_reference}` : ''}

Please check the payments dashboard for more details.
      `.trim(),
    };
  }

  static customerBookingConfirmation(data: {
    customer_name: string;
    tour_name: string;
    total_amount: number;
    booking_date: string;
    tour_start_time: string;
    adults: number;
    children: number;
    customer_phone?: string;
  }): EmailNotification {
    return {
      to: '', // Will be set by caller
      subject: `✅ Booking Confirmed - ${data.tour_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #059669; text-align: center; margin-bottom: 30px;">🎉 Booking Confirmed!</h1>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #166534; font-size: 16px; margin-top: 0;">Dear ${data.customer_name},</p>
              <p style="color: #374151; margin-bottom: 0;">Thank you for booking with Ölüdeniz Paragliding! Your adventure is confirmed.</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0;">Your Booking Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tour:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.tour_name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${new Date(data.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.tour_start_time}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Participants:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.adults} Adult${data.adults > 1 ? 's' : ''}${data.children > 0 ? `, ${data.children} Child${data.children > 1 ? 'ren' : ''}` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">₺${data.total_amount}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">📱 Your Ticket</h3>
              <p style="color: #78350f; margin-bottom: 0;">You will receive your digital ticket via WhatsApp shortly. Please keep it with you on the day of your tour.</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-top: 0; font-size: 16px;">📋 Important Information</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Please arrive 15 minutes before your scheduled time</li>
                <li style="margin-bottom: 8px;">Wear comfortable clothes and closed shoes</li>
                <li style="margin-bottom: 8px;">Maximum weight limit: 110 kg (240 lbs)</li>
                <li style="margin-bottom: 8px;">Bring your ticket (we'll send it via WhatsApp)</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px;">If you have any questions, feel free to contact us:</p>
              <p style="color: #2563eb; font-weight: bold; margin: 5px 0;">📞 +90 XXX XXX XX XX</p>
              <p style="color: #2563eb; font-weight: bold; margin: 5px 0;">📧 info@oludeniztours.com</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>See you soon for an unforgettable paragliding experience! 🪂</p>
              <p style="margin-top: 10px; font-size: 12px;">This is an automated confirmation from Ölüdeniz Paragliding Tours.</p>
            </div>
          </div>
        </div>
      `,
      text: `
Booking Confirmed!

Dear ${data.customer_name},

Thank you for booking with Ölüdeniz Paragliding! Your adventure is confirmed.

YOUR BOOKING DETAILS:
Tour: ${data.tour_name}
Date: ${new Date(data.booking_date).toLocaleDateString()}
Time: ${data.tour_start_time}
Participants: ${data.adults} Adult${data.adults > 1 ? 's' : ''}${data.children > 0 ? `, ${data.children} Child${data.children > 1 ? 'ren' : ''}` : ''}
Total Amount: ₺${data.total_amount}

YOUR TICKET:
You will receive your digital ticket via WhatsApp shortly. Please keep it with you on the day of your tour.

IMPORTANT INFORMATION:
- Please arrive 15 minutes before your scheduled time
- Wear comfortable clothes and closed shoes
- Maximum weight limit: 110 kg (240 lbs)
- Bring your ticket (we'll send it via WhatsApp)

CONTACT US:
Phone: +90 XXX XXX XX XX
Email: info@oludeniztours.com

See you soon for an unforgettable paragliding experience!

This is an automated confirmation from Ölüdeniz Paragliding Tours.
      `.trim(),
    };
  }

  static cancellationNotification(data: {
    customer_name: string;
    tour_name: string;
    cancellation_reason?: string;
    refund_amount?: number;
  }): EmailNotification {
    return {
      to: '', // Will be set by caller
      subject: `❌ Booking Cancelled: ${data.customer_name} - ${data.tour_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; text-align: center; margin-bottom: 30px;">❌ Booking Cancelled</h1>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #991b1b; margin-top: 0;">Cancellation Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Customer:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.customer_name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tour:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.tour_name}</td>
                </tr>
                ${data.cancellation_reason ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Reason:</td>
                  <td style="padding: 8px 0; color: #6b7280;">${data.cancellation_reason}</td>
                </tr>
                ` : ''}
                ${data.refund_amount ? `
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Refund Amount:</td>
                  <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">$${data.refund_amount}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/bookings"
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Booking Details
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated notification from Oludeniz Tours CRM System.</p>
              <p>Please handle any refunds or follow-up actions as needed.</p>
            </div>
          </div>
        </div>
      `,
      text: `
Booking Cancelled

Customer: ${data.customer_name}
Tour: ${data.tour_name}
${data.cancellation_reason ? `Reason: ${data.cancellation_reason}` : ''}
${data.refund_amount ? `Refund Amount: $${data.refund_amount}` : ''}

Please check the bookings dashboard for more details and handle any necessary follow-up.
      `.trim(),
    };
  }
}

// Test email configuration
export async function testEmailConfiguration(emailAddress: string): Promise<boolean> {
  const testNotification: EmailNotification = {
    to: emailAddress,
    subject: '🧪 Email Configuration Test - Oludeniz Tours',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">🧪 Email Test Successful!</h1>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #1e40af; margin-top: 0;">Your email notifications are working!</h2>
            <p style="color: #6b7280; margin-bottom: 0;">This is a test message from your Oludeniz Tours CRM notification system.</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/notifications"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Return to Settings
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This is an automated test message from Oludeniz Tours CRM System.</p>
          </div>
        </div>
      </div>
    `,
    text: 'Email configuration test successful! Your email notifications are working properly.',
  };

  return await sendEmailNotification(testNotification);
}
