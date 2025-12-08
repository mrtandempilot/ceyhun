import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { to, subject, message, from } = await request.json();

        // Validate required fields
        if (!to || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, message' },
                { status: 400 }
            );
        }

        // TODO: Implement actual email sending logic
        // Option 1: Use your mail server's SMTP directly via nodemailer
        // Option 2: Call your n8n workflow webhook
        // Option 3: Use a service like SendGrid, AWS SES, etc.

        // For now, using n8n webhook approach (you'll need to create this workflow)
        const n8nWebhookUrl = process.env.N8N_SEND_EMAIL_WEBHOOK;

        if (!n8nWebhookUrl) {
            // Fallback: Log the email (for development)
            console.log('Email to send:', { from, to, subject, message });

            return NextResponse.json({
                success: true,
                message: 'Email logged (n8n webhook not configured)',
                data: { from, to, subject }
            });
        }

        // Send to n8n webhook
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: from || 'info@oludenizexplorer.com.tr',
                to,
                subject,
                message,
                timestamp: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error(`n8n webhook failed: ${response.statusText}`);
        }

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            data: result
        });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
