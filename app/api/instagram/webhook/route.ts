import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify this is an Instagram webhook
    if (!body.entry?.[0]?.messaging?.[0]) {
      return NextResponse.json({ error: 'Invalid Instagram webhook format' }, { status: 400 });
    }

    const messaging = body.entry[0].messaging[0];
    const senderId = messaging.sender?.id;
    const messageText = messaging.message?.text;

    console.log('Instagram webhook received:', { senderId, messageText });

    // Only process messages (not echoes)
    if (!messaging.message?.is_echo && messageText) {
      // Get or create conversation
      let conversation = await getOrCreateInstagramConversation(senderId);

      // Save incoming message
      await supabase
        .from('instagram_messages')
        .insert({
          conversation_id: conversation.id,
          message_id: messaging.message.mid,
          sender: 'customer',
          message_type: 'text',
          content: messageText,
          status: 'delivered'
        });

      console.log('Instagram message saved:', { senderId, messageText, conversationId: conversation.id });
    }

    // Return hub.challenge for verification
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getOrCreateInstagramConversation(instagramId: string) {
  // First, try to find existing conversation
  let { data: existingConversation, error: fetchError } = await supabase
    .from('instagram_conversations')
    .select('*')
    .eq('instagram_id', instagramId)
    .single();

  if (existingConversation && !fetchError) {
    console.log('Found existing Instagram conversation:', existingConversation.id);
    return existingConversation;
  }

  // Create new conversation if not found
  const { data: newConversation, error: createError } = await supabase
    .from('instagram_conversations')
    .insert({
      instagram_id: instagramId,
      status: 'active'
    })
    .select('*')
    .single();

  if (createError) {
    console.error('Error creating Instagram conversation:', createError);
    throw createError;
  }

  console.log('Created new Instagram conversation:', newConversation.id);
  return newConversation;
}

// For Facebook/Instagram webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  console.log('Instagram webhook verification:', { mode, verifyToken, challenge });

  // You need to set this env var in Vercel: INSTAGRAM_WEBHOOK_VERIFY_TOKEN
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  // Verify the webhook
  if (mode === 'subscribe' && verifyToken === expectedToken && expectedToken) {
    console.log('Instagram webhook verified successfully');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  console.log('Instagram webhook verification failed:', {
    hasToken: !!expectedToken,
    tokenMatch: verifyToken === expectedToken
  });

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
