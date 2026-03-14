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
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }) // results[7]: All-time total bookings
  ];

  // Extended queries for detailed mode
  const detailedQueries = detailed ? [
    supabaseAdmin.from('bookings').select('total_amount, status').gte('created_at', monthStartISO), // results[8]
    supabaseAdmin.from('expenses').select('amount, category').gte('expense_date', monthStartISO), // results[9]
    supabaseAdmin.from('pilots').select('first_name, last_name, status, license_expiry'), // results[10]
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }), // results[11]
    supabaseAdmin.from('bookings').select('tour_name, booking_date, status, customer_name, customer_email, customer_phone').gte('booking_date', todayISO).lt('booking_date', nextWeekISO).limit(10), // results[12]
    supabaseAdmin.from('invoices').select('status, total_amount'), // results[13]
    supabaseAdmin.from('bookings').select('total_amount').eq('status', 'confirmed'), // results[14] - All-time revenue
    supabaseAdmin.from('expenses').select('amount'), // results[15] - All-time expenses
    supabaseAdmin.from('reviews').select('rating'), // results[16]
    supabaseAdmin.from('tour_packages').select('name, status'), // results[17]
    supabaseAdmin.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new') // results[18]
  ] : [];

  const results = await Promise.all([...baseQueries, ...detailedQueries]);

  const [
    { count: todayBookings, error: bookingsError },
    { data: revenueData },
    { count: pendingBookings },
    { count: activePilots },
    { count: telegramMsgsToday },
    { count: whatsappMsgsToday },
    { count: newCustomersToday },
    { count: allTimeBookingsCount }
  ] = results;

  const totalRevenueToday = revenueData?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;

  let detailedData: any = {};
  const upcomingOps = detailed ? (results[12].data || []) : [];

  if (detailed) {
    const monthBookings = results[8].data || [];
    const monthExpenses = results[9].data || [];
    const pilotList = results[10].data || [];
    const totalCustomers = results[11].count || 0;
    const invoices = results[13].data || [];
    const allTimeRevData = results[14].data || [];
    const allTimeExpData = results[15].data || [];
    const reviewData = results[16].data || [];
    const tourPackages = results[17].data || [];
    const newLeadsCount = results[18].count || 0;

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

    const avgRating = reviewData.length > 0 
      ? reviewData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewData.length 
      : 5.0;

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
        total_customers: totalCustomers,
        customer_satisfaction: avgRating.toFixed(1),
        new_contact_leads: newLeadsCount
      },
      operations: {
        all_time_bookings: allTimeBookingsCount,
        active_tour_packages: tourPackages.filter((t: any) => t.status === 'active').length,
        upcoming_bookings_count: upcomingOps.length,
        next_week_preview: upcomingOps
      }
    };
  }

  const upcomingToursSummary = upcomingOps.length > 0 
    ? upcomingOps.map((b: any) => `- ${b.booking_date.split('T')[0]}: ${b.tour_name} (${b.customer_name || 'Guest'})`).join('\n')
    : '- No upcoming tours in the next 7 days.';

  const summary = `System MASTER Intelligence Report (${now.toLocaleDateString()}):
- LIVE DATABASE: Directly connected to Supabase with Master (Service Role) permissions.
- CRITICAL: Total volume of ${allTimeBookingsCount} bookings exists in system history.
- Today: ${todayBookings} new bookings, €${totalRevenueToday.toFixed(2)} revenue.
- Upcoming Tours (Next 7 Days):
${upcomingToursSummary}
- Operations: ${pendingBookings} pending actions (current bottleneck). ${activePilots} active pilots.
- Communication: ${((telegramMsgsToday || 0) + (whatsappMsgsToday || 0))} message pings today. ${detailed ? (detailedData?.crm?.new_contact_leads || 0) : '0'} UNREAD leads.
${detailed ? `
[MASTER VIEW - FULL SYSTEM MAP]
- CRM: Customer Sat: ${detailedData.crm.customer_satisfaction}/5.0 | Total Customers: ${detailedData.crm.total_customers}.
- INVENTORY: ${detailedData.operations.active_tour_packages} active tour packages available.
- FINANCIAL: Lifetime Profit €${detailedData.financials.all_time_net_profit.toFixed(2)} | Overdue: ${detailedData.financials.invoices.overdue_count}.` : ''}
Immediate Action: You have ${pendingBookings} pending bookings and ${detailed ? (detailedData?.crm?.new_contact_leads || 0) : 'some'} new leads. Focus on conversion.`;

  return {
    success: true,
    timestamp: now.toISOString(),
    stats: {
      all_time_bookings: allTimeBookingsCount || 0,
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
