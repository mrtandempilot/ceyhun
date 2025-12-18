'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, RefreshCw, Search, Send, Instagram } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InstagramMessage {
  id: string;
  conversation_id: string;
  message_id: string;
  sender: 'customer' | 'business';
  content: string;
  status: string;
  created_at: string;
}

interface InstagramConversation {
  id: string;
  instagram_id: string;
  customer_name: string | null;
  username: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  profile_picture_url?: string | null;
  lastMessage?: {
    content: string;
    sender: string;
    created_at: string;
  };
  messageCount: number;
  manual_mode_active?: boolean;
  manual_mode_expires_at?: string | null;
}

export default function InstagramChatPage() {
  const [conversations, setConversations] = useState<InstagramConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InstagramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-scroll to bottom function
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations/instagram');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/instagram?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      // Auto-scroll to bottom when loading messages
      setTimeout(() => scrollToBottom(false), 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!replyMessage.trim() || !selectedConversationId || sendingMessage) return;

    const messageToSend = replyMessage.trim();
    setReplyMessage('');
    setSendingMessage(true);

    // Optimistic UI update
    const optimisticMessage: InstagramMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversationId,
      message_id: `temp-${Date.now()}`,
      sender: 'business',
      content: messageToSend,
      status: 'sending',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const response = await fetch('/api/conversations/instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          message: messageToSend,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Remove optimistic message - real one will come via Realtime
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Function to toggle manual mode for a conversation
  const toggleManualMode = async (conversationId: string, instagramId: string, enable: boolean) => {
    try {
      const response = await fetch('/api/instagram/check-manual-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagram_id: instagramId,
          action: enable ? 'enable' : 'disable'
        }),
      });

      if (!response.ok) throw new Error('Failed to update manual mode');

      const result = await response.json();
      console.log('✅ Manual mode updated:', result);

      // Refresh conversations to update status
      await fetchConversations();

    } catch (err) {
      console.error('❌ Error toggling manual mode:', err);
      alert('Failed to update conversation mode. Please try again.');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      setUserScrolledUp(false);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // Supabase Realtime subscriptions for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    console.log('🔗 Setting up Supabase Realtime subscriptions...');

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('instagram-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'instagram_messages'
        },
        (payload) => {
          console.log('🔔 New Instagram message received:', payload);
          const newMessage = payload.new as InstagramMessage;

          // Update messages if it's for the current conversation
          if (selectedConversationId && newMessage.conversation_id === selectedConversationId) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev;
              const updated = [...prev, newMessage];
              // Auto-scroll only if user hasn't scrolled up
              setTimeout(() => {
                if (!userScrolledUp) scrollToBottom();
              }, 100);
              return updated;
            });
          }

          // Refresh conversations list to update last message
          fetchConversations();
          setLastRefresh(new Date());
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('instagram-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instagram_conversations'
        },
        (payload) => {
          console.log('🔔 Instagram conversation updated:', payload);
          fetchConversations();
          setLastRefresh(new Date());
        }
      )
      .subscribe((status) => {
        console.log('📡 Conversations subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up Supabase Realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [autoRefresh, selectedConversationId, userScrolledUp]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.instagram_id.toLowerCase().includes(search) ||
      (conv.customer_name && conv.customer_name.toLowerCase().includes(search)) ||
      (conv.username && conv.username.toLowerCase().includes(search)) ||
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
              <Instagram className="w-8 h-8 text-pink-500" />
              Instagram Chat
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-4">
              <span>Chat with your Instagram DM customers</span>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${autoRefresh
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              {autoRefresh ? '🔄' : '⏸️'}
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-pink-500" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Instagram className="w-12 h-12 mx-auto mb-2 opacity-50 text-pink-300" />
                  <p>No Instagram conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-pink-50 transition-colors ${selectedConversationId === conv.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center border-2 border-pink-200">
                            <span className="text-white text-lg">👤</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conv.customer_name || conv.username || `User ${conv.instagram_id.slice(-6)}`}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleManualMode(conv.id, conv.instagram_id, !conv.manual_mode_active);
                                }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${conv.manual_mode_active
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                title={conv.manual_mode_active ? 'Bot susturulmuş - Manuel konuşma' : 'Bot aktif - Otomatik yanıt'}
                              >
                                {conv.manual_mode_active ? '🤖⛔' : '🤖✅'}
                                {conv.manual_mode_active ? 'Manual' : 'Auto'}
                              </button>
                              <span className="text-xs text-gray-500">
                                {new Date(conv.last_message_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            ID: ...{conv.instagram_id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conv.lastMessage?.content || 'No messages'}
                          </p>
                          {conv.messageCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                              {conv.messageCount} messages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-sm border-2 border-pink-300">
                      <span className="text-white text-xl">👤</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        {selectedConversation.customer_name || selectedConversation.username || `User ${selectedConversation.instagram_id.slice(-6)}`}
                        {selectedConversation.status === 'active' && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>@{selectedConversation.username || 'instagram_user'}</span>
                        <span>Instagram ID: ...{selectedConversation.instagram_id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedConversation.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedConversation.status}
                  </span>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 bg-gray-50"
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    const isScrolledToBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
                    setUserScrolledUp(!isScrolledToBottom);
                  }}
                >
                  {loadingMessages ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${message.sender === 'business' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${message.sender === 'business'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                              }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.sender === 'business' ? 'text-pink-200' : 'text-gray-500'
                              }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Invisible div for auto-scrolling */}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !replyMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-gray-500 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center">
                  <Instagram className="w-16 h-16 mx-auto mb-4 text-pink-300" />
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
