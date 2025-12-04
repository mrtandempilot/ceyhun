/**
 * Credentials Management Library
 * Provides high-level functions to manage app credentials stored in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { encryptCredential, decryptCredential } from './encryption';

// Supabase client for server-side operations
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createClient(supabaseUrl, supabaseServiceKey);
};

export interface Credential {
    id: string;
    platform: string;
    credential_type: string;
    credential_key: string;
    credential_value: string;
    is_encrypted: boolean;
    is_active: boolean;
    expires_at?: string;
    last_tested_at?: string;
    test_status?: 'success' | 'failed' | 'pending' | null;
    test_error?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

/**
 * Get a single credential value by platform and key
 * @param platform - Platform name (e.g., 'facebook', 'whatsapp')
 * @param credentialKey - Credential key (e.g., 'access_token', 'app_id')
 * @returns Decrypted credential value or null if not found
 */
export async function getCredential(
    platform: string,
    credentialKey: string
): Promise<string | null> {
    try {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('app_credentials')
            .select('credential_value, is_encrypted, is_active')
            .eq('platform', platform)
            .eq('credential_key', credentialKey)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            console.log(`[Credentials] Not found: ${platform}.${credentialKey}`);
            return null;
        }

        // Decrypt if encrypted
        if (data.is_encrypted) {
            return decryptCredential(data.credential_value);
        }

        return data.credential_value;
    } catch (error) {
        console.error(`[Credentials] Error fetching ${platform}.${credentialKey}:`, error);
        return null;
    }
}

/**
 * Get all credentials for a specific platform
 * @param platform - Platform name (e.g., 'facebook', 'whatsapp')
 * @returns Object with credential keys and their decrypted values
 */
export async function getAllCredentials(
    platform: string
): Promise<Record<string, string>> {
    try {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('app_credentials')
            .select('credential_key, credential_value, is_encrypted')
            .eq('platform', platform)
            .eq('is_active', true);

        if (error || !data) {
            console.log(`[Credentials] No credentials found for platform: ${platform}`);
            return {};
        }

        const credentials: Record<string, string> = {};

        for (const item of data) {
            const value = item.is_encrypted
                ? decryptCredential(item.credential_value)
                : item.credential_value;

            credentials[item.credential_key] = value;
        }

        return credentials;
    } catch (error) {
        console.error(`[Credentials] Error fetching credentials for ${platform}:`, error);
        return {};
    }
}

/**
 * Set or update a credential value
 * @param platform - Platform name
 * @param credentialKey - Credential key
 * @param value - Credential value (will be encrypted if shouldEncrypt is true)
 * @param shouldEncrypt - Whether to encrypt the value
 * @param userId - User ID creating/updating the credential
 * @param metadata - Optional metadata
 */
export async function setCredential(
    platform: string,
    credentialKey: string,
    value: string,
    shouldEncrypt: boolean = true,
    userId?: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseAdmin();

        // Determine credential type from key
        const credentialType = credentialKey.split('_').pop() || 'value';

        // Encrypt value if needed
        const finalValue = shouldEncrypt ? encryptCredential(value) : value;

        const credentialData = {
            platform,
            credential_type: credentialType,
            credential_key: credentialKey,
            credential_value: finalValue,
            is_encrypted: shouldEncrypt,
            is_active: true,
            metadata: metadata || {},
            updated_by: userId,
            created_by: userId,
        };

        // Upsert (insert or update)
        const { error } = await supabase
            .from('app_credentials')
            .upsert(credentialData, {
                onConflict: 'platform,credential_key',
            });

        if (error) {
            console.error('[Credentials] Error saving credential:', error);
            return { success: false, error: error.message };
        }

        console.log(`[Credentials] Saved: ${platform}.${credentialKey}`);
        return { success: true };
    } catch (error: any) {
        console.error('[Credentials] Error in setCredential:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a credential
 * @param platform - Platform name
 * @param credentialKey - Credential key
 */
export async function deleteCredential(
    platform: string,
    credentialKey: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('app_credentials')
            .delete()
            .eq('platform', platform)
            .eq('credential_key', credentialKey);

        if (error) {
            console.error('[Credentials] Error deleting credential:', error);
            return { success: false, error: error.message };
        }

        console.log(`[Credentials] Deleted: ${platform}.${credentialKey}`);
        return { success: true };
    } catch (error: any) {
        console.error('[Credentials] Error in deleteCredential:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update test status for a credential
 * @param platform - Platform name
 * @param credentialKey - Credential key
 * @param status - Test status
 * @param error - Optional error message
 */
export async function updateTestStatus(
    platform: string,
    credentialKey: string,
    status: 'success' | 'failed' | 'pending',
    error?: string
): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();

        await supabase
            .from('app_credentials')
            .update({
                test_status: status,
                test_error: error || null,
                last_tested_at: new Date().toISOString(),
            })
            .eq('platform', platform)
            .eq('credential_key', credentialKey);
    } catch (error) {
        console.error('[Credentials] Error updating test status:', error);
    }
}

/**
 * Get credential with fallback to environment variable
 * Useful for gradual migration from env vars to database
 * @param platform - Platform name
 * @param credentialKey - Credential key
 * @param envVarName - Environment variable name to fall back to
 */
export async function getCredentialWithFallback(
    platform: string,
    credentialKey: string,
    envVarName: string
): Promise<string | null> {
    // Try database first
    const dbValue = await getCredential(platform, credentialKey);

    if (dbValue) {
        return dbValue;
    }

    // Fallback to environment variable
    const envValue = process.env[envVarName];

    if (envValue) {
        console.log(`[Credentials] Using fallback env var: ${envVarName}`);
        return envValue;
    }

    return null;
}
