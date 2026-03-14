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
      cash_flow: {
        receivables: status.detailed?.financials?.invoices?.total_unpaid_amount,
        unpaid_invoices_count: status.detailed?.financials?.invoices?.unpaid_count,
        overdue_invoices_count: status.detailed?.financials?.invoices?.overdue_count,
        expense_breakdown: status.detailed?.financials?.expense_breakdown
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
