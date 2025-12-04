import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Instagram webhook setup');

    // Test basic Instagram messages query
    const { count: messagesCount, error: messagesError } = await supabase
      .from('instagram_messages')
      .select('*', { count: 'exact', head: true });

    // Test Instagram conversations query
    const { count: conversationsCount, error: conversationsError } = await supabase
      .from('instagram_conversations')
      .select('*', { count: 'exact', head: true });

    // Get recent messages if any exist
    const { data: recentMessages, error: recentError } = await supabase
      .from('instagram_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const webhookVerifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
    const expectedTokenSet = !!webhookVerifyToken;
    const expectedToken = webhookVerifyToken || '(not set)';

    return NextResponse.json({
      success: true,
      instagram_setup_status: {
        tables_exist: !messagesError && !conversationsError,
        messages_count: messagesCount || 0,
        conversations_count: conversationsCount || 0,
        messages_error: messagesError?.message,
        conversations_error: conversationsError?.message,
        webhook_verification: {
          received_mode: null,
          received_token: 'null',
          received_challenge: 'null',
          expected_token_set: expectedTokenSet,
          expected_token_value: expectedTokenSet ? expectedToken : '(not set)',
          token_match: false,
          all_params: {},
          message: 'This appears to be webhook verification data'
        },
        environment_check: {
          webhook_verify_token: expectedTokenSet,
          supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        recent_messages: recentMessages || [],
        recent_error: recentError?.message,
        webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ceyhun.vercel.app'}/api/instagram/webhook`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Instagram test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Test POST endpoint - simulate an Instagram webhook
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Instagram webhook with simulated data');

    // Simulate an Instagram webhook payload
    const testPayload = {
      entry: [{
        messaging: [{
          sender: {
            id: 'test_user_123'
          },
          message: {
            mid: `test_message_${Date.now()}`,
            text: 'This is a test Instagram message',
            is_echo: false
          }
        }]
      }]
    };

    // Process the same way as the real webhook
    const messaging = testPayload.entry[0].messaging[0];
    const senderId = messaging.sender?.id;
    const messageText = messaging.message?.text;

    console.log('📨 Processing test Instagram message:', { senderId, messageText });

    // Get or create conversation
    let conversation;
    try {
      // First, try to find existing conversation
      const { data: existingConversation } = await supabase
        .from('instagram_conversations')
        .select('*')
        .eq('instagram_id', senderId)
        .single();

      if (existingConversation) {
        conversation = existingConversation;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('instagram_conversations')
          .insert({
            instagram_id: senderId,
            status: 'active'
          })
          .select('*')
          .single();

        if (createError) throw createError;
        conversation = newConversation;
      }
    } catch (convError) {
      console.error('❌ Failed to get/create conversation:', convError);
      return NextResponse.json({ error: 'Conversation error', details: convError }, { status: 500 });
    }

    // Save the test message
    const messageData = {
      conversation_id: conversation.id,
      message_id: messaging.message.mid,
      sender: 'customer',
      message_type: 'text',
      content: messageText,
      status: 'delivered'
    };

    const { data: savedMessage, error: saveError } = await supabase
      .from('instagram_messages')
      .insert([messageData])
      .select('*')
      .single();

    if (saveError) {
      console.error('❌ Failed to save test message:', saveError);
      return NextResponse.json({ error: 'Save error', details: saveError }, { status: 500 });
    }

    console.log('✅ Test Instagram message saved successfully:', savedMessage.id);

    return NextResponse.json({
      success: true,
      message: 'Test Instagram message saved successfully',
      messageId: savedMessage.id,
      conversationId: conversation.id,
      testData: testPayload
    });
  } catch (error) {
    console.error('❌ Instagram test POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
