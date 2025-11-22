import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Use supabaseAdmin to bypass RLS
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (error || !booking) {
      console.error('Error fetching ticket:', error);
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Return ticket data
    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error('Error in ticket verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
