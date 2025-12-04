import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // Get recent activity from multiple sources
        const [
            recentBookings,
            recentTelegramMsgs,
            recentWhatsappMsgs,
            recentBlogPosts,
            recentChatMsgs,
        ] = await Promise.all([
            supabase
                .from('bookings')
                .select('id, customer_name, tour_name, created_at, status')
                .order('created_at', { ascending: false })
                .limit(10),

            supabase
                .from('telegram_messages')
                .select('id, message_text, sender, created_at, conversation_id')
                .order('created_at', { ascending: false })
                .limit(10),

            supabase
                .from('whatsapp_messages')
                .select('id, message_text, sender, created_at, conversation_id')
                .order('created_at', { ascending: false })
                .limit(10),

            supabase
                .from('blog_posts')
                .select('id, title, created_at, status')
                .order('created_at', { ascending: false })
                .limit(10),

            supabase
                .from('chat_messages')
                .select('id, message, sender, created_at, session_id')
                .order('created_at', { ascending: false })
                .limit(10),
        ]);

        // Combine and format all activities
        const activities: any[] = [];

        // Add bookings
        recentBookings.data?.forEach(booking => {
            activities.push({
                id: `booking-${booking.id}`,
                type: 'booking',
                title: 'New Booking',
                description: `${booking.customer_name} booked ${booking.tour_name}`,
                status: booking.status,
                timestamp: booking.created_at,
                icon: '📅',
                color: 'blue',
            });
        });

        // Add Telegram messages
        recentTelegramMsgs.data?.forEach(msg => {
            activities.push({
                id: `telegram-${msg.id}`,
                type: 'telegram',
                title: msg.sender === 'user' ? 'Telegram Message Received' : 'Telegram Reply Sent',
                description: msg.message_text?.substring(0, 100) || 'Media message',
                status: 'success',
                timestamp: msg.created_at,
                icon: '📱',
                color: 'cyan',
            });
        });

        // Add WhatsApp messages
        recentWhatsappMsgs.data?.forEach(msg => {
            activities.push({
                id: `whatsapp-${msg.id}`,
                type: 'whatsapp',
                title: msg.sender === 'user' ? 'WhatsApp Message Received' : 'WhatsApp Reply Sent',
                description: msg.message_text?.substring(0, 100) || 'Media message',
                status: 'success',
                timestamp: msg.created_at,
                icon: '💬',
                color: 'green',
            });
        });

        // Add blog posts
        recentBlogPosts.data?.forEach(post => {
            activities.push({
                id: `blog-${post.id}`,
                type: 'blog',
                title: 'Blog Post Published',
                description: post.title,
                status: post.status,
                timestamp: post.created_at,
                icon: '📝',
                color: 'purple',
            });
        });

        // Add chat messages
        recentChatMsgs.data?.forEach(msg => {
            activities.push({
                id: `chat-${msg.id}`,
                type: 'chat',
                title: msg.sender === 'user' ? 'Website Chat Message' : 'Bot Reply',
                description: msg.message?.substring(0, 100) || '',
                status: 'success',
                timestamp: msg.created_at,
                icon: '💭',
                color: 'indigo',
            });
        });

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Limit results
        const limitedActivities = activities.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: limitedActivities,
            count: limitedActivities.length,
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
