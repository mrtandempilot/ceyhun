import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Telegram Bot API Types
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  // Add other message types as needed
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  // Add other update types as needed
}

export async function GET(request: NextRequest) {
  // Webhook verification (GET request from Telegram)
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Simple verification - replace with your actual verification logic
  if (mode === 'subscribe' && token === process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.log('🔍 Telegram webhook verification successful');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Telegram webhook received');

    const update: TelegramUpdate = await request.json();
    console.log('📨 Telegram update:', JSON.stringify(update, null, 2));

    if (!update.message) {
      console.log('⚠️ No message in update, ignoring');
      return NextResponse.json({ status: 'ignored' });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || message.caption || '';

    if (!text.trim()) {
      console.log('⚠️ Empty message, ignoring');
      return NextResponse.json({ status: 'ignored' });
    }

    // Extract user info
    const user = message.from;
    const customerName = user ?
      `${user.first_name || ''} ${user.last_name || ''}`.trim() || null :
      null;
    const username = user?.username || null;

    console.log('👤 Processing message from:', {
      chatId,
      customerName,
      username,
      text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });

    // Start transaction-like operation (check/create conversation, then add message)
    let conversationId: string;

    try {
      // First, try to find existing conversation
      let { data: existingConv, error: findError } = await supabaseAdmin
        .from('telegram_conversations')
        .select('id')
        .eq('telegram_chat_id', chatId.toString())
        .single();

      if (findError && !findError.message.includes('No rows')) {
        throw findError;
      }

      if (!existingConv) {
        // Create new conversation
        console.log('📝 Creating new conversation for chat:', chatId);

        const { data: newConv, error: createError } = await supabaseAdmin
          .from('telegram_conversations')
          .insert({
            telegram_chat_id: chatId,
            customer_name: customerName,
            customer_username: username,
            customer_phone: null, // Could be extracted from message later
            status: 'active'
          })
          .select('id')
          .single();

        if (createError) throw createError;

        conversationId = newConv.id;
        console.log('✅ Created conversation:', conversationId);
      } else {
        conversationId = existingConv.id;
        console.log('✅ Found existing conversation:', conversationId);
      }

      // Update conversation last_message_at
      await supabaseAdmin
        .from('telegram_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Save the message
      const { data: savedMessage, error: messageError } = await supabaseAdmin
        .from('telegram_messages')
        .insert({
          conversation_id: conversationId,
          telegram_message_id: message.message_id,
          sender: 'user',
          message_text: text,
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      console.log('💾 Saved message:', savedMessage.id);

      // Optional: Send auto-reply via Telegram API
      // This would require TELEGRAM_BOT_TOKEN env var
      await sendAutoReply(chatId, 'Thank you for your message! Our team will get back to you soon. 😊');

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Telegram message processed successfully');
    return NextResponse.json({
      status: 'processed',
      conversation_id: conversationId
    });

  } catch (error: any) {
    console.error('❌ Telegram webhook error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Optional: Send auto-reply to Telegram
async function sendAutoReply(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log('⚠️ No TELEGRAM_BOT_TOKEN, skipping auto-reply');
    return;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      console.error('❌ Failed to send Telegram reply:', await response.text());
    } else {
      console.log('📤 Auto-reply sent to Telegram');

      // Optionally save the bot reply to database too
      // This would require finding the conversation again
    }
  } catch (error) {
    console.error('❌ Error sending Telegram auto-reply:', error);
  }
}
