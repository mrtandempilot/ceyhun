import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// API for n8n to check if manual mode is active for a chat
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chat_id');

  if (!chatId) {
    return NextResponse.json({ error: 'chat_id required' }, { status: 400 });
  }

  console.log('🔍 Checking manual mode for chat:', chatId);

  try {
    // First, expire old sessions
    await supabaseAdmin.rpc('expire_manual_mode_sessions');

    // Check if active
    const { data: session, error } = await supabaseAdmin
      .from('telegram_manual_mode_sessions')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .eq('active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking manual mode:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const isActive = !!session;
    const expiresAt = session?.expires_at || null;

    console.log('🔍 Manual mode status:', { isActive, expiresAt });

    return NextResponse.json({
      chat_id: chatId,
      manual_mode_active: isActive,
      expires_at: expiresAt,
      checked_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Check manual mode error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check manual mode' },
      { status: 500 }
    );
  }
}

// API for dashboard to set/manual mode
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { chat_id, action, duration_minutes = 5 } = body;

  if (!chat_id || !action) {
    return NextResponse.json({ error: 'chat_id and action required' }, { status: 400 });
  }

  console.log('🎛️ Manual mode action:', { chat_id, action });

  try {
    if (action === 'enable') {
      // Enable manual mode for 5 minutes (or specified duration)
      const expiresAt = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString();

      const { data: session, error } = await supabaseAdmin
        .from('telegram_manual_mode_sessions')
        .upsert({
          telegram_chat_id: chat_id,
          active: true,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'telegram_chat_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Manual mode enabled for chat:', chat_id);
      return NextResponse.json({
        success: true,
        action: 'enabled',
        session: session
      });

    } else if (action === 'disable') {
      // Disable manual mode
      const { error } = await supabaseAdmin
        .from('telegram_manual_mode_sessions')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_chat_id', chat_id);

      if (error) throw error;

      console.log('✅ Manual mode disabled for chat:', chat_id);
      return NextResponse.json({
        success: true,
        action: 'disabled',
        chat_id: chat_id
      });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use: enable or disable' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Manual mode action error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update manual mode' },
      { status: 500 }
    );
  }
}
