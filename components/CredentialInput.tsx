/**
 * CredentialInput Component
 * Masked input field for sensitive credentials with show/hide toggle
 */

'use client';

import { useState } from 'react';

interface CredentialInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    encrypted?: boolean;
    helpText?: string;
    placeholder?: string;
    required?: boolean;
}

export default function CredentialInput({
    label,
    value,
    onChange,
    encrypted = true,
    helpText,
    placeholder,
    required = false,
}: CredentialInputProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    type={encrypted && !isVisible ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || (encrypted ? '••••••••••••' : '')}
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Action buttons */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                    {encrypted && (
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                            title={isVisible ? 'Hide' : 'Show'}
                        >
                            {isVisible ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    )}

                    {value && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {helpText && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}
        </div>
    );
}
