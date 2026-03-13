import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        // Get counts from all major tables (using actual table names)
        const [
            bookingsCount,
            customersCount,
            pilotsCount,
            postsCount, // actual table name is 'posts', not 'blog_posts'
        ] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('customers').select('*', { count: 'exact', head: true }),
            supabase.from('pilots').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('visibility', 'public'),
        ]);

        // Get today's activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayBookings,
            todayPosts, // for blog posts today
        ] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()).eq('status', 'published').eq('visibility', 'public'),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totals: {
                    bookings: bookingsCount.count || 0,
                    customers: customersCount.count || 0,
                    pilots: pilotsCount.count || 0,
                    blog_posts: postsCount.count || 0, // Fixed: using postsCount instead of blogPostsCount
                },
                today: {
                    bookings: todayBookings.count || 0,
                    blog_posts: todayPosts.count || 0, // Fixed: using todayPosts instead of todayBlogPosts
                },
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
