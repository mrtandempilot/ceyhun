import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('📱 Telegram webhook received:', JSON.stringify(body, null, 2));

        // Handle message updates
        if (body.message) {
            const message = body.message;
            const chatId = message.chat.id;
            const messageId = message.message_id;
            const text = message.text || message.caption || '';
            const from = message.from;

            // Get or create conversation
            const conversation = await getOrCreateConversation(chatId, from);

            // Save incoming message
            await saveMessage(conversation.id, messageId, 'user', text, message);

            // Send bot response (simple auto-reply for now)
            await sendBotResponse(chatId, text, conversation.id);

            return NextResponse.json({ success: true });
        }

        // Handle other update types (edited messages, etc.)
        return NextResponse.json({ success: true, message: 'No action needed' });
    } catch (error) {
        console.error('❌ Telegram webhook error:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

async function getOrCreateConversation(chatId: number, from: any) {
    // Check if conversation exists
    const { data: existing } = await supabase
        .from('telegram_conversations')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .single();

    if (existing) {
        // Update last message time
        await supabase
            .from('telegram_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', existing.id);
        return existing;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
        .from('telegram_conversations')
        .insert({
            telegram_chat_id: chatId,
            customer_name: `${from.first_name || ''} ${from.last_name || ''}`.trim() || 'Unknown',
            customer_username: from.username || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }

    return newConv;
}

async function saveMessage(
    conversationId: string,
    messageId: number,
    sender: string,
    text: string,
    message: any
) {
    const messageType = message.photo ? 'photo' :
        message.video ? 'video' :
            message.document ? 'document' :
                message.voice ? 'voice' :
                    'text';

    await supabase.from('telegram_messages').insert({
        conversation_id: conversationId,
        telegram_message_id: messageId,
        sender,
        message_text: text,
        message_type: messageType,
    });
}

async function sendBotResponse(chatId: number, userMessage: string, conversationId: string) {
    try {
        // Get bot token from credentials
        const { data: creds } = await supabase
            .from('credentials')
            .select('value')
            .eq('platform', 'telegram')
            .eq('credential_key', 'telegram_bot_token')
            .single();

        if (!creds) {
            console.error('❌ Telegram bot token not found');
            return;
        }

        const botToken = creds.value;

        // Simple auto-response (you can integrate with your chatbot API later)
        const response = `Thank you for your message! 🙏\n\nOur team at Oludeniz Tours will respond to you shortly. If you'd like to book a paragliding tour, please visit our website or let us know your preferred date!`;

        // Send message via Telegram API
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: response,
            }),
        });

        const result = await telegramResponse.json();

        if (result.ok) {
            // Save bot response to database
            await supabase.from('telegram_messages').insert({
                conversation_id: conversationId,
                telegram_message_id: result.result.message_id,
                sender: 'bot',
                message_text: response,
                message_type: 'text',
            });

            console.log('✅ Bot response sent via Telegram');
        } else {
            console.error('❌ Failed to send Telegram message:', result);
        }
    } catch (error) {
        console.error('❌ Error sending bot response:', error);
    }
}
