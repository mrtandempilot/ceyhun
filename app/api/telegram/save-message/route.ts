import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// API endpoint for n8n to save messages to dashboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chat_id, message_id, sender, message_text, customer_name, customer_username } = body;

    console.log('📥 n8n Save Message Request:', { chat_id, message_id, sender });

    if (!chat_id || !message_text) {
      return NextResponse.json({ error: 'chat_id and message_text required' }, { status: 400 });
    }

    // Find or create conversation
    let { data: conversations, error: findError } = await supabaseAdmin
      .from('telegram_conversations')
      .select('id')
      .eq('telegram_chat_id', chat_id.toString());

    if (findError) {
      console.error('❌ Error finding conversation:', findError);
      throw findError;
    }

    let conversationId: string;

    if (conversations && conversations.length > 0) {
      conversationId = conversations[0].id;
      console.log('✅ Found existing conversation:', conversationId);
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabaseAdmin
        .from('telegram_conversations')
        .insert({
          telegram_chat_id: chat_id,
          customer_name: customer_name || 'Unknown',
          customer_username: customer_username || null,
          status: 'active'
        })
        .select('id')
        .single();

      if (createError) throw createError;
      conversationId = newConv.id;
      console.log('✅ Created new conversation:', conversationId);
    }

    // Save the message
    const { data: savedMessage, error: messageError } = await supabaseAdmin
      .from('telegram_messages')
      .insert({
        conversation_id: conversationId,
        telegram_message_id: message_id || Date.now(),
        sender: sender || 'user',
        message_text: message_text,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update conversation last_message_at
    await supabaseAdmin
      .from('telegram_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('💾 Message saved:', savedMessage.id);

    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message_id: savedMessage.id
    });

  } catch (error: any) {
    console.error('❌ Save message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save message' },
      { status: 500 }
    );
  }
}
