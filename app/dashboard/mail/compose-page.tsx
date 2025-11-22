'use client';

import { useState } from 'react';

export default function ComposeEmailPage() {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    type: 'custom'
  });
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!emailData.to.trim() || !emailData.subject.trim() || !emailData.message.trim()) {
      alert('Please fill in all fields');
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
          email: emailData.to.trim(),
          type: 'custom',
          subject: emailData.subject,
          message: emailData.message
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: 'Email sent successfully!' });
        // Reset form
        setEmailData({ to: '', subject: '', message: '', type: 'custom' });
      } else {
        setResult({ success: false, message: data.message || 'Failed to send email' });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = {
    welcome: {
      subject: 'Welcome to Oludeniz Paragliding Tours!',
      message: `Dear Customer,

Thank you for your interest in Oludeniz Paragliding Tours!

We're excited to help you experience one of the most breathtaking paragliding locations in Turkey. Oludeniz offers spectacular views, professional instruction, and unforgettable memories.

Our experienced pilots will ensure your safety while providing an exhilarating adventure you'll never forget.

Please don't hesitate to contact us with any questions about tours, bookings, or arrangements.

Best regards,
Oludeniz Tours Team

📞 +90 XXX XXX XX XX
📧 info@oludeniztours.com
🪂 Professional Paragliding Adventures`
    },
    followUp: {
      subject: 'Following up on your Paragliding Inquiry',
      message: `Dear Customer,

Thank you for reaching out about paragliding at Oludeniz!

We wanted to follow up on your inquiry and provide more information about our available tours and packages.

Please let us know:
- Your preferred dates
- Number of participants
- Experience level
- Any special requirements

We're here to help make your paragliding adventure perfect!

Best regards,
Oludeniz Tours Team

📞 +90 XXX XXX XX XX
📧 info@oludeniztours.com
🪂 Professional Paragliding Adventures`
    },
    information: {
      subject: 'Important Information About Your Paragliding Tour',
      message: `Dear Customer,

We're preparing everything for your upcoming paragliding adventure!

Please review this important information:

✓ Meeting point: Oludeniz Beach, Royal Hotel parking area
✓ Meeting time: 15 minutes before your scheduled tour
✓ Weight limit: Maximum 110 kg (242 lbs)
✓ What's included: Professional pilot, equipment, photos
✓ What to wear: Comfortable clothes, closed shoes, sun hat

Weather permitting - tours may be rescheduled if conditions are unsuitable.

If you have any questions, please contact us immediately.

We're excited to welcome you soon!

Best regards,
Oludeniz Tours Team

📞 +90 XXX XXX XX XX
📧 info@oludeniztours.com
🪂 Professional Paragliding Adventures`
    }
  };

  const applyTemplate = (templateKey: keyof typeof quickTemplates) => {
    const template = quickTemplates[templateKey];
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📝 Compose Email</h1>
        <p className="text-gray-600 mt-1">Send emails to customers from your dashboard</p>
      </div>

      {/* Quick Templates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => applyTemplate('welcome')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-blue-600">Welcome Message</div>
            <div className="text-sm text-gray-600">New customer inquiry</div>
          </button>
          <button
            onClick={() => applyTemplate('followUp')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-blue-600">Follow Up</div>
            <div className="text-sm text-gray-600">After initial contact</div>
          </button>
          <button
            onClick={() => applyTemplate('information')}
            className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <div className="font-medium text-blue-600">Tour Information</div>
            <div className="text-sm text-gray-600">Important tour details</div>
          </button>
        </div>
      </div>

      {/* Compose Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Email Address
          </label>
          <input
            type="email"
            value={emailData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            placeholder="customer@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Email subject line"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={emailData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Type your email message here..."
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>

        <button
          onClick={handleSendEmail}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
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
              </div>
            </div>
          </div>
        )}

        {/* Configuration Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Email Configuration</h3>
          <p className="text-xs text-blue-700">
            Make sure your Gmail settings are configured in <code>.env.local</code>:
          </p>
          <pre className="text-xs bg-blue-100 p-2 rounded border mt-2">
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
          </pre>
        </div>
      </div>
    </div>
  );
}
