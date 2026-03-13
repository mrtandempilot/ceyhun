/**
 * PlatformCredentialCard Component
 * Card for managing credentials for a specific platform
 */

'use client';

import { useState } from 'react';
import CredentialInput from './CredentialInput';

interface CredentialField {
    key: string;
    label: string;
    encrypted: boolean;
    helpText?: string;
    placeholder?: string;
    required?: boolean;
}

interface PlatformCredentialCardProps {
    platform: string;
    platformName: string;
    icon: React.ReactNode;
    color: string;
    fields: CredentialField[];
    onSave: (credentials: Record<string, string>) => Promise<void>;
    onTestConnection: () => Promise<{ success: boolean; message: string }>;
    initialValues?: Record<string, string>;
}

export default function PlatformCredentialCard({
    platform,
    platformName,
    icon,
    color,
    fields,
    onSave,
    onTestConnection,
    initialValues = {},
}: PlatformCredentialCardProps) {
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);

        try {
            await onSave(values);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const result = await onTestConnection();
            setTestResult(result);
        } catch (error: any) {
            setTestResult({ success: false, message: error.message || 'Test failed' });
        } finally {
            setTesting(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }));
        setTestResult(null); // Clear test result when values change
        setSaveSuccess(false);
    };

    const hasAllRequired = fields
        .filter(f => f.required)
        .every(f => values[f.key] && values[f.key].length > 0);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`${color} text-white p-3 rounded-lg`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{platformName}</h3>
                        <p className="text-sm text-gray-500">{platform.charAt(0).toUpperCase() + platform.slice(1)} Integration</p>
                    </div>
                </div>

                {testResult && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${testResult.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {testResult.success ? '● Connected' : '○ Error'}
                    </span>
                )}
            </div>

            {/* Credential Fields */}
            <div className="space-y-4 mb-6">
                {fields.map(field => (
                    <CredentialInput
                        key={field.key}
                        label={field.label}
                        value={values[field.key] || ''}
                        onChange={(value) => handleChange(field.key, value)}
                        encrypted={field.encrypted}
                        helpText={field.helpText}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                ))}
            </div>

            {/* Test Result Message */}
            {testResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${testResult.success
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {testResult.success ? (
                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="font-medium">{testResult.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Success Message */}
            {saveSuccess && (
                <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="font-medium">Credentials saved successfully!</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleSave}
                    disabled={saving || !hasAllRequired}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${saving || !hasAllRequired
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {saving ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        'Save Credentials'
                    )}
                </button>

                <button
                    onClick={handleTest}
                    disabled={testing || !hasAllRequired}
                    className={`px-4 py-2 rounded-lg font-medium transition ${testing || !hasAllRequired
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {testing ? 'Testing...' : 'Test Connection'}
                </button>
            </div>

            {!hasAllRequired && (
                <p className="mt-2 text-xs text-gray-500 text-center">
                    * Please fill all required fields
                </p>
            )}
        </div>
    );
}
