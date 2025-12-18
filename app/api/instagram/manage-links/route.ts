import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all Instagram linkages with customer info
export async function GET(request: NextRequest) {
  try {
    const { data: linkages, error } = await supabaseAdmin
      .from('instagram_conversations')
      .select(`
        instagram_id,
        username,
        customer_name,
        customer_email,
        contact_id,
        last_message_at,
        customers:contact_id (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Format the response
    const formattedLinkages = (linkages || []).map((link: any) => ({
      instagram_id: link.instagram_id,
      username: link.username,
      customer_name: link.customer_name,
      customer_email: link.customer_email,
      contact_id: link.contact_id,
      linked_first_name: link.customers?.first_name || null,
      linked_last_name: link.customers?.last_name || null,
      linked_email: link.customers?.email || null,
      linked_phone: link.customers?.phone || null,
      last_message_at: link.last_message_at
    }));

    return NextResponse.json({
      success: true,
      linkages: formattedLinkages
    });

  } catch (error: any) {
    console.error('❌ Manage links GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Unlink an Instagram user from customer
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram_id } = body;

    if (!instagram_id) {
      return NextResponse.json(
        { error: 'instagram_id is required' },
        { status: 400 }
      );
    }

    // Update the conversation to remove the link
    const { data, error } = await supabaseAdmin
      .from('instagram_conversations')
      .update({
        contact_id: null,
        customer_name: null,
        customer_email: null
      })
      .eq('instagram_id', instagram_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Successfully unlinked Instagram user from customer',
      data
    });

  } catch (error: any) {
    console.error('❌ Manage links DELETE error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
