import { supabaseAdmin } from './supabase-admin';

export async function getSystemStatus(detailed: boolean = false) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartISO = monthStart.toISOString();

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekISO = nextWeek.toISOString();

  if (!supabaseAdmin) {
    return {
      timestamp: now.toISOString(),
      error: 'Supabase admin client not initialized'
    };
  }

  // Basic stats always included
  const baseQueries = [
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', todayISO).lt('created_at', tomorrowISO),
    supabaseAdmin.from('bookings').select('total_amount').eq('status', 'confirmed').gte('created_at', todayISO).lt('created_at', tomorrowISO),
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('pilots').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('telegram_messages').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('whatsapp_messages').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }).gte('created_at', todayISO)
  ];

  // Extended queries for detailed mode
  const detailedQueries = detailed ? [
    supabaseAdmin.from('bookings').select('total_amount, status').gte('created_at', monthStartISO), // results[7]
    supabaseAdmin.from('expenses').select('amount, category').gte('expense_date', monthStartISO), // results[8]
    supabaseAdmin.from('pilots').select('first_name, last_name, status, license_expiry'), // results[9]
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }), // results[10]
    supabaseAdmin.from('bookings').select('tour_name, booking_date, status').gte('booking_date', todayISO).lt('booking_date', nextWeekISO).limit(10), // results[11]
    supabaseAdmin.from('invoices').select('status, total_amount'), // results[12]
    supabaseAdmin.from('bookings').select('total_amount').eq('status', 'confirmed'), // results[13] - All-time revenue
    supabaseAdmin.from('expenses').select('amount') // results[14] - All-time expenses
  ] : [];

  const results = await Promise.all([...baseQueries, ...detailedQueries]);

  const [
    { count: todayBookings, error: bookingsError },
    { data: revenueData },
    { count: pendingBookings },
    { count: activePilots },
    { count: telegramMsgsToday },
    { count: whatsappMsgsToday },
    { count: newCustomersToday }
  ] = results;

  const totalRevenueToday = revenueData?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;

  let detailedData: any = {};
  if (detailed) {
    const monthBookings = results[7].data || [];
    const monthExpenses = results[8].data || [];
    const pilotList = results[9].data || [];
    const totalCustomers = results[10].count || 0;
    const upcomingOps = results[11].data || [];
    const invoices = results[12].data || [];
    const allTimeRevData = results[13].data || [];
    const allTimeExpData = results[14].data || [];

    const monthRevenue = monthBookings.filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);
    const monthExpenseTotal = monthExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    
    // Group expenses by category
    const expenseBreakdown = monthExpenses.reduce((acc: any, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {});

    // Invoice analytics
    const unpaidInvoices = invoices.filter((i: any) => i.status === 'sent' || i.status === 'overdue');
    const overdueInvoices = invoices.filter((i: any) => i.status === 'overdue');
    const totalUnpaidAmount = unpaidInvoices.reduce((sum: number, i: any) => sum + (Number(i.total_amount) || 0), 0);

    // All-time context
    const allTimeRevenue = allTimeRevData.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);
    const allTimeExpenses = allTimeExpData.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

    detailedData = {
      financials: {
        month_to_date_revenue: monthRevenue,
        month_to_date_expenses: monthExpenseTotal,
        net_profit: monthRevenue - monthExpenseTotal,
        expense_breakdown: expenseBreakdown,
        all_time_revenue: allTimeRevenue,
        all_time_expenses: allTimeExpenses,
        all_time_net_profit: allTimeRevenue - allTimeExpenses,
        invoices: {
          unpaid_count: unpaidInvoices.length,
          overdue_count: overdueInvoices.length,
          total_unpaid_amount: totalUnpaidAmount
        }
      },
      hr: {
        total_pilots: pilotList.length,
        pilots: pilotList.map((p: any) => ({ name: `${p.first_name} ${p.last_name}`, status: p.status, license_warning: new Date(p.license_expiry) < nextWeek })),
      },
      crm: {
        total_customers: totalCustomers
      },
      operations: {
        upcoming_bookings_count: upcomingOps.length,
        next_week_preview: upcomingOps
      }
    };
  }

  const summary = `System Intelligence Report (${now.toLocaleDateString()}):
- Today: ${todayBookings} bookings, €${totalRevenueToday.toFixed(2)} revenue.
- Operations: ${pendingBookings} pending actions. ${activePilots} pilots active.
- Communication: ${((telegramMsgsToday || 0) + (whatsappMsgsToday || 0))} new messages today.
${detailed ? `
[MASTER VIEW - ACCOUNTING & FINANCE]
- MTD Profit: €${detailedData.financials.net_profit.toFixed(2)} (Rev: €${detailedData.financials.month_to_date_revenue.toFixed(2)} / Exp: €${detailedData.financials.month_to_date_expenses.toFixed(2)})
- All-Time Health: Net Profit €${detailedData.financials.all_time_net_profit.toFixed(2)} (Rev: €${detailedData.financials.all_time_revenue.toFixed(2)} / Exp: €${detailedData.financials.all_time_expenses.toFixed(2)})
- Receivables: ${detailedData.financials.invoices.unpaid_count} unpaid invoices totaling €${detailedData.financials.invoices.total_unpaid_amount.toFixed(2)}. ${detailedData.financials.invoices.overdue_count} are OVERDUE.
- HR: ${detailedData.hr.total_pilots} pilots managed. Check for license expiries.
- CRM: ${detailedData.crm.total_customers} total customers in database.` : ''}
Action Required: ${pendingBookings && pendingBookings > 0 ? `Urgent: ${pendingBookings} pending bookings need attention.` : 'System stable. No urgent pending items.'}`;

  return {
    success: true,
    timestamp: now.toISOString(),
    stats: {
      today_bookings: todayBookings || 0,
      today_revenue: totalRevenueToday,
      total_pending_bookings: pendingBookings || 0,
    },
    detailed: detailed ? detailedData : null,
    summary,
    system_health: {
      database: !bookingsError ? 'healthy' : 'error',
      api: 'healthy'
    }
  };
}
