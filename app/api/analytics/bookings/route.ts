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

    const status = await getSystemStatus(true);
    
    return NextResponse.json({
      success: true,
      analytics: {
        all_time_bookings: status.detailed?.operations?.all_time_bookings,
        monthly_revenue: status.detailed?.financials?.month_to_date_revenue,
        pending_bookings: status.stats?.total_pending_bookings
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
