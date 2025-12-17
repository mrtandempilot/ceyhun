import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram_id, message_id, sender, content } = body;

    console.log('📥 Instagram save-message received:', { instagram_id, sender, content: content?.slice(0, 50) });

    if (!instagram_id || !content) {
      return NextResponse.json({ error: 'instagram_id and content required' }, { status: 400 });
    }

    // 1. Get or create conversation
    let conversationId: string;
    
    // Check existing conversation
    const { data: existingConv, error: convError } = await supabaseAdmin
      .from('instagram_conversations')
      .select('id')
      .eq('instagram_id', instagram_id)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
      console.log('✅ Found existing conversation:', conversationId);
      
      // Update last_message_at
      await supabaseAdmin
        .from('instagram_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabaseAdmin
        .from('instagram_conversations')
        .insert({
          instagram_id: instagram_id,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        throw createError;
      }

      conversationId = newConv.id;
      console.log('✅ Created new conversation:', conversationId);
    }

    // 2. Save message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('instagram_messages')
      .insert({
        conversation_id: conversationId,
        message_id: message_id || `msg_${Date.now()}`,
        sender: sender || 'customer',
        content: content,
        status: 'delivered'
      })
      .select()
      .single();

    if (msgError) {
      console.error('❌ Error saving message:', msgError);
      throw msgError;
    }

    console.log('✅ Instagram message saved:', message.id);

    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message_id: message.id
    });

  } catch (error: any) {
    console.error('❌ Instagram save-message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save message' },
      { status: 500 }
    );
  }
}
