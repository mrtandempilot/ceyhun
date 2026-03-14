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
      profit_and_loss: {
        revenue: status.detailed?.financials?.month_to_date_revenue,
        expenses: status.detailed?.financials?.month_to_date_expenses,
        net_profit: status.detailed?.financials?.net_profit,
        all_time: {
          revenue: status.detailed?.financials?.all_time_revenue,
          expenses: status.detailed?.financials?.all_time_expenses,
          net_profit: status.detailed?.financials?.all_time_net_profit
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
