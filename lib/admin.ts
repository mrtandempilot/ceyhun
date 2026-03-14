import { supabaseAdmin } from './supabase-admin';

export async function getSystemStatus() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();

  if (!supabaseAdmin) {
    return {
      timestamp: new Date().toISOString(),
      stats: { today_bookings: 0, today_revenue: 0, total_pending_bookings: 0, active_pilots: 0 },
      system_health: { database: 'configuration_missing', api: 'healthy' }
    };
  }

  // 1. Get today's bookings
  const [
    { count: todayBookings, error: bookingsError },
    { data: revenueData },
    { count: pendingBookings },
    { count: activePilots },
    { count: telegramMsgsToday },
    { count: whatsappMsgsToday },
    { count: newCustomersToday }
  ] = await Promise.all([
    supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO),
    
    supabaseAdmin
      .from('bookings')
      .select('total_amount')
      .eq('status', 'confirmed')
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO),

    supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabaseAdmin
      .from('pilots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    supabaseAdmin
      .from('telegram_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),

    supabaseAdmin
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),

    supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)
  ]);

  const totalRevenue = revenueData?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;

  // Generate a human-readable summary for the agent
  const summary = `System Status Summary (${new Date().toLocaleDateString()}):
- Today's Bookings: ${todayBookings || 0}
- Revenue Generated Today: €${totalRevenue.toFixed(2)}
- Pending Inquiries: ${pendingBookings || 0}
- Active Pilots on Duty: ${activePilots || 0}
- New Customer Messages: ${((telegramMsgsToday || 0) + (whatsappMsgsToday || 0))} (${telegramMsgsToday || 0} Telegram, ${whatsappMsgsToday || 0} WhatsApp)
- New Customer Registrations: ${newCustomersToday || 0}
Action Items: ${pendingBookings && pendingBookings > 0 ? `There are ${pendingBookings} pending bookings requiring attention.` : 'No critical pending bookings.'}`;

  return {
    timestamp: new Date().toISOString(),
    stats: {
      today_bookings: todayBookings || 0,
      today_revenue: totalRevenue,
      total_pending_bookings: pendingBookings || 0,
      active_pilots: activePilots || 0,
      today_messages: (telegramMsgsToday || 0) + (whatsappMsgsToday || 0),
      today_new_customers: newCustomersToday || 0
    },
    summary,
    system_health: {
      database: !bookingsError ? 'healthy' : 'error',
      api: 'healthy'
    }
  };
}
