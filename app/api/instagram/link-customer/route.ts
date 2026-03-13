import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram_id, customer_email } = body;

    if (!instagram_id || !customer_email) {
      return NextResponse.json(
        { error: 'instagram_id and customer_email are required' },
        { status: 400 }
      );
    }

    // Find the customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .eq('email', customer_email)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: `Customer with email ${customer_email} not found` },
        { status: 404 }
      );
    }

    // Update the Instagram conversation
    const { data: conversation, error: updateError } = await supabaseAdmin
      .from('instagram_conversations')
      .update({
        contact_id: customer.id,
        customer_email: customer.email,
        customer_name: `${customer.first_name} ${customer.last_name}`.trim()
      })
      .eq('instagram_id', instagram_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return NextResponse.json(
        { error: 'Failed to link Instagram user to customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked Instagram user to ${customer.first_name} ${customer.last_name}`,
      customer: {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error: any) {
    console.error('❌ Link customer API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET endpoint to search for customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    const { data: customers, error } = await supabaseAdmin
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      customers: customers || []
    });

  } catch (error: any) {
    console.error('❌ Search customers API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
