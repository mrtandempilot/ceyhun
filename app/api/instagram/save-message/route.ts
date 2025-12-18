import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram_id, message_id, sender, content } = body;

    console.log('📥 Instagram save-message received:', { instagram_id, sender, content: content?.slice(0, 50) });

    if (!instagram_id || !content) {
      return NextResponse.json({ error: 'instagram_id and content required' }, { status: 400 });
    }

    // 1. Get or create conversation
    let conversationId: string;

    // Fetch user profile from Instagram API
    let profilePictureUrl = null;
    let username = null;
    let fullName = null;

    try {
      const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || 'IGAAVCDzt1sIxBZAFlqUnJtejhGNGZAWdThlTG9QYkMyYWxISVBBUVZA6T0NVU2NET3pUQkJVUUNlcXlWMTYyRFFSNEN1M25oZAFlSemVaZAUFuZA0VYN2NYOG9HNkpfV3pEZAG92MHhSZA1pZAWFJkM1dmZA3dUNWU2Nl93LTFHNFZAJR3NlYwZDZD';

      const profileResponse = await fetch(
        `https://graph.instagram.com/v21.0/${instagram_id}?fields=username,name,profile_picture_url&access_token=${INSTAGRAM_ACCESS_TOKEN}`
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        profilePictureUrl = profileData.profile_picture_url || null;
        username = profileData.username || null;
        fullName = profileData.name || null;
        console.log('✅ Fetched Instagram profile:', { username, fullName });
      } else {
        console.log('⚠️ Could not fetch Instagram profile');
      }
    } catch (profileError) {
      console.log('⚠️ Error fetching Instagram profile:', profileError);
    }

    // Try to find matching customer by Instagram username
    let contactId = null;
    let customerName = fullName || null;
    let customerEmail = null;

    if (username) {
      const { data: matchingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id, first_name, last_name, email')
        .or(`notes.ilike.%${username}%,internal_notes.ilike.%${username}%`)
        .limit(1)
        .single();

      if (matchingCustomer) {
        contactId = matchingCustomer.id;
        customerName = `${matchingCustomer.first_name} ${matchingCustomer.last_name}`;
        customerEmail = matchingCustomer.email;
        console.log('✅ Matched Instagram user to customer:', customerName);
      }
    }

    // Check existing conversation
    const { data: existingConv, error: convError } = await supabaseAdmin
      .from('instagram_conversations')
      .select('id, profile_picture_url, username, customer_name')
      .eq('instagram_id', instagram_id)
      .single();

    if (existingConv) {
      conversationId = existingConv.id;
      console.log('✅ Found existing conversation:', conversationId);

      // Update conversation with new data if available
      const updates: any = { last_message_at: new Date().toISOString() };

      if (profilePictureUrl && profilePictureUrl !== existingConv.profile_picture_url) {
        updates.profile_picture_url = profilePictureUrl;
      }
      if (username && username !== existingConv.username) {
        updates.username = username;
      }
      if (customerName && !existingConv.customer_name) {
        updates.customer_name = customerName;
      }
      if (contactId) {
        updates.contact_id = contactId;
      }
      if (customerEmail) {
        updates.customer_email = customerEmail;
      }

      await supabaseAdmin
        .from('instagram_conversations')
        .update(updates)
        .eq('id', conversationId);
    } else {
      // Create new conversation with all available data
      const { data: newConv, error: createError } = await supabaseAdmin
        .from('instagram_conversations')
        .insert({
          instagram_id: instagram_id,
          username: username,
          customer_name: customerName,
          customer_email: customerEmail,
          contact_id: contactId,
          status: 'active',
          last_message_at: new Date().toISOString(),
          profile_picture_url: profilePictureUrl
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        throw createError;
      }

      conversationId = newConv.id;
      console.log('✅ Created new conversation:', conversationId);
    }

    // 2. Save message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('instagram_messages')
      .insert({
        conversation_id: conversationId,
        message_id: message_id || `msg_${Date.now()}`,
        sender: sender || 'customer',
        content: content,
        status: 'delivered'
      })
      .select()
      .single();

    if (msgError) {
      console.error('❌ Error saving message:', msgError);
      throw msgError;
    }

    console.log('✅ Instagram message saved:', message.id);

    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      message_id: message.id
    });

  } catch (error: any) {
    console.error('❌ Instagram save-message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save message' },
      { status: 500 }
    );
  }
}
