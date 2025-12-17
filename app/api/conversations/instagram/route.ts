import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Fetch messages for a specific conversation
      const { data: messages, error } = await supabaseAdmin
        .from('instagram_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json(messages);
    }

    // Fetch all conversations with last message and message count
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('instagram_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (convError) throw convError;

    // Enrich with last message and message count
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get last message
        const { data: lastMessages } = await supabaseAdmin
          .from('instagram_messages')
          .select('content, sender, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get message count
        const { count } = await supabaseAdmin
          .from('instagram_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        return {
          ...conv,
          lastMessage: lastMessages?.[0] || null,
          messageCount: count || 0
        };
      })
    );

    return NextResponse.json(enrichedConversations);

  } catch (error: any) {
    console.error('❌ Instagram conversations API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'conversationId and message required' }, { status: 400 });
    }

    // Get conversation to find instagram_id
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('instagram_conversations')
      .select('instagram_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save message to database
    const { data: savedMessage, error: msgError } = await supabaseAdmin
      .from('instagram_messages')
      .insert({
        conversation_id: conversationId,
        message_id: `manual_${Date.now()}`,
        sender: 'business',
        content: message,
        status: 'sent'
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Update conversation last_message_at
    await supabaseAdmin
      .from('instagram_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send to Instagram via API
    try {
      const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
      const INSTAGRAM_PAGE_ID = process.env.INSTAGRAM_PAGE_ID;

      if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_PAGE_ID) {
        const response = await fetch(
          `https://graph.instagram.com/v21.0/${INSTAGRAM_PAGE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient: { id: conversation.instagram_id },
              message: { text: message }
            })
          }
        );

        if (!response.ok) {
          console.error('❌ Instagram API error:', await response.text());
        } else {
          console.log('✅ Message sent to Instagram');
        }
      }
    } catch (sendError) {
      console.error('❌ Failed to send to Instagram:', sendError);
    }

    return NextResponse.json({
      success: true,
      message: savedMessage
    });

  } catch (error: any) {
    console.error('❌ Send Instagram message error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
