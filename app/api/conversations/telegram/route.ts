import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
  last_message_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  lastMessage?: {
    message_text: string;
    sender: string;
    created_at: string;
  };
  messageCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Fetch specific conversation messages
      const { data: messages, error } = await supabaseAdmin
        .from('telegram_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return NextResponse.json(messages || []);
    } else {
      // Fetch all conversations (simplified first to debug)
      const { data: conversations, error } = await supabaseAdmin
        .from('telegram_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching telegram_conversations:', error);
        // If table doesn't exist, return empty array instead of error
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('telegram_conversations table does not exist, returning empty array');
          return NextResponse.json([]);
        }
        throw error;
      }

      console.log('Raw conversations data:', conversations);

      // For each conversation, get the last message and count manually
      const processedConversations: TelegramConversation[] = [];

      if (conversations) {
        for (const conv of conversations) {
          try {
            // Get message count
            const { count: messageCount, error: countError } = await supabaseAdmin
              .from('telegram_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);

            // Get last message
            const { data: lastMessageData, error: lastMsgError } = await supabaseAdmin
              .from('telegram_messages')
              .select('message_text, sender, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            processedConversations.push({
              ...conv,
              lastMessage: !lastMsgError && lastMessageData ? {
                message_text: lastMessageData.message_text,
                sender: lastMessageData.sender,
                created_at: lastMessageData.created_at
              } : undefined,
              messageCount: messageCount || 0
            });
          } catch (e) {
            console.error(`Error processing conversation ${conv.id}:`, e);
            // Still add the conversation even if message fetch fails
            processedConversations.push({
              ...conv,
              messageCount: 0
            });
          }
        }
      }

      console.log('Processed conversations:', processedConversations);
      return NextResponse.json(processedConversations);
    }
  } catch (error: any) {
    console.error('Error fetching Telegram conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Conversation ID and message are required' },
        { status: 400 }
      );
    }

    // Get conversation details to find chat ID
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('telegram_conversations')
      .select('telegram_chat_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Save message to database
    const { data: savedMessage, error: saveError } = await supabaseAdmin
      .from('telegram_messages')
      .insert({
        conversation_id: conversationId,
        telegram_message_id: Date.now(), // Generate temporary ID
        sender: 'bot',
        message_text: message,
        message_type: 'text'
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Update conversation last_message_at
    await supabaseAdmin
      .from('telegram_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // TODO: In a real implementation, you would send message to Telegram API
    // For now, just return success
    console.log('📤 Telegram message sent to chat:', conversation.telegram_chat_id, 'Message:', message);

    return NextResponse.json({
      success: true,
      message: savedMessage,
      note: 'Message saved to database (Telegram API integration needed for actual sending)'
    });

  } catch (error: any) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
