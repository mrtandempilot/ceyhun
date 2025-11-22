import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Prepare email content
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown'
    };

    // Try n8n workflow first (recommended)
    try {
      const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook';

      const response = await fetch(`${N8N_WEBHOOK_URL}/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        console.log('Contact form submitted to n8n successfully:', contactData);
        // Continue to also store in database
      }
    } catch (n8nError) {
      console.error('n8n submission failed:', n8nError);
    }

    // Store in Supabase (always happens)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const dbData = {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || null,
          subject: contactData.subject,
          message: contactData.message,
          ip_address: contactData.ip,
          user_agent: contactData.userAgent,
          referer_url: request.headers.get('referer') || null,
          source: 'contact_form'
        };

        const dbResponse = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(dbData),
        });

        if (dbResponse.ok) {
          const savedData = await dbResponse.json();
          console.log('Contact form stored in database successfully');
        } else {
          console.error('Database storage failed:', await dbResponse.text());
        }
      }
    } catch (dbError) {
      console.error('Database storage error:', dbError);
    }

    // Return success regardless (if database storage worked, it's saved)
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
