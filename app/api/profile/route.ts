import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch customer profile linked to this user
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching customer profile:', error);
            return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
        }

        return NextResponse.json(customer);

    } catch (error: any) {
        console.error('Error in profile GET:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            first_name,
            last_name,
            phone,
            instagram_username,
            telegram_username,
            whatsapp_number,
            social_media_profiles
        } = body;

        // Validate Instagram username (no @ symbol, alphanumeric and underscores only)
        if (instagram_username) {
            const cleanInstagram = instagram_username.replace('@', '').trim();
            if (!/^[a-zA-Z0-9._]+$/.test(cleanInstagram)) {
                return NextResponse.json(
                    { error: 'Invalid Instagram username format' },
                    { status: 400 }
                );
            }
            body.instagram_username = cleanInstagram;
        }

        // Validate Telegram username (no @ symbol)
        if (telegram_username) {
            const cleanTelegram = telegram_username.replace('@', '').trim();
            body.telegram_username = cleanTelegram;
        }

        // Check for duplicate Instagram username
        if (body.instagram_username) {
            const { data: existingInstagram } = await supabaseAdmin
                .from('customers')
                .select('id')
                .eq('instagram_username', body.instagram_username)
                .neq('user_id', user.id)
                .single();

            if (existingInstagram) {
                return NextResponse.json(
                    { error: 'This Instagram username is already linked to another account' },
                    { status: 400 }
                );
            }
        }

        // Update customer profile
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .update({
                first_name,
                last_name,
                phone,
                instagram_username: body.instagram_username || null,
                telegram_username: body.telegram_username || null,
                whatsapp_number: whatsapp_number || null,
                social_media_profiles: social_media_profiles || {},
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating customer profile:', error);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // After updating, try to link existing conversations
        await linkExistingConversations(customer);

        return NextResponse.json({
            success: true,
            customer
        });

    } catch (error: any) {
        console.error('Error in profile PUT:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper function to link existing conversations to customer
async function linkExistingConversations(customer: any) {
    try {
        // Link Instagram conversations by username
        if (customer.instagram_username) {
            await supabaseAdmin
                .from('instagram_conversations')
                .update({ contact_id: customer.id })
                .eq('username', customer.instagram_username)
                .is('contact_id', null);
        }

        // Link Telegram conversations by username
        if (customer.telegram_username) {
            await supabaseAdmin
                .from('telegram_conversations')
                .update({ customer_id: customer.id })
                .eq('customer_username', customer.telegram_username)
                .is('customer_id', null);
        }

        // Link Telegram conversations by chat ID
        if (customer.telegram_chat_id) {
            await supabaseAdmin
                .from('telegram_conversations')
                .update({ customer_id: customer.id })
                .eq('telegram_chat_id', customer.telegram_chat_id)
                .is('customer_id', null);
        }

        // Link Telegram conversations by phone
        if (customer.phone) {
            await supabaseAdmin
                .from('telegram_conversations')
                .update({ customer_id: customer.id })
                .eq('customer_phone', customer.phone)
                .is('customer_id', null);
        }

        console.log('✅ Linked existing conversations for customer:', customer.id);
    } catch (error) {
        console.error('Error linking existing conversations:', error);
        // Don't throw - this is a best-effort operation
    }
}
