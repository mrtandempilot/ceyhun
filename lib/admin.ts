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
    supabaseAdmin.from('bookings').select('total_amount, status').gte('created_at', monthStartISO), // Monthly revenue
    supabaseAdmin.from('expenses').select('amount').gte('expense_date', monthStartISO), // Monthly expenses
    supabaseAdmin.from('pilots').select('first_name, last_name, status, license_expiry'), // HR
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }), // Total CRM
    supabaseAdmin.from('bookings').select('tour_name, booking_date, status').gte('booking_date', todayISO).lt('booking_date', nextWeekISO).limit(10) // Ops
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

    const monthRevenue = monthBookings.filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);
    const monthExpenseTotal = monthExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

    detailedData = {
      financials: {
        month_to_date_revenue: monthRevenue,
        month_to_date_expenses: monthExpenseTotal,
        net_profit: monthRevenue - monthExpenseTotal
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
[MASTER VIEW - DETAILED]
- Financials (MTD): Revenue €${detailedData.financials.month_to_date_revenue.toFixed(2)}, Expenses €${detailedData.financials.month_to_date_expenses.toFixed(2)}, Profit €${detailedData.financials.net_profit.toFixed(2)}.
- HR: ${detailedData.hr.total_pilots} pilots managed. Check for license expiries.
- CRM: ${detailedData.crm.total_customers} total customers in database.
- Future Load: ${detailedData.operations.upcoming_bookings_count} bookings scheduled for next 7 days.` : ''}
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
