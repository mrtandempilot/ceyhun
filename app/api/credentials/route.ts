/**
 * API Route: /api/credentials
 * Handles CRUD operations for app credentials
 * Admin-only access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth';
import { setCredential, getCredential, getAllCredentials, deleteCredential } from '@/lib/credentials';
import { maskCredential } from '@/lib/encryption';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin check helper
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { isAdmin: false, error: 'Not authenticated' };
        }

        // Check if user is admin
        if (user.email !== 'mrtandempilot@gmail.com') {
            return { isAdmin: false, error: 'Access denied. Admin only.' };
        }

        return { isAdmin: true, userId: user.id };
    } catch (error) {
        return { isAdmin: false, error: 'Authentication error' };
    }
}

/**
 * GET /api/credentials
 * Get all credentials or filter by platform
 * Returns credentials with masked values for security
 */
export async function GET(request: NextRequest) {
    const adminCheck = await isAdmin(request);

    if (!adminCheck.isAdmin) {
        return NextResponse.json(
            { error: adminCheck.error },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');
        const credentialKey = searchParams.get('key');

        // Get single credential
        if (platform && credentialKey) {
            const value = await getCredential(platform, credentialKey);

            if (!value) {
                return NextResponse.json(
                    { error: 'Credential not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                platform,
                credential_key: credentialKey,
                value: maskCredential(value), // Return masked value
                exists: true,
            });
        }

        // Get all credentials for a platform
        if (platform) {
            const credentials = await getAllCredentials(platform);

            // Mask all values
            const maskedCredentials = Object.entries(credentials).reduce((acc, [key, value]) => {
                acc[key] = maskCredential(value);
                return acc;
            }, {} as Record<string, string>);

            return NextResponse.json({
                platform,
                credentials: maskedCredentials,
            });
        }

        // Get all credentials from database
        const { data, error } = await supabase
            .from('app_credentials')
            .select('id, platform, credential_type, credential_key, is_encrypted, is_active, expires_at, last_tested_at, test_status, test_error, created_at, updated_at')
            .eq('is_active', true)
            .order('platform', { ascending: true })
            .order('credential_key', { ascending: true });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch credentials' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            credentials: data || [],
            count: data?.length || 0,
        });
    } catch (error: any) {
        console.error('[API] Error in GET /api/credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/credentials
 * Create or update a credential
 */
export async function POST(request: NextRequest) {
    const adminCheck = await isAdmin(request);

    if (!adminCheck.isAdmin) {
        return NextResponse.json(
            { error: adminCheck.error },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { platform, credential_key, value, should_encrypt = true, metadata } = body;

        // Validation
        if (!platform || !credential_key || !value) {
            return NextResponse.json(
                { error: 'Missing required fields: platform, credential_key, value' },
                { status: 400 }
            );
        }

        // Validate platform name
        const validPlatforms = ['facebook', 'instagram', 'whatsapp', 'linkedin', 'twitter', 'n8n', 'email', 'google', 'supabase', 'other'];
        if (!validPlatforms.includes(platform.toLowerCase())) {
            return NextResponse.json(
                { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
                { status: 400 }
            );
        }

        // Save credential
        const result = await setCredential(
            platform,
            credential_key,
            value,
            should_encrypt,
            adminCheck.userId,
            metadata
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to save credential' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Credential saved successfully',
            platform,
            credential_key,
        });
    } catch (error: any) {
        console.error('[API] Error in POST /api/credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/credentials
 * Delete a credential
 */
export async function DELETE(request: NextRequest) {
    const adminCheck = await isAdmin(request);

    if (!adminCheck.isAdmin) {
        return NextResponse.json(
            { error: adminCheck.error },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');
        const credentialKey = searchParams.get('key');

        if (!platform || !credentialKey) {
            return NextResponse.json(
                { error: 'Missing required parameters: platform, key' },
                { status: 400 }
            );
        }

        const result = await deleteCredential(platform, credentialKey);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to delete credential' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Credential deleted successfully',
        });
    } catch (error: any) {
        console.error('[API] Error in DELETE /api/credentials:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
