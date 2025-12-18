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
    const { data, error: convError } = await supabaseAdmin
      .from('instagram_conversations')
      .select('id, instagram_id, customer_name, username, status, last_message_at, created_at, profile_picture_url')
      .order('last_message_at', { ascending: false });

    if (convError) throw convError;

    // Simple enrichment without external API calls
    const enrichedConversations = await Promise.all(
      (data || []).map(async (conv: any) => {
        const { data: lastMessages } = await supabaseAdmin
          .from('instagram_messages')
          .select('content, sender, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);

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

    // Send to Instagram via API - using the same token as n8n workflow
    const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || 'IGAAVCDzt1sIxBZAFlqUnJtejhGNGZAWdThlTG9QYkMyYWxISVBBUVZA6T0NVU2NET3pUQkJVUUNlcXlWMTYyRFFSNEN1M25oZAFlSemVaZAUFuZA0VYN2NYOG9HNkpfV3pEZAG92MHhSZA1pZAWFJkM1dmZA3dUNWU2Nl93LTFHNFZAJR3NlYwZDZD';
    
    // recipient.id'yi kullanarak gönder - n8n workflow'daki gibi
    try {
      const response = await fetch(
        `https://graph.instagram.com/v21.0/me/messages`,
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

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('❌ Instagram API error:', responseText);
        // Still return success since message is saved to DB
      } else {
        console.log('✅ Message sent to Instagram:', responseText);
      }
    } catch (sendError) {
      console.error('❌ Failed to send to Instagram:', sendError);
      // Don't throw - message is already saved to database
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
