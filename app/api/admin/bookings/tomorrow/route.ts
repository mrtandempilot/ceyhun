import { NextRequest, NextResponse } from 'next/server';
import { getSystemStatus } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const status = await getSystemStatus(true);
    
    // Filter specifically for tomorrow
    const tomorrowBookings = (status.detailed?.operations?.next_week_preview || []).filter((b: any) => {
      return b.booking_date.startsWith(tomorrowStr);
    });
    
    return NextResponse.json({
      success: true,
      date: tomorrowStr,
      count: tomorrowBookings.length,
      bookings: tomorrowBookings
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
