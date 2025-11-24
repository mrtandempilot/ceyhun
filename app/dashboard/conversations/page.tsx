'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, Calendar, Info, RefreshCw, Search, Phone, Check, CheckCircle } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  message_id: string;
  sender: 'customer' | 'business';
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location';
  content: string;
  media_url?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  created_at: string;
}

interface WhatsAppConversation {
  id: string;
  phone_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  lastMessage?: {
    content: string;
    sender: string;
    created_at: string;
  };
  messageCount: number;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations/whatsapp');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/whatsapp?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.phone_number.toLowerCase().includes(search) ||
      (conv.customer_name && conv.customer_name.toLowerCase().includes(search)) ||
      (conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(search))
    );
  });

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              WhatsApp Conversations
            </h1>
            <p className="text-gray-600 mt-1">Manage your WhatsApp customer chats</p>
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No WhatsApp conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversationId === conv.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.customer_name || conv.phone_number}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(conv.last_message_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.phone_number}
                        </p>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conv.lastMessage?.content || 'No messages'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {selectedConversation.customer_name || selectedConversation.phone_number}
                      {selectedConversation.status === 'active' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedConversation.phone_number}
                      </span>
                      {selectedConversation.customer_email && (
                        <span>{selectedConversation.customer_email}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-lg p-4 shadow-sm border ${message.sender === 'business'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${message.sender === 'business'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                                }`}>
                                {message.sender === 'business' ? 'You' : 'Customer'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {message.sender === 'business' && (
                              <span className="text-blue-500">
                                {message.status === 'read' ? (
                                  <div className="flex">
                                    <Check className="w-3 h-3" />
                                    <Check className="w-3 h-3 -ml-1" />
                                  </div>
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>

                          {message.media_url && (
                            <div className="mb-3">
                              {message.message_type === 'image' ? (
                                <img src={message.media_url} alt="Shared media" className="rounded-lg max-w-full h-32 object-cover" />
                              ) : (
                                <a
                                  href={message.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline text-sm flex items-center gap-1"
                                >
                                  📎 View {message.message_type}
                                </a>
                              )}
                            </div>
                          )}

                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>

                          <div className="mt-2 text-xs text-gray-500">
                            {message.message_type !== 'text' && (
                              <span className="capitalize">{message.message_type}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-gray-500 bg-[#f0f2f5]">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
