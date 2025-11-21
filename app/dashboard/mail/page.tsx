'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface IncomingEmail {
  id: string;
  message_id: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  plain_text?: string;
  html_content?: string;
  received_at: string;
  is_read: boolean;
  is_archived: boolean;
  is_spam: boolean;
  priority: string;
  attachments: any[];
  assigned_to?: string;
  notes?: string;
  forwarded_to?: string[];
  forwarded_at?: string;
  auto_replied: boolean;
}

export default function MailInboxPage() {
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<IncomingEmail | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived' | 'spam'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendFormData, setSendFormData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .order('received_at', { ascending: false });

      // Apply filters
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } else if (filter === 'spam') {
        query = query.eq('is_spam', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_read: read })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.map(email =>
        email.id === emailId ? { ...email, is_read: read } : email
      ));

      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, is_read: read });
      }
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const archiveEmail = async (emailId: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_archived: archived })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  };

  const markAsSpam = async (emailId: string, spam: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_spam: spam })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error marking email as spam:', error);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      email.subject.toLowerCase().includes(searchLower) ||
      email.from_email.toLowerCase().includes(searchLower) ||
      (email.from_name && email.from_name.toLowerCase().includes(searchLower)) ||
      (email.plain_text && email.plain_text.toLowerCase().includes(searchLower))
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const generateAiReply = async () => {
    if (!selectedEmail) return;

    setAiGenerating(true);
    setShowAiPanel(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const content = selectedEmail.plain_text || selectedEmail.html_content || '';
      const subjectLower = selectedEmail.subject.toLowerCase();

      let aiResponse = '';

      // Generate contextual responses based on email content and subject
      if (subjectLower.includes('booking') || subjectLower.includes('reservation') || content.toLowerCase().includes('book')) {
        aiResponse = `Dear ${selectedEmail.from_name || 'Customer'},

Thank you for your interest in booking a paragliding tour with Oludeniz Tours!

I've reviewed your inquiry and would be happy to help you arrange your flight experience. To proceed with your booking, please provide the following details:
- Preferred dates and times
- Number of participants
- Experience level (beginner/intermediate/advanced)
- Any special requirements or medical conditions

Our tandem flights are conducted by experienced pilots certified by the Turkish Civil Aviation Authority (DGCA), and all safety equipment is provided.

The current pricing is:
- Tandem Flight: €90 per person
- Group bookings (3+ people): €80 per person
- Video recording: Additional €20

Could you please let me know your availability so I can check our flight schedule and reserve the best time for you?

I'm looking forward to welcoming you to Oludeniz and sharing this incredible experience!

Best regards,
Oludeniz Tours Team
📞 +90 XXX XXX XX XX
🪂 Professional Paragliding Adventures`;
      }
      else if (subjectLower.includes('price') || subjectLower.includes('cost') || subjectLower.includes('fee') || content.toLowerCase().includes('price')) {
        aiResponse = `Dear ${selectedEmail.from_name || 'Customer'},

Thank you for your inquiry about our paragliding prices!

Here's our current pricing structure for the 2024 season:

🏆 TANDEM FLIGHTS (15 minutes):
• Standard Rate: €90 per person
• Group Rate (3+ people): €80 per person

✨ OPTIONAL ADD-ONS:
• HD Video Recording: €20
• Professional Photos: €15
• Certificate: €5

🎯 FAMILY PACKAGES:
• Family of 4: €70 per person (save €80 total!)
• Couple Package: €85 per person

All flights include:
✓ Certified pilot
✓ Professional equipment
✓ Insurance coverage
✓ Meeting point transportation
✓ Certificate upon completion

Weather permitting - all tours include free rescheduling if conditions are unsuitable.

Would you like me to check availability for your preferred dates?

Best regards,
Oludeniz Tours Team
📞 +90 XXX XXX XX XX
💰 Competitive Pricing Guaranteed`;
      }
      else if (subjectLower.includes('cancel') || subjectLower.includes('refund') || content.toLowerCase().includes('cancel')) {
        aiResponse = `Dear ${selectedEmail.from_name || 'Customer'},

I understand you'd like to discuss the cancellation policy for your booking.

Our cancellation policy is designed to be fair and flexible:

🆓 FREE CANCELLATION:
• Up to 48 hours before tour: 100% refund
• Up to 24 hours before tour: 50% refund

⚠️ WEATHER CANCELLATIONS:
• If we cancel due to weather: 100% refund or free reschedule
• If you cancel due to weather: Follow standard policy above

💼 FORCE MAJEURE:
• In case of extreme weather/events beyond our control: Full refund available

To process your cancellation request, please provide:
1. Your booking reference number
2. Reason for cancellation
3. Preferred refund method (bank transfer or original payment method)

I'll process your request immediately and confirm the refund within 3-5 business days.

If there's anything else I can help you with, please don't hesitate to contact me.

Best regards,
Oludeniz Tours Team
📞 +90 XXX XXX XX XX
🔄 Flexible Cancellation Policy`;
      }
      else if (subjectLower.includes('thank') || subjectLower.includes('review') || content.toLowerCase().includes('thank')) {
        aiResponse = `Dear ${selectedEmail.from_name || 'Customer'},

Thank you so much for your amazing feedback about your paragliding experience with us!

We're absolutely delighted to hear that you enjoyed your tandem flight over the breathtaking Oludeniz coastline. Your kind words mean the world to our team and motivate us to continue providing exceptional adventures.

We truly appreciate you taking the time to share your experience. Reviews like yours help other travelers discover the magic of paragliding at Oludeniz.

✨ We'd love it if you could share your experience on:
• Google Reviews
• TripAdvisor
• Our Facebook page

Your support helps us grow and allows more people to discover this incredible activity!

If you have any photos from your flight that you'd like to share with us, we'd love to feature them on our social media. Just reply to this email.

Once again, thank you for choosing Oludeniz Tours and for being an amazing guest!

Best regards,
Oludeniz Tours Team
📞 +90 XXX XXX XX XX
⭐ Thank you for your review!
🪂 Oludeniz Paragliding Adventures`;
      }
      else {
        // Generic inquiry response
        aiResponse = `Dear ${selectedEmail.from_name || 'Customer'},

Thank you for reaching out to Oludeniz Tours! We've received your inquiry about "${selectedEmail.subject}".

We're excited to help you plan your paragliding adventure in one of the most beautiful locations in Turkey. Oludeniz offers spectacular views and unforgettable flying experiences.

To provide you with the best possible assistance, could you please let me know:
• Your preferred dates for the activity
• Number of participants
• Any specific questions or requirements
• Experience level (beginner/intermediate/advanced)

We offer tandem flights starting from €90 per person, conducted by certified pilots with all safety equipment provided.

I look forward to hearing more details so I can provide personalized recommendations for your visit!

Best regards,
Oludeniz Tours Team
📞 +90 XXX XXX XX XX
🪂 Professional Paragliding Adventures in Oludeniz`;
      }

      setAiResponse(aiResponse);
    } catch (error) {
      setAiResponse('Sorry, I was unable to generate a response at this time. Please try again or compose manually.');
    } finally {
      setAiGenerating(false);
    }
  };

  const openInCompose = () => {
    if (!selectedEmail) return;

    const composeUrl = `/dashboard/mail/compose-page?reply=${encodeURIComponent(selectedEmail.id)}&subject=${encodeURIComponent('Re: ' + selectedEmail.subject)}&to=${encodeURIComponent(selectedEmail.from_email)}`;
    window.open(composeUrl, '_blank');
  };

  const handleSendFormDataChange = (field: string, value: string) => {
    setSendFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!sendFormData.to.trim() || !sendFormData.subject.trim() || !sendFormData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sendFormData.to.trim(),
          type: 'custom',
          subject: sendFormData.subject.trim(),
          message: sendFormData.message.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Email sent successfully!');
        // Reset form and hide it
        setSendFormData({ to: '', subject: '', message: '' });
        setShowSendForm(false);
      } else {
        alert(`Failed to send email: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Email List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mail Inbox</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSendForm(!showSendForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ✉️ Send Email
              </button>
              <Link
                href="/dashboard/mail/compose-page"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                ✏️ Compose Full
              </Link>
              <Link
                href="/dashboard/mail/test-page"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                🧪 Test Email
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 flex space-x-2">
            {[
              { key: 'all', label: 'All', count: emails.length },
              { key: 'unread', label: 'Unread', count: emails.filter(e => !e.is_read).length },
              { key: 'archived', label: 'Archived', count: emails.filter(e => e.is_archived).length },
              { key: 'spam', label: 'Spam', count: emails.filter(e => e.is_spam).length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === key
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading emails...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No emails found</div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (!email.is_read) {
                    markAsRead(email.id, true);
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.is_read ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        !email.is_read ? 'text-gray-900 font-semibold' : 'text-gray-700'
                      }`}>
                        {email.from_name || email.from_email}
                      </p>
                      {!email.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm truncate mt-1 ${
                      !email.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {email.plain_text?.substring(0, 100) || 'No preview available'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                      {email.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Detail View */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Quick Send Form */}
        {showSendForm && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">✉️ Send Email</h3>
              <button
                onClick={() => setShowSendForm(false)}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">To Email</label>
                <input
                  type="email"
                  value={sendFormData.to}
                  onChange={(e) => handleSendFormDataChange('to', e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={sendFormData.subject}
                  onChange={(e) => handleSendFormDataChange('subject', e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Message</label>
                <textarea
                  value={sendFormData.message}
                  onChange={(e) => handleSendFormDataChange('message', e.target.value)}
                  placeholder="Your email message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-vertical"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => {
                    setSendFormData({ to: '', subject: '', message: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      <strong>From:</strong> {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                    </span>
                    <span>
                      <strong>To:</strong> {selectedEmail.to_email}
                    </span>
                    <span>
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAsRead(selectedEmail.id, !selectedEmail.is_read)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Mark as {selectedEmail.is_read ? 'Unread' : 'Read'}
                  </button>
                  <button
                    onClick={() => archiveEmail(selectedEmail.id, !selectedEmail.is_archived)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    {selectedEmail.is_archived ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={() => markAsSpam(selectedEmail.id, !selectedEmail.is_spam)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                  >
                    Mark as Spam
                  </button>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Action Buttons */}
              <div className="mb-4 flex space-x-2">
                <button
                  onClick={generateAiReply}
                  disabled={aiGenerating || showAiPanel}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 text-sm font-medium"
                >
                  {aiGenerating ? '🤖 AI Generating...' : '🤖 Generate AI Reply'}
                </button>
                <button
                  onClick={openInCompose}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  ✉️ Reply
                </button>
              </div>

              {/* AI Response Panel */}
              {showAiPanel && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-purple-800">🤖 AI Generated Reply</h3>
                    <button
                      onClick={() => setShowAiPanel(false)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-purple-900 bg-white p-3 rounded border">
                    {aiResponse}
                  </pre>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        alert('Copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                    >
                      Copy Text
                    </button>
                    <button
                      onClick={openInCompose}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      Open in Composer
                    </button>
                  </div>
                </div>
              )}

              {selectedEmail.html_content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                  className="prose max-w-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {selectedEmail.plain_text || 'No content available'}
                </pre>
              )}

              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700">{attachment.filename}</span>
                        <span className="text-xs text-gray-500">({attachment.size} bytes)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Metadata */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Email Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Message ID:</span> {selectedEmail.message_id}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority}
                    </span>
                  </div>
                  {selectedEmail.forwarded_to && selectedEmail.forwarded_to.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium">Forwarded to:</span> {selectedEmail.forwarded_to.join(', ')}
                    </div>
                  )}
                  {selectedEmail.auto_replied && (
                    <div className="col-span-2">
                      <span className="font-medium text-green-600">Auto-replied</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>Select an email to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
