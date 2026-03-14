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
      historical_stats: {
        total_bookings: status.detailed?.operations?.all_time_bookings,
        total_revenue: status.detailed?.financials?.all_time_revenue,
        total_expenses: status.detailed?.financials?.all_time_expenses,
        total_profit: status.detailed?.financials?.all_time_net_profit,
        total_customers: status.detailed?.crm?.total_customers
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
