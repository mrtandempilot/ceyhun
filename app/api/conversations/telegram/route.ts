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
  console.log('🔍 Telegram API called:', request.url);

  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    console.log('🔍 Query params:', { conversationId });

    if (conversationId) {
      // Fetch specific conversation messages
      console.log('🔍 Fetching messages for conversation:', conversationId);

      const { data: messages, error } = await supabaseAdmin
        .from('telegram_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      console.log('✅ Messages found:', messages?.length || 0);
      return NextResponse.json(messages || []);
    } else {
      // Fetch all conversations
      console.log('🔍 Fetching all telegram conversations...');

      const { data: conversations, error } = await supabaseAdmin
        .from('telegram_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching telegram_conversations:', error);
        // Check for specific errors
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          console.error('RLS policy error - checking policies...');
        }
        return NextResponse.json([]);
      }

      console.log('✅ Raw conversations found:', conversations?.length || 0);

      // Process conversations to add last message and count
      const processedConversations: TelegramConversation[] = [];

      if (conversations && conversations.length > 0) {
        console.log('🔍 Processing', conversations.length, 'conversations...');

        for (const conv of conversations) {
          try {
            console.log('🔍 Processing conversation:', conv.id, conv.customer_name);

            // Get message count
            const { count: messageCount, error: countError } = await supabaseAdmin
              .from('telegram_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);

            if (countError) {
              console.error('❌ Error counting messages for', conv.id, ':', countError);
            }

            processedConversations.push({
              ...conv,
              lastMessage: undefined, // Skip last message for now
              messageCount: messageCount || 0
            });
          } catch (e) {
            console.error(`❌ Error processing conversation ${conv.id}:`, e);
            processedConversations.push({
              ...conv,
              messageCount: 0
            });
          }
        }
      }

      console.log('✅ Processed conversations:', processedConversations.length);
      return NextResponse.json(processedConversations);
    }
  } catch (error: any) {
    console.error('❌ Critical error in Telegram API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations', details: error.stack },
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
