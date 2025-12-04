import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { chatId, message } = await request.json();

        if (!chatId || !message) {
            return NextResponse.json(
                { success: false, error: 'chatId and message are required' },
                { status: 400 }
            );
        }

        // Get bot token from credentials
        const { data: creds } = await supabase
            .from('credentials')
            .select('value')
            .eq('platform', 'telegram')
            .eq('credential_key', 'telegram_bot_token')
            .single();

        if (!creds) {
            return NextResponse.json(
                { success: false, error: 'Bot token not configured' },
                { status: 400 }
            );
        }

        const botToken = creds.value;
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Send message via Telegram API
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });

        const result = await response.json();

        if (result.ok) {
            // Save sent message to database
            const { data: conv } = await supabase
                .from('telegram_conversations')
                .select('id')
                .eq('telegram_chat_id', chatId)
                .single();

            if (conv) {
                await supabase.from('telegram_messages').insert({
                    conversation_id: conv.id,
                    telegram_message_id: result.result.message_id,
                    sender: 'bot',
                    message_text: message,
                    message_type: 'text',
                });

                console.log('✅ Sent message saved to database');
            }

            return NextResponse.json({ success: true, data: result.result });
        }

        return NextResponse.json(
            { success: false, error: result.description || 'Failed to send message' },
            { status: 400 }
        );
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
