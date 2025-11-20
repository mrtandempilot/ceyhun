'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, Calendar, Info, RefreshCw, Search, Phone } from 'lucide-react';

interface Message {
  id: string;
  session_id: string;
  customer_email: string | null;
  customer_name: string | null;
  message: string;
  sender: 'user' | 'bot';
  visitor_info: any;
  created_at: string;
  channel?: string;
}

interface ConversationSession {
  sessionId: string;
  messages: Message[];
  lastMessage: Message;
  messageCount: number;
  visitorInfo: any;
}

interface WhatsAppConversation {
  id: string;
  phone_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  lastMessage: {
    content: string;
    sender: string;
    created_at: string;
  } | null;
  messageCount: number;
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [whatsappConversations, setWhatsappConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'chatbot' | 'whatsapp'>('chatbot');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch chatbot conversations
      const chatResponse = await fetch('/api/chat');
      if (!chatResponse.ok) throw new Error('Failed to fetch chatbot conversations');
      const chatData = await chatResponse.json();
      setSessions(chatData);

      // Fetch WhatsApp conversations
      const whatsappResponse = await fetch('/api/conversations/whatsapp');
      if (!whatsappResponse.ok) throw new Error('Failed to fetch WhatsApp conversations');
      const whatsappData = await whatsappResponse.json();
      setWhatsappConversations(whatsappData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.sessionId.toLowerCase().includes(search) ||
      session.messages.some(msg => msg.message.toLowerCase().includes(search)) ||
      (session.visitorInfo && JSON.stringify(session.visitorInfo).toLowerCase().includes(search))
    );
  });

  const filteredWhatsApp = whatsappConversations.filter(conv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.phone_number.toLowerCase().includes(search) ||
      (conv.customer_name && conv.customer_name.toLowerCase().includes(search)) ||
      (conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(search))
    );
  });

  const selectedConversation = selectedSession 
    ? sessions.find(s => s.sessionId === selectedSession)
    : null;

  const selectedWhatsAppConv = selectedWhatsApp
    ? whatsappConversations.find(c => c.id === selectedWhatsApp)
    : null;

  // Calculate today's stats
  const today = new Date().toDateString();
  const todayChatbotChats = sessions.filter(s => 
    new Date(s.lastMessage.created_at).toDateString() === today
  ).length;
  const todayWhatsAppChats = whatsappConversations.filter(c => 
    new Date(c.last_message_at).toDateString() === today
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              All Conversations
            </h1>
            <p className="text-gray-600 mt-1">Chatbot & WhatsApp messages in one place</p>
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                <p className="text-sm text-gray-600">Chatbot Conversations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{whatsappConversations.length}</p>
                <p className="text-sm text-gray-600">WhatsApp Conversations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayChatbotChats}</p>
                <p className="text-sm text-gray-600">Chatbot Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayWhatsAppChats}</p>
                <p className="text-sm text-gray-600">WhatsApp Today</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chatbot Conversations - LEFT SIDE */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Chatbot Conversations
              </h2>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No chatbot conversations</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => {
                      setSelectedSession(session.sessionId);
                      setSelectedChannel('chatbot');
                      setSelectedWhatsApp(null);
                    }}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      selectedSession === session.sessionId && selectedChannel === 'chatbot'
                        ? 'bg-blue-100 border-l-4 border-l-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {session.messages[0]?.customer_email || `Visitor #${session.sessionId.slice(-6)}`}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {session.lastMessage.message.substring(0, 50)}
                          {session.lastMessage.message.length > 50 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.lastMessage.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {session.messageCount} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* WhatsApp Conversations - RIGHT SIDE */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                WhatsApp Conversations
              </h2>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredWhatsApp.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No WhatsApp conversations</p>
                </div>
              ) : (
                filteredWhatsApp.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedWhatsApp(conv.id);
                      setSelectedChannel('whatsapp');
                      setSelectedSession(null);
                    }}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-green-50 transition-colors ${
                      selectedWhatsApp === conv.id && selectedChannel === 'whatsapp'
                        ? 'bg-green-100 border-l-4 border-l-green-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-700 truncate">
                          📱 {conv.customer_name || conv.phone_number}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conv.lastMessage?.content?.substring(0, 50)}
                          {conv.lastMessage && conv.lastMessage.content.length > 50 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(conv.last_message_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-green-100 px-2 py-0.5 rounded">
                            {conv.messageCount} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Conversation Details - FULL WIDTH BELOW */}
        {(selectedConversation || selectedWhatsAppConv) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            {selectedChannel === 'chatbot' && selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                  <h2 className="text-lg font-semibold text-blue-600">
                    📧 {selectedConversation.messages[0]?.customer_email || `Visitor #${selectedConversation.sessionId.slice(-6)}`}
                  </h2>
                  {selectedConversation.messages[0]?.customer_name && (
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedConversation.messages[0].customer_name}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedConversation.lastMessage.created_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {selectedConversation.messageCount} messages
                    </span>
                  </div>
                  {selectedConversation.visitorInfo && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Visitor Information
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedConversation.visitorInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-350px)] space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'user' ? 'User' : 'Bot'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : selectedChannel === 'whatsapp' && selectedWhatsAppConv ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-green-50">
                  <h2 className="text-lg font-semibold text-green-700">
                    📱 {selectedWhatsAppConv.customer_name || selectedWhatsAppConv.phone_number}
                  </h2>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedWhatsAppConv.last_message_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {selectedWhatsAppConv.messageCount} messages
                    </span>
                  </div>
                </div>
                <div className="p-4 text-center text-gray-500">
                  <p>WhatsApp message view coming soon</p>
                  <p className="text-sm mt-2">Conversation ID: {selectedWhatsAppConv.id}</p>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
