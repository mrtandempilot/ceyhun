import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { instagram_id, message, message_id } = await request.json();

    console.log('Saving Instagram response:', { instagram_id, message, message_id });

    // Find the conversation
    const { data: conversation, error: convError } = await supabase
      .from('instagram_conversations')
      .select('id')
      .eq('instagram_id', instagram_id)
      .single();

    if (convError || !conversation) {
      console.error('Instagram conversation not found:', convError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save the outgoing message
    const { data, error } = await supabase
      .from('instagram_messages')
      .insert({
        conversation_id: conversation.id,
        message_id: message_id || `response_${Date.now()}`,
        sender: 'business',
        message_type: 'text',
        content: message,
        status: 'sent'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving Instagram response:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    console.log('Instagram response saved successfully:', data.id);
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Instagram response API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
