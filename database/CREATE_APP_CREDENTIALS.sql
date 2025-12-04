-- ============================================================================
-- APP CREDENTIALS MANAGEMENT SYSTEM
-- ============================================================================
-- This creates a secure credentials storage system for managing API keys,
-- tokens, and other sensitive configuration without using environment variables.
-- Clients can manage all credentials directly from the dashboard UI.
-- ============================================================================

-- ============================================================================
-- 1. CREATE CREDENTIALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Platform identification
    platform TEXT NOT NULL, -- 'facebook', 'instagram', 'whatsapp', 'n8n', 'email', etc.
    credential_type TEXT NOT NULL, -- 'access_token', 'app_id', 'webhook_url', etc.
    credential_key TEXT NOT NULL, -- Unique identifier like 'facebook_app_id'
    
    -- Credential value (encrypted for sensitive data)
    credential_value TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ, -- For tokens that expire
    last_tested_at TIMESTAMPTZ,
    test_status TEXT, -- 'success', 'failed', 'pending', null
    test_error TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional platform-specific data
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Ensure unique credentials per platform and key
    UNIQUE(platform, credential_key)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_app_credentials_platform ON app_credentials(platform);
CREATE INDEX IF NOT EXISTS idx_app_credentials_active ON app_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_app_credentials_expires ON app_credentials(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 2. CREATE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credential_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL DEFAULT 'app_credentials',
    entity_id UUID, -- credential ID
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'test'
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON credential_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON credential_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON credential_audit_log(created_at);

-- ============================================================================
-- 3. ENCRYPTION/DECRYPTION FUNCTIONS (using pgcrypto)
-- ============================================================================

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt a credential value
-- Note: In production, use a strong encryption key stored securely
CREATE OR REPLACE FUNCTION encrypt_credential(value TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        encrypt(
            value::bytea,
            encryption_key::bytea,
            'aes'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt a credential value
CREATE OR REPLACE FUNCTION decrypt_credential(encrypted_value TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(
        decrypt(
            decode(encrypted_value, 'base64'),
            encryption_key::bytea,
            'aes'
        ),
        'utf8'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL; -- Return NULL if decryption fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_app_credentials_updated_at
    BEFORE UPDATE ON app_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log credential changes to audit log
CREATE OR REPLACE FUNCTION log_credential_change()
RETURNS TRIGGER AS $$
DECLARE
    current_user_email TEXT;
BEGIN
    -- Get user email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by);

    IF TG_OP = 'INSERT' THEN
        INSERT INTO credential_audit_log (
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            changes
        ) VALUES (
            'app_credentials',
            NEW.id,
            'create',
            NEW.created_by,
            current_user_email,
            jsonb_build_object(
                'platform', NEW.platform,
                'credential_key', NEW.credential_key,
                'is_encrypted', NEW.is_encrypted
            )
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO credential_audit_log (
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            changes
        ) VALUES (
            'app_credentials',
            NEW.id,
            'update',
            NEW.updated_by,
            current_user_email,
            jsonb_build_object(
                'old_value_changed', (OLD.credential_value != NEW.credential_value),
                'old_active', OLD.is_active,
                'new_active', NEW.is_active,
                'test_status', NEW.test_status
            )
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO credential_audit_log (
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            changes
        ) VALUES (
            'app_credentials',
            OLD.id,
            'delete',
            auth.uid(),
            current_user_email,
            jsonb_build_object(
                'platform', OLD.platform,
                'credential_key', OLD.credential_key
            )
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log all credential changes
CREATE TRIGGER log_app_credentials_changes
    AFTER INSERT OR UPDATE OR DELETE ON app_credentials
    FOR EACH ROW
    EXECUTE FUNCTION log_credential_change();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE app_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view all credentials" ON app_credentials;
DROP POLICY IF EXISTS "Admin users can insert credentials" ON app_credentials;
DROP POLICY IF EXISTS "Admin users can update credentials" ON app_credentials;
DROP POLICY IF EXISTS "Admin users can delete credentials" ON app_credentials;
DROP POLICY IF EXISTS "Admin users can view audit log" ON credential_audit_log;

-- Policy: Only admin user (mrtandempilot@gmail.com) can view credentials
CREATE POLICY "Admin users can view all credentials"
    ON app_credentials
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'
        )
    );

-- Policy: Only admin can insert credentials
CREATE POLICY "Admin users can insert credentials"
    ON app_credentials
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'
        )
    );

-- Policy: Only admin can update credentials
CREATE POLICY "Admin users can update credentials"
    ON app_credentials
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'
        )
    );

-- Policy: Only admin can delete credentials
CREATE POLICY "Admin users can delete credentials"
    ON app_credentials
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'
        )
    );

-- Policy: Admin can view audit log
CREATE POLICY "Admin users can view audit log"
    ON credential_audit_log
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'
        )
    );

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on tables to authenticated users (RLS will control actual access)
GRANT ALL ON app_credentials TO authenticated;
GRANT ALL ON credential_audit_log TO authenticated;

-- Note: No sequences to grant since we use UUID primary keys (not serial)

-- ============================================================================
-- 7. INSERT DEFAULT/EXAMPLE CREDENTIALS (OPTIONAL - for testing)
-- ============================================================================

-- Uncomment to insert example credentials (replace with real values)
/*
INSERT INTO app_credentials (platform, credential_type, credential_key, credential_value, is_encrypted, created_by)
VALUES 
    -- Facebook
    ('facebook', 'app_id', 'facebook_app_id', 'your-app-id-here', false, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    ('facebook', 'app_secret', 'facebook_app_secret', encrypt_credential('your-secret-here', 'your-encryption-key'), true, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    ('facebook', 'access_token', 'facebook_access_token', encrypt_credential('your-token-here', 'your-encryption-key'), true, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    ('facebook', 'page_id', 'facebook_page_id', 'your-page-id', false, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    
    -- WhatsApp
    ('whatsapp', 'phone_number_id', 'whatsapp_phone_number_id', 'your-phone-number-id', false, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    ('whatsapp', 'access_token', 'whatsapp_access_token', encrypt_credential('your-token-here', 'your-encryption-key'), true, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    
    -- n8n
    ('n8n', 'webhook_url', 'n8n_chat_webhook_url', 'https://your-n8n.com/webhook/chat', false, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com')),
    ('n8n', 'webhook_url', 'n8n_social_webhook_url', 'https://your-n8n.com/webhook/social', false, (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com'))
ON CONFLICT (platform, credential_key) DO NOTHING;
*/

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

COMMENT ON TABLE app_credentials IS 'Stores encrypted application credentials for various platforms and services';
COMMENT ON TABLE credential_audit_log IS 'Audit log for tracking all credential changes';
COMMENT ON FUNCTION encrypt_credential IS 'Encrypts a credential value using AES encryption';
COMMENT ON FUNCTION decrypt_credential IS 'Decrypts an encrypted credential value';
