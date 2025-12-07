'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

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

interface MailUser {
  username: string;
  email: string;
  created_at: string;
}

export default function MailPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'server'>('inbox');
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<IncomingEmail | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived' | 'spam'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Server management state
  const [serverStatus, setServerStatus] = useState({
    postfix: 'unknown',
    dovecot: 'unknown',
    opendkim: 'unknown'
  });
  const [dkimKey, setDkimKey] = useState('');
  const [copiedDkim, setCopiedDkim] = useState(false);

  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchEmails();
    }
  }, [filter, activeTab]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .order('received_at', { ascending: false });

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

  const copyDkimKey = () => {
    const fullKey = `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsd3a2ojbXoySpIPF5/EFp/1x5cz8SDaPYZtqMOW76anJMNPIqxoKnXHNEqs3FiRAQlDn6qsnWXkUiNlhJB9W7hAjq1LwY8mn3HibRALNI6SdUc5aM6gmH5ssdyiUvk50z5p1vX/2Pu3TCc8BDnpb+YxpyLYdL5uFuj8kV9dQIx/xr+644MTFcEuNOx2xd49PAt2nqV5RwIe7+Cg2dMiMFDXtw0TNdJPv6d2zTh4zEm2INoRm8o/VXH8UZMMD7qxiEGZhYyTNFOtmkFnF8Ysp5Ztcu11IZQbWCdpIuz55FT+EyZ6Nur0f//iqQjhtMHW9PGRehST6v5hEHx2k5etuTwIDAQAB`;
    navigator.clipboard.writeText(fullKey);
    setCopiedDkim(true);
    setTimeout(() => setCopiedDkim(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Mail Management</h1>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-6 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === 'inbox'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Inbox</span>
                {emails.filter(e => !e.is_read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {emails.filter(e => !e.is_read).length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('server')}
              className={`px-6 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === 'server'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span>Server Management</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'inbox' ? (
          // Inbox View
          <div className="flex h-[calc(100vh-180px)] bg-gray-800 rounded-lg overflow-hidden">
            {/* Email List Sidebar */}
            <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-700">
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All', count: emails.length },
                    { key: 'unread', label: 'Unread', count: emails.filter(e => !e.is_read).length },
                    { key: 'archived', label: 'Archived', count: emails.filter(e => e.is_archived).length },
                    { key: 'spam', label: 'Spam', count: emails.filter(e => e.is_spam).length },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${filter === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                  <div className="p-4 text-center text-gray-400">Loading emails...</div>
                ) : filteredEmails.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">No emails found</div>
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
                      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${selectedEmail?.id === email.id ? 'bg-gray-700' : ''
                        } ${!email.is_read ? 'bg-gray-750' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm truncate ${!email.is_read ? 'text-white font-semibold' : 'text-gray-300'
                              }`}>
                              {email.from_name || email.from_email}
                            </p>
                            {!email.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm truncate mt-1 ${!email.is_read ? 'text-white font-medium' : 'text-gray-400'
                            }`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {email.plain_text?.substring(0, 100) || 'No preview available'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1 ml-2">
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
            <div className="flex-1 bg-gray-800 flex flex-col">
              {selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white mb-2">
                          {selectedEmail.subject}
                        </h2>
                        <div className="flex flex-col space-y-1 text-sm text-gray-400">
                          <span>
                            <strong className="text-gray-300">From:</strong> {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                          </span>
                          <span>
                            <strong className="text-gray-300">To:</strong> {selectedEmail.to_email}
                          </span>
                          <span>
                            {new Date(selectedEmail.received_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAsRead(selectedEmail.id, !selectedEmail.is_read)}
                          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                        >
                          Mark as {selectedEmail.is_read ? 'Unread' : 'Read'}
                        </button>
                        <button
                          onClick={() => archiveEmail(selectedEmail.id, !selectedEmail.is_archived)}
                          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                        >
                          {selectedEmail.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => markAsSpam(selectedEmail.id, !selectedEmail.is_spam)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                        >
                          Spam
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {selectedEmail.html_content ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                        className="prose prose-invert max-w-none"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-gray-300">
                        {selectedEmail.plain_text || 'No content available'}
                      </pre>
                    )}

                    {/* Attachments */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-white mb-2">Attachments</h3>
                        <div className="space-y-2">
                          {selectedEmail.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm text-gray-300">{attachment.filename}</span>
                              <span className="text-xs text-gray-500">({attachment.size} bytes)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">Select an email to view its contents</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Server Management View
          <div className="space-y-6">
            {/* Server Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mail Server Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Postfix (SMTP)</p>
                      <p className="text-2xl font-bold text-green-400">Active</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Mail sending service</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Dovecot (IMAP/POP3)</p>
                      <p className="text-2xl font-bold text-green-400">Active</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Mail receiving service</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">OpenDKIM</p>
                      <p className="text-2xl font-bold text-yellow-400">Configured</p>
                    </div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Email authentication</p>
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Server Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">Server IP</p>
                  <p className="text-white font-mono">5.175.136.227</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">Hostname</p>
                  <p className="text-white font-mono">mail.oludenizexplorer.com.tr</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">Domain</p>
                  <p className="text-white font-mono">oludenizexplorer.com.tr</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 mb-1">Ports</p>
                  <p className="text-white font-mono">25, 587, 465, 993, 995</p>
                </div>
              </div>
            </div>

            {/* DKIM Configuration */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                DKIM Public Key
              </h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">DNS Record Type: <span className="text-white font-mono">TXT</span></p>
                    <p className="text-sm text-gray-400 mb-2">Host: <span className="text-white font-mono">default._domainkey.oludenizexplorer.com.tr</span></p>
                  </div>
                  <button
                    onClick={copyDkimKey}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center space-x-2"
                  >
                    {copiedDkim ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                  <code className="text-xs text-green-400 font-mono break-all">
                    v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsd3a2ojbXoySpIPF5/EFp/1x5cz8SDaPYZtqMOW76anJMNPIqxoKnXHNEqs3FiRAQlDn6qsnWXkUiNlhJB9W7hAjq1LwY8mn3HibRALNI6SdUc5aM6gmH5ssdyiUvk50z5p1vX/2Pu3TCc8BDnpb+YxpyLYdL5uFuj8kV9dQIx/xr+644MTFcEuNOx2xd49PAt2nqV5RwIe7+Cg2dMiMFDXtw0TNdJPv6d2zTh4zEm2INoRm8o/VXH8UZMMD7qxiEGZhYyTNFOtmkFnF8Ysp5Ztcu11IZQbWCdpIuz55FT+EyZ6Nur0f//iqQjhtMHW9PGRehST6v5hEHx2k5etuTwIDAQAB
                  </code>
                </div>
              </div>
            </div>

            {/* DNS Configuration Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">DNS Configuration Status</h2>
              <div className="space-y-3">
                {[
                  { name: 'A Record', status: 'pending', value: 'mail.oludenizexplorer.com.tr → 5.175.136.227' },
                  { name: 'MX Record', status: 'pending', value: 'oludenizexplorer.com.tr → mail.oludenizexplorer.com.tr' },
                  { name: 'SPF Record', status: 'pending', value: 'v=spf1 mx ip4:5.175.136.227 ~all' },
                  { name: 'DKIM Record', status: 'pending', value: 'default._domainkey → [Public Key]' },
                  { name: 'DMARC Record', status: 'pending', value: '_dmarc → v=DMARC1; p=quarantine' },
                  { name: 'PTR Record', status: 'pending', value: '5.175.136.227 → mail.oludenizexplorer.com.tr' },
                ].map((record, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{record.name}</p>
                      <p className="text-sm text-gray-400 font-mono mt-1">{record.value}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs font-medium">
                      Pending DNS
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> DNS records need to be added to your domain registrar. Propagation can take 1-24 hours.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-left transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="font-medium">Create Mail User</p>
                  <p className="text-xs text-blue-200 mt-1">Add new email account</p>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-left transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">Test Connection</p>
                  <p className="text-xs text-green-200 mt-1">Verify SMTP/IMAP</p>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-left transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">View Logs</p>
                  <p className="text-xs text-purple-200 mt-1">Check mail server logs</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
