'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, Calendar, Info, RefreshCw, Search, Send, Phone, Check, CheckCircle } from 'lucide-react';

interface TelegramMessage {
  id: string;
  conversation_id: string;
  telegram_message_id: number;
  sender: 'user' | 'bot';
  message_text: string;
  message_type: string;
  media_url?: string;
  created_at: string;
}

interface TelegramConversation {
  id: string;
  telegram_chat_id: number;
  customer_name: string | null;
  customer_username: string | null;
  customer_phone: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  lastMessage?: {
    message_text: string;
    sender: string;
    created_at: string;
  };
  messageCount: number;
  manualModeActive?: boolean;
  manualModeExpiresAt?: string | null;
}

export default function TelegramChatPage() {
  const [conversations, setConversations] = useState<TelegramConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations/telegram');
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
      const response = await fetch(`/api/conversations/telegram?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
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

    try {
      const response = await fetch('/api/conversations/telegram', {
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

      // Refresh messages to show the new reply
      await fetchMessages(selectedConversationId);
      await fetchConversations(); // Refresh conversation list too
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
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

  // Function to toggle manual mode for a conversation
  const toggleManualMode = async (conversationId: string, telegramChatId: number, enable: boolean) => {
    try {
      const response = await fetch('/api/telegram/check-manual-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId.toString(),
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

  // Real-time updates using Server-Sent Events
  useEffect(() => {
    if (!autoRefresh) return;

    console.log('🔗 Connecting to SSE...');

    const eventSource = new EventSource('/api/sse/telegram');

    eventSource.onopen = () => {
      console.log('🔗 SSE connection established');
      setLastRefresh(new Date());
    };

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);

        if (update.type === 'connected') {
          console.log('🔗 SSE connected and ready');
          return;
        }

        console.log('🔗 SSE update received:', update.type);

        if (update.type === 'conversations') {
          // Refresh conversations list
          fetchConversations();
        } else if (update.type === 'messages' && selectedConversationId) {
          // Refresh current conversation if it's the updated one
          if (update.data.conversation_id === selectedConversationId) {
            fetchMessages(selectedConversationId);
          }
        }

        setLastRefresh(new Date());
      } catch (error) {
        console.error('❌ SSE message parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      setAutoRefresh(false); // Disable auto-refresh on error
    };

    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  }, [autoRefresh, selectedConversationId]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.telegram_chat_id.toString().includes(search) ||
      (conv.customer_name && conv.customer_name.toLowerCase().includes(search)) ||
      (conv.customer_username && conv.customer_username.toLowerCase().includes(search)) ||
      (conv.lastMessage && conv.lastMessage.message_text.toLowerCase().includes(search))
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
              Telegram Chat
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-4">
              <span>Real-time chat with your Telegram customers</span>
              {autoRefresh && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live • Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                autoRefresh
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {autoRefresh ? '🔄' : '⏸️'}
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or chat ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <p>No Telegram conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.customer_name || `@${conv.customer_username}` || `Chat ${conv.telegram_chat_id}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleManualMode(conv.id, conv.telegram_chat_id, !conv.manualModeActive);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                conv.manualModeActive
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                              title={conv.manualModeActive ? 'Bot susturulmuş - Manuel konuşma' : 'Bot aktif - Otomatik yanıt'}
                            >
                              {conv.manualModeActive ? '🤖⛔' : '🤖✅'}
                              {conv.manualModeActive ? 'Manual' : 'Auto'}
                            </button>
                            <span className="text-xs text-gray-500">
                              {new Date(conv.last_message_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          ID: {conv.telegram_chat_id}
                        </p>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conv.lastMessage?.message_text || 'No messages'}
                        </p>
                        {conv.messageCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {conv.messageCount} messages
                          </span>
                        )}
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
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {selectedConversation.customer_name || `@${selectedConversation.customer_username}` || `Chat ${selectedConversation.telegram_chat_id}`}
                      {selectedConversation.status === 'active' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        Chat ID: {selectedConversation.telegram_chat_id}
                      </span>
                      {selectedConversation.customer_username && (
                        <span>@{selectedConversation.customer_username}</span>
                      )}
                      {selectedConversation.customer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedConversation.customer_phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedConversation.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedConversation.status}
                    </span>
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
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${message.sender === 'bot' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${message.sender === 'bot'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                              }`}
                          >
                            {message.media_url && (
                              <div className="mb-2">
                                {message.message_type === 'image' ? (
                                  <img src={message.media_url} alt="Shared media" className="rounded-lg max-w-full h-32 object-cover" />
                                ) : (
                                  <a
                                    href={message.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`underline text-sm flex items-center gap-1 ${message.sender === 'bot' ? 'text-blue-200' : 'text-blue-600'
                                      }`}
                                  >
                                    📎 View {message.message_type}
                                  </a>
                                )}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                            <p className={`text-xs mt-2 ${message.sender === 'bot' ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !replyMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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
