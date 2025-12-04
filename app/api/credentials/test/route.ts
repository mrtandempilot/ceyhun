/**
 * API Route: /api/credentials/test
 * Test platform connections to verify credentials are working
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllCredentials, updateTestStatus } from '@/lib/credentials';

// Admin check helper
async function isAdmin(): Promise<{ isAdmin: boolean; error?: string }> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { isAdmin: false, error: 'Not authenticated' };
        }

        if (user.email !== 'mrtandempilot@gmail.com') {
            return { isAdmin: false, error: 'Access denied. Admin only.' };
        }

        return { isAdmin: true };
    } catch (error) {
        return { isAdmin: false, error: 'Authentication error' };
    }
}

/**
 * Test Facebook connection
 */
async function testFacebook(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const accessToken = credentials.facebook_access_token;
        const pageId = credentials.facebook_page_id;

        if (!accessToken) {
            return { success: false, message: 'Missing access token' };
        }

        // Test Graph API connection
        const response = await fetch(
            `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.error?.message || 'Invalid access token' };
        }

        return { success: true, message: 'Connected successfully' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Test WhatsApp connection
 */
async function testWhatsApp(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const accessToken = credentials.whatsapp_access_token;
        const phoneNumberId = credentials.whatsapp_phone_number_id;

        if (!accessToken || !phoneNumberId) {
            return { success: false, message: 'Missing required credentials' };
        }

        // Test Graph API connection for WhatsApp
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.error?.message || 'Invalid credentials' };
        }

        return { success: true, message: 'Connected successfully' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Test n8n webhook
 */
async function testN8N(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const webhookUrl = credentials.n8n_chat_webhook_url || credentials.n8n_social_webhook_url;

        if (!webhookUrl) {
            return { success: false, message: 'Missing webhook URL' };
        }

        // Send test ping
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true, message: 'Connection test' }),
        });

        if (!response.ok) {
            return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
        }

        return { success: true, message: 'Webhook is reachable' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Test Instagram connection (via Facebook)
 */
async function testInstagram(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const accessToken = credentials.facebook_access_token || credentials.instagram_access_token;
        const instagramAccountId = credentials.instagram_business_account_id;

        if (!accessToken || !instagramAccountId) {
            return { success: false, message: 'Missing required credentials' };
        }

        // Test Instagram Graph API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username&access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.error?.message || 'Invalid credentials' };
        }

        return { success: true, message: 'Connected successfully' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Test Email/SMTP connection
 */
async function testEmail(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const host = credentials.smtp_host;
        const port = credentials.smtp_port;
        const user = credentials.smtp_user;

        if (!host || !port || !user) {
            return { success: false, message: 'Missing SMTP configuration' };
        }

        // For now, just validate format (actual SMTP test requires nodemailer setup)
        return { success: true, message: 'SMTP configuration looks valid. Full test requires sending an email.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Test Telegram Bot connection
 */
async function testTelegram(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
    try {
        const botToken = credentials.telegram_bot_token;

        if (!botToken) {
            return { success: false, message: 'Missing bot token' };
        }

        // Test Telegram Bot API by calling getMe
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/getMe`
        );

        const data = await response.json();

        if (data.ok) {
            const botUsername = data.result.username;
            return { success: true, message: `Connected as @${botUsername}` };
        }

        return { success: false, message: data.description || 'Invalid bot token' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


/**
 * POST /api/credentials/test
 * Test a platform's connection
 */
export async function POST(request: NextRequest) {
    const adminCheck = await isAdmin();

    if (!adminCheck.isAdmin) {
        return NextResponse.json(
            { error: adminCheck.error },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { platform } = body;

        if (!platform) {
            return NextResponse.json(
                { error: 'Missing required field: platform' },
                { status: 400 }
            );
        }

        // Get all credentials for the platform
        const credentials = await getAllCredentials(platform);

        if (Object.keys(credentials).length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No credentials configured for this platform',
                platform,
            });
        }

        // Test based on platform
        let result: { success: boolean; message: string };

        switch (platform.toLowerCase()) {
            case 'facebook':
                result = await testFacebook(credentials);
                break;
            case 'whatsapp':
                result = await testWhatsApp(credentials);
                break;
            case 'instagram':
                result = await testInstagram(credentials);
                break;
            case 'n8n':
                result = await testN8N(credentials);
                break;
            case 'email':
                result = await testEmail(credentials);
                break;
            case 'telegram':
                result = await testTelegram(credentials);
                break;
            case 'google':
                result = { success: true, message: 'Google OAuth configured (test by signing in)' };
                break;
            default:
                result = { success: false, message: `Testing not implemented for platform: ${platform}` };
        }

        // Update test status in database for the main credential
        const mainCredKey = `${platform}_access_token`;
        await updateTestStatus(
            platform,
            mainCredKey,
            result.success ? 'success' : 'failed',
            result.success ? undefined : result.message
        );

        return NextResponse.json({
            success: result.success,
            message: result.message,
            platform,
            tested_at: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('[API] Error in POST /api/credentials/test:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
