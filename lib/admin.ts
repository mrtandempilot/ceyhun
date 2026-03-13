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
  const { count: todayBookings, error: bookingsError } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)
    .lt('created_at', tomorrowISO);

  // 2. Get today's revenue (confirmed bookings)
  const { data: revenueData, error: revenueError } = await supabaseAdmin
    .from('bookings')
    .select('total_amount')
    .eq('status', 'confirmed')
    .gte('created_at', todayISO)
    .lt('created_at', tomorrowISO);

  const totalRevenue = revenueData?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;

  // 3. Get pending actions (pending bookings)
  const { count: pendingBookings } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 4. Get active pilots
  const { count: activePilots } = await supabaseAdmin
    .from('pilots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return {
    timestamp: new Date().toISOString(),
    stats: {
      today_bookings: todayBookings || 0,
      today_revenue: totalRevenue,
      total_pending_bookings: pendingBookings || 0,
      active_pilots: activePilots || 0
    },
    system_health: {
      database: !bookingsError ? 'healthy' : 'error',
      api: 'healthy'
    }
  };
}
