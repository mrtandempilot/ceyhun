import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        // List of all tables in your database
        const tables = [
            'bookings',
            'customers',
            'pilots',
            'tour_packages',
            'communications',
            'customer_interactions',
            'reviews',
            'posts',              // Fixed: actual table name
            'post_categories',    // Fixed: actual table name
            'post_tags',          // Fixed: actual table name
            'post_category_relations', // Fixed: actual table name
            'post_tag_relations', // Fixed: actual table name
            'telegram_conversations',
            'telegram_messages',
            'whatsapp_conversations',
            'whatsapp_messages',
            'chatbot_conversations',  // Fixed: actual table name
            'contact_submissions',
            'incoming_emails',
            'instagram_conversations',
            'instagram_messages',
            'expenses',
            'credentials',
            'invoices'
        ];

        // Get row count for each table
        const tableCounts = await Promise.all(
            tables.map(async (tableName) => {
                try {
                    const { count, error } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true });

                    return {
                        table: tableName,
                        count: count || 0,
                        error: error?.message || null,
                    };
                } catch (err) {
                    return {
                        table: tableName,
                        count: 0,
                        error: (err as Error).message,
                    };
                }
            })
        );

        // Get today's activity for each table
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayActivity = await Promise.all(
            tables.map(async (tableName) => {
                try {
                    const { count } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true })
                        .gte('created_at', today.toISOString());

                    return {
                        table: tableName,
                        today_count: count || 0,
                    };
                } catch (err) {
                    return {
                        table: tableName,
                        today_count: 0,
                    };
                }
            })
        );

        // Combine data
        const tableData = tableCounts.map((table, index) => ({
            ...table,
            today_count: todayActivity[index].today_count,
        }));

        // Sort by count (descending)
        tableData.sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: tableData,
            total_tables: tableData.length,
            total_records: tableData.reduce((sum, t) => sum + t.count, 0),
            today_total: tableData.reduce((sum, t) => sum + t.today_count, 0),
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
