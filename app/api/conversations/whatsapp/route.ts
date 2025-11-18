import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // If conversationId provided, get messages for that conversation
    if (conversationId) {
      const { data: messages, error } = await supabaseAdmin
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching WhatsApp messages:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(messages);
    }

    // Otherwise, get all conversations with their latest message
    const { data: conversations, error } = await supabaseAdmin
      .from('whatsapp_conversations')
      .select(`
        id,
        phone_number,
        customer_name,
        customer_email,
        status,
        last_message_at,
        created_at
      `)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching WhatsApp conversations:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const { data: lastMessage } = await supabaseAdmin
          .from('whatsapp_messages')
          .select('content, sender, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: messageCount } = await supabaseAdmin
          .from('whatsapp_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        return {
          ...conv,
          lastMessage: lastMessage || null,
          messageCount: messageCount || 0,
        };
      })
    );

    return NextResponse.json(conversationsWithMessages);
  } catch (error: any) {
    console.error('Error in WhatsApp conversations API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
