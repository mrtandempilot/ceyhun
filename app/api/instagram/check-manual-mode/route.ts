import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagram_id, action } = body;

    if (!instagram_id) {
      return NextResponse.json({ error: 'instagram_id required' }, { status: 400 });
    }

    if (action === 'enable') {
      // Enable manual mode for 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabaseAdmin
        .from('instagram_conversations')
        .update({
          manual_mode_active: true,
          manual_mode_expires_at: expiresAt.toISOString()
        })
        .eq('instagram_id', instagram_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Manual mode enabled for 24 hours',
        data,
        expiresAt: expiresAt.toISOString()
      });

    } else if (action === 'disable') {
      // Disable manual mode
      const { data, error } = await supabaseAdmin
        .from('instagram_conversations')
        .update({
          manual_mode_active: false,
          manual_mode_expires_at: null
        })
        .eq('instagram_id', instagram_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Manual mode disabled - bot is now active',
        data
      });

    } else if (action === 'check') {
      // Check current manual mode status
      const { data, error } = await supabaseAdmin
        .from('instagram_conversations')
        .select('manual_mode_active, manual_mode_expires_at')
        .eq('instagram_id', instagram_id)
        .single();

      if (error) throw error;

      // Check if manual mode has expired
      if (data.manual_mode_active && data.manual_mode_expires_at) {
        const expiresAt = new Date(data.manual_mode_expires_at);
        const now = new Date();

        if (now > expiresAt) {
          // Manual mode has expired, disable it
          await supabaseAdmin
            .from('instagram_conversations')
            .update({
              manual_mode_active: false,
              manual_mode_expires_at: null
            })
            .eq('instagram_id', instagram_id);

          return NextResponse.json({
            success: true,
            manual_mode_active: false,
            expired: true
          });
        }
      }

      return NextResponse.json({
        success: true,
        manual_mode_active: data.manual_mode_active || false,
        manual_mode_expires_at: data.manual_mode_expires_at
      });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use: enable, disable, or check' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Instagram manual mode error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instagram_id = searchParams.get('instagram_id');

    if (!instagram_id) {
      return NextResponse.json({ error: 'instagram_id required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('instagram_conversations')
      .select('manual_mode_active, manual_mode_expires_at')
      .eq('instagram_id', instagram_id)
      .single();

    if (error) throw error;

    // Check if manual mode has expired
    if (data.manual_mode_active && data.manual_mode_expires_at) {
      const expiresAt = new Date(data.manual_mode_expires_at);
      const now = new Date();

      if (now > expiresAt) {
        // Manual mode has expired, disable it
        await supabaseAdmin
          .from('instagram_conversations')
          .update({
            manual_mode_active: false,
            manual_mode_expires_at: null
          })
          .eq('instagram_id', instagram_id);

        return NextResponse.json({
          success: true,
          manual_mode_active: false,
          expired: true
        });
      }
    }

    return NextResponse.json({
      success: true,
      manual_mode_active: data.manual_mode_active || false,
      manual_mode_expires_at: data.manual_mode_expires_at
    });

  } catch (error: any) {
    console.error('❌ Instagram manual mode check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
