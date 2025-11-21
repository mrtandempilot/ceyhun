'use client';

import { useState } from 'react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState('test');
  const [result, setResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type: testType,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testTypes = [
    { value: 'test', label: 'Basic Email Test', description: 'Simple test email' },
    { value: 'booking', label: 'Booking Notification', description: 'Admin booking notification template' },
    { value: 'confirmation', label: 'Customer Confirmation', description: 'Customer booking confirmation template' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📧 Email Test Page</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-test-email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a real email address where you can check if emails are received
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Test Type
          </label>
          <div className="space-y-2">
            {testTypes.map((type) => (
              <div key={type.value} className="flex items-center">
                <input
                  type="radio"
                  id={type.value}
                  name="testType"
                  value={type.value}
                  checked={testType === type.value}
                  onChange={(e) => setTestType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={type.value} className="ml-2 block text-sm font-medium text-gray-700">
                  {type.label}
                  <span className="ml-1 text-xs text-gray-500">({type.description})</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleTestEmail}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Success' : 'Error'}
                </h3>
                <div className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </div>
                {result.timestamp && (
                  <div className="mt-2 text-xs text-gray-500">
                    Sent at: {new Date(result.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🔧 Gmail Configuration Required</h3>
          <p className="text-xs text-blue-700 mb-2">
            Make sure your <code>.env.local</code> file has correct Gmail credentials:
          </p>
          <pre className="text-xs bg-blue-100 p-2 rounded border">
{`SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=noreply@oludeniztours.com`}
          </pre>
          <p className="text-xs text-blue-700 mt-2">
            Need help with Gmail app passwords? Check the README-EMAIL-SETUP.md file.
          </p>
        </div>
      </div>
    </div>
  );
}
