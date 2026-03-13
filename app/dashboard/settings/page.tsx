/**
 * Settings Page - Integrations & Credentials Management
 * Admin-only page for managing all platform credentials from the dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import PlatformCredentialCard from '@/components/PlatformCredentialCard';

type Tab = 'social' | 'automation' | 'email' | 'google';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('social');

    useEffect(() => {
        async function checkAuth() {
            try {
                const user = await getCurrentUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                if (user.email !== 'mrtandempilot@gmail.com') {
                    router.push('/dashboard');
                    return;
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    const handleSave = async (platform: string, credentials: Record<string, string>) => {
        for (const [key, value] of Object.entries(credentials)) {
            const shouldEncrypt = key.includes('token') || key.includes('secret') || key.includes('password');

            const response = await fetch('/api/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform,
                    credential_key: key,
                    value,
                    should_encrypt: shouldEncrypt,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save ${key}`);
            }
        }
    };

    const handleTest = async (platform: string) => {
        const response = await fetch('/api/credentials/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform }),
        });

        const result = await response.json();
        return {
            success: result.success,
            message: result.message || (result.success ? 'Connected!' : 'Connection failed'),
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Integrations & Credentials</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your platform credentials and API keys. All sensitive data is encrypted.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Secure Credential Storage</h3>
                            <p className="mt-1 text-sm text-blue-700">
                                Your credentials are encrypted and stored securely. Changes take effect immediately without requiring app restart.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('social')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'social'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Social Media
                            </button>
                            <button
                                onClick={() => setActiveTab('automation')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'automation'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Automation & Workflows
                            </button>
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'email'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Email & Communication
                            </button>
                            <button
                                onClick={() => setActiveTab('google')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'google'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Google Services
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'social' && (
                        <>
                            <PlatformCredentialCard
                                platform="facebook"
                                platformName="Facebook"
                                color="bg-blue-600"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'facebook_app_id', label: 'App ID', encrypted: false, required: true, helpText: 'From Facebook Developers > Your App > Settings > Basic' },
                                    { key: 'facebook_app_secret', label: 'App Secret', encrypted: true, required: true, helpText: 'Keep this secret! Find it in the same location as App ID' },
                                    { key: 'facebook_access_token', label: 'Access Token', encrypted: true, required: true, helpText: 'Long-lived page access token from Graph API Explorer' },
                                    { key: 'facebook_page_id', label: 'Page ID', encrypted: false, required: false, helpText: 'Your Facebook Page ID (optional)' },
                                ]}
                                onSave={(creds) => handleSave('facebook', creds)}
                                onTestConnection={() => handleTest('facebook')}
                            />

                            <PlatformCredentialCard
                                platform="instagram"
                                platformName="Instagram Business"
                                color="bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'instagram_business_account_id', label: 'Business Account ID', encrypted: false, required: true, helpText: 'Instagram Business Account ID (linked to Facebook Page)' },
                                ]}
                                onSave={(creds) => handleSave('instagram', creds)}
                                onTestConnection={() => handleTest('instagram')}
                            />

                            <PlatformCredentialCard
                                platform="whatsapp"
                                platformName="WhatsApp Business"
                                color="bg-green-500"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'whatsapp_phone_number_id', label: 'Phone Number ID', encrypted: false, required: true, helpText: 'From Meta for Developers > WhatsApp > API Setup' },
                                    { key: 'whatsapp_access_token', label: 'Access Token', encrypted: true, required: true, helpText: 'Permanent access token for WhatsApp Business API' },
                                    { key: 'whatsapp_verify_token', label: 'Verify Token', encrypted: true, required: false, helpText: 'Custom token for webhook verification' },
                                    { key: 'whatsapp_business_account_id', label: 'Business Account ID', encrypted: false, required: false, helpText: 'WhatsApp Business Account ID (optional)' },
                                ]}
                                onSave={(creds) => handleSave('whatsapp', creds)}
                                onTestConnection={() => handleTest('whatsapp')}
                            />

                            <PlatformCredentialCard
                                platform="telegram"
                                platformName="Telegram Bot"
                                color="bg-blue-500"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'telegram_bot_token', label: 'Bot Token', encrypted: true, required: true, helpText: 'Get from @BotFather on Telegram' },
                                    { key: 'telegram_webhook_secret', label: 'Webhook Secret', encrypted: true, required: false, helpText: 'Optional secret for webhook verification' },
                                ]}
                                onSave={(creds) => handleSave('telegram', creds)}
                                onTestConnection={() => handleTest('telegram')}
                            />
                        </>
                    )}

                    {activeTab === 'automation' && (
                        <>
                            <PlatformCredentialCard
                                platform="n8n"
                                platformName="n8n Workflows"
                                color="bg-red-500"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.5 7.5l-7 7-3-3m18.5-4.5a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v1.5zM12 12v8m-6-8v8m12-8v8" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'n8n_chat_webhook_url', label: 'Chat Webhook URL', encrypted: false, required: false, helpText: 'n8n webhook URL for chat/chatbot integration' },
                                    { key: 'n8n_social_webhook_url', label: 'Social Media Webhook URL', encrypted: false, required: false, helpText: 'n8n webhook URL for social media auto-posting' },
                                    { key: 'n8n_webhook_secret', label: 'Webhook Secret', encrypted: true, required: false, helpText: 'Secret key for securing webhook calls (optional)' },
                                ]}
                                onSave={(creds) => handleSave('n8n', creds)}
                                onTestConnection={() => handleTest('n8n')}
                            />
                        </>
                    )}

                    {activeTab === 'email' && (
                        <>
                            <PlatformCredentialCard
                                platform="email"
                                platformName="Email / SMTP"
                                color="bg-gray-600"
                                icon={
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'smtp_host', label: 'SMTP Host', encrypted: false, required: true, placeholder: 'smtp.gmail.com', helpText: 'SMTP server hostname' },
                                    { key: 'smtp_port', label: 'SMTP Port', encrypted: false, required: true, placeholder: '587', helpText: 'SMTP port (usually 587 for TLS or 465 for SSL)' },
                                    { key: 'smtp_user', label: 'SMTP Username', encrypted: false, required: true, placeholder: 'your-email@gmail.com', helpText: 'Email address or username' },
                                    { key: 'smtp_password', label: 'SMTP Password', encrypted: true, required: true, helpText: 'App password or SMTP password' },
                                    { key: 'from_email', label: 'From Email', encrypted: false, required: false, placeholder: 'noreply@yourdomain.com', helpText: 'Email address to send from (optional)' },
                                ]}
                                onSave={(creds) => handleSave('email', creds)}
                                onTestConnection={() => handleTest('email')}
                            />
                        </>
                    )}

                    {activeTab === 'google' && (
                        <>
                            <PlatformCredentialCard
                                platform="google"
                                platformName="Google OAuth"
                                color="bg-red-600"
                                icon={
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                }
                                fields={[
                                    { key: 'google_client_id', label: 'Client ID', encrypted: false, required: false, helpText: 'From Google Cloud Console > Credentials' },
                                    { key: 'google_client_secret', label: 'Client Secret', encrypted: true, required: false, helpText: 'OAuth 2.0 client secret' },
                                ]}
                                onSave={(creds) => handleSave('google', creds)}
                                onTestConnection={() => handleTest('google')}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
