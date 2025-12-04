/**
 * Client-side encryption utilities for credential management
 * Uses AES-256-GCM encryption for sensitive credential values
 */

import crypto from 'crypto';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';

// Validate encryption key
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    console.warn('[Encryption] WARNING: ENCRYPTION_KEY not set or too short. Using fallback (INSECURE for production)');
}

// Ensure key is exactly 32 bytes for AES-256
const getEncryptionKey = (): Buffer => {
    if (!ENCRYPTION_KEY) {
        // Fallback key for development only - DO NOT USE IN PRODUCTION
        return Buffer.from('INSECURE-FALLBACK-KEY-32CHARS!');
    }
    // Hash the key to ensure it's exactly 32 bytes
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

/**
 * Encrypt a string value using AES-256-GCM
 * @param value - The string to encrypt
 * @returns Base64-encoded encrypted value with IV prepended
 */
export function encryptCredential(value: string): string {
    if (!value) return '';

    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(16); // Initialization vector

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(value, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        // Combine IV + authTag + encrypted data
        const combined = Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, 'base64')
        ]);

        return combined.toString('base64');
    } catch (error) {
        console.error('[Encryption] Encryption failed:', error);
        throw new Error('Failed to encrypt credential');
    }
}

/**
 * Decrypt an encrypted string value
 * @param encryptedValue - Base64-encoded encrypted value with IV prepended
 * @returns Decrypted string value
 */
export function decryptCredential(encryptedValue: string): string {
    if (!encryptedValue) return '';

    try {
        const key = getEncryptionKey();
        const combined = Buffer.from(encryptedValue, 'base64');

        // Extract IV (16 bytes), authTag (16 bytes), and encrypted data
        const iv = combined.subarray(0, 16);
        const authTag = combined.subarray(16, 32);
        const encrypted = combined.subarray(32);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('[Encryption] Decryption failed:', error);
        throw new Error('Failed to decrypt credential');
    }
}

/**
 * Mask a credential value for display (show only last 4 characters)
 * @param value - The value to mask
 * @returns Masked string like "••••••••abcd"
 */
export function maskCredential(value: string): string {
    if (!value || value.length < 4) {
        return '••••••••';
    }

    const visibleChars = value.slice(-4);
    const maskedPart = '•'.repeat(Math.min(value.length - 4, 8));

    return maskedPart + visibleChars;
}

/**
 * Validate if a string is a valid encrypted credential format
 * @param value - The value to validate
 * @returns true if valid encrypted format
 */
export function isEncryptedFormat(value: string): boolean {
    if (!value) return false;

    try {
        const buffer = Buffer.from(value, 'base64');
        // Valid encrypted format should have at least IV (16) + authTag (16) + some data
        return buffer.length > 32;
    } catch {
        return false;
    }
}
