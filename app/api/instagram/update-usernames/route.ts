import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Utility endpoint to update existing Instagram conversations with usernames
 * GET /api/instagram/update-usernames
 */
export async function GET(request: NextRequest) {
    try {
        console.log('🔄 Starting Instagram username update process...');

        // Fetch all conversations without usernames
        const { data: conversations, error } = await supabaseAdmin
            .from('instagram_conversations')
            .select('id, instagram_id, username, customer_name')
            .or('username.is.null,customer_name.is.null');

        if (error) throw error;

        if (!conversations || conversations.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'All conversations already have usernames',
                updated: 0
            });
        }

        console.log(`📊 Found ${conversations.length} conversations to update`);

        const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
        let updated = 0;
        let failed = 0;

        for (const conv of conversations) {
            try {
                // Fetch profile from Instagram API
                const profileResponse = await fetch(
                    `https://graph.instagram.com/v21.0/${conv.instagram_id}?fields=username,name,profile_picture_url&access_token=${INSTAGRAM_ACCESS_TOKEN}`
                );

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    const username = profileData.username || null;
                    const fullName = profileData.name || null;
                    const profilePictureUrl = profileData.profile_picture_url || null;

                    // Update conversation
                    const updates: any = {};
                    if (username && !conv.username) {
                        updates.username = username;
                    }
                    if (fullName && !conv.customer_name) {
                        updates.customer_name = fullName;
                    }
                    if (profilePictureUrl) {
                        updates.profile_picture_url = profilePictureUrl;
                    }

                    if (Object.keys(updates).length > 0) {
                        await supabaseAdmin
                            .from('instagram_conversations')
                            .update(updates)
                            .eq('id', conv.id);

                        console.log(`✅ Updated conversation ${conv.id}: ${username || 'no username'}`);
                        updated++;
                    }
                } else {
                    console.log(`⚠️ Failed to fetch profile for ${conv.instagram_id}`);
                    failed++;
                }

                // Rate limiting - wait 100ms between requests
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                console.error(`❌ Error updating conversation ${conv.id}:`, err);
                failed++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updated} conversations, ${failed} failed`,
            total: conversations.length,
            updated,
            failed
        });

    } catch (error: any) {
        console.error('❌ Update usernames error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update usernames' },
            { status: 500 }
        );
    }
}
