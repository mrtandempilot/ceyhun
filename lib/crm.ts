import { supabase } from '@/lib/supabase';
import type {
  Customer,
  Pilot,
  TourPackage,
  Communication,
  CustomerInteraction,
  Review,
  DashboardStats,
  BookingPipeline
} from '@/types/crm';

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomers() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('customer_email, total_amount, status');

  // Calculate total_spent and total_bookings for each customer
  const customersWithStats = customers?.map(customer => {
    const customerBookings = bookings?.filter(b => b.customer_email === customer.email) || [];
    const completedBookings = customerBookings.filter(b => b.status === 'completed');

    return {
      ...customer,
      total_bookings: customerBookings.length,
      total_spent: completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    };
  }) || [];

  return customersWithStats as Customer[];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(customer: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Customer[];
}

// ============================================
// PILOTS
// ============================================

export async function getPilots() {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .order('first_name');

  if (error) throw error;
  return data as Pilot[];
}

export async function getActivePilots() {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('status', 'active')
    .order('first_name');

  if (error) throw error;
  return data as Pilot[];
}

export async function getPilotById(id: string) {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Pilot;
}

export async function createPilot(pilot: Partial<Pilot>) {
  const { data, error } = await supabase
    .from('pilots')
    .insert([pilot])
    .select()
    .single();

  if (error) throw error;
  return data as Pilot;
}

export async function updatePilot(id: string, updates: Partial<Pilot>) {
  const { data, error } = await supabase
    .from('pilots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Pilot;
}

// ============================================
// TOUR PACKAGES
// ============================================

export async function getTourPackages() {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as TourPackage[];
}

export async function getActiveTourPackages() {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data as TourPackage[];
}

export async function createTourPackage(tourPackage: Partial<TourPackage>) {
  const { data, error } = await supabase
    .from('tour_packages')
    .insert([tourPackage])
    .select()
    .single();

  if (error) throw error;
  return data as TourPackage;
}

export async function updateTourPackage(id: string, updates: Partial<TourPackage>) {
  const { data, error } = await supabase
    .from('tour_packages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TourPackage;
}

// ============================================
// COMMUNICATIONS
// ============================================

export async function getCommunicationsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Communication[];
}

export async function createCommunication(communication: Partial<Communication>) {
  const { data, error } = await supabase
    .from('communications')
    .insert([communication])
    .select()
    .single();

  if (error) throw error;
  return data as Communication;
}

// ============================================
// CUSTOMER INTERACTIONS
// ============================================

export async function getInteractionsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('interaction_date', { ascending: false });

  if (error) throw error;
  return data as CustomerInteraction[];
}

export async function createInteraction(interaction: Partial<CustomerInteraction>) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert([interaction])
    .select()
    .single();

  if (error) throw error;
  return data as CustomerInteraction;
}

export async function updateInteraction(id: string, updates: Partial<CustomerInteraction>) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomerInteraction;
}

// ============================================
// REVIEWS
// ============================================

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customers:customer_id (first_name, last_name),
      pilots:pilot_id (first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function getPendingReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// ============================================
// DASHBOARD ANALYTICS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 2);

  const [
    { data: allCustomers, error: customersError },
    { data: allBookings, error: bookingsError },
    { data: allPilots, error: pilotsError },
    { data: allReviews, error: reviewsError },
  ] = await Promise.all([
    supabase.from('customers').select('id, status, vip_status, created_at'),
    supabase.from('bookings').select('total_amount, booking_date, status, created_at'),
    supabase.from('pilots').select('id, status, total_flights'),
    supabase.from('reviews').select('id, rating'),
  ]);

  if (customersError) throw customersError;
  if (bookingsError) throw bookingsError;
  if (pilotsError) throw pilotsError;
  if (reviewsError) throw reviewsError;

  const completedBookings = allBookings?.filter((b: any) => b.status === 'completed') || [];
  const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
  const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  const filterByDate = (items: any[], dateKey: string, startDate: Date, endDate?: Date) => {
    return items.filter((item: any) => {
      const itemDate = new Date(item[dateKey]);
      return itemDate >= startDate && (!endDate || itemDate < endDate);
    });
  };

  const todayBookingsData = filterByDate(allBookings || [], 'booking_date', today);
  const todayBookings = todayBookingsData.length;
  const todayRevenue = filterByDate(completedBookings, 'booking_date', today)
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const weekBookingsData = filterByDate(allBookings || [], 'booking_date', weekAgo);
  const weekBookings = weekBookingsData.length;
  const weekRevenue = filterByDate(completedBookings, 'booking_date', weekAgo)
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const monthBookingsData = filterByDate(allBookings || [], 'booking_date', monthAgo);
  const monthBookings = monthBookingsData.length;
  const monthRevenue = filterByDate(completedBookings, 'booking_date', monthAgo)
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const lastMonthBookingsData = filterByDate(allBookings || [], 'booking_date', lastMonth, monthAgo);
  const lastMonthBookings = lastMonthBookingsData.length;
  const lastMonthRevenue = filterByDate(completedBookings, 'booking_date', lastMonth, monthAgo)
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const totalCustomers = allCustomers?.length || 0;
  const activeCustomers = allCustomers?.filter((c: any) => c.status === 'active').length || 0;
  const vipCustomers = allCustomers?.filter((c: any) => c.vip_status === true).length || 0;

  const newCustomersMonth = filterByDate(allCustomers || [], 'created_at', monthAgo).length;
  const newCustomersLastMonth = filterByDate(allCustomers || [], 'created_at', lastMonth, monthAgo).length;

  const activePilots = allPilots?.filter((p: any) => p.status === 'active').length || 0;
  const totalFlights = allPilots?.reduce((sum: number, p: any) => sum + (p.total_flights || 0), 0) || 0;

  // Reviews table doesn't have a status column, so pendingReviews will be 0
  const pendingReviews = 0;
  const totalRatings = allReviews?.filter((r: any) => r.rating).reduce((sum: number, r: any) => sum + r.rating, 0) || 0;
  const ratedReviewsCount = allReviews?.filter((r: any) => r.rating).length || 0;
  const averageRating = ratedReviewsCount > 0 ? totalRatings / ratedReviewsCount : 0;

  const revenueGrowth = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : monthRevenue > 0 ? 100 : 0;

  const bookingGrowth = lastMonthBookings > 0
    ? ((monthBookings - lastMonthBookings) / lastMonthBookings) * 100
    : monthBookings > 0 ? 100 : 0;

  const customerGrowth = newCustomersLastMonth > 0
    ? ((newCustomersMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
    : newCustomersMonth > 0 ? 100 : 0;

  return {
    totalCustomers,
    totalBookings: allBookings?.length || 0,
    totalRevenue,
    averageBookingValue,

    todayBookings,
    todayRevenue,

    weekBookings,
    weekRevenue,

    monthBookings,
    monthRevenue,

    activeCustomers,
    vipCustomers,

    activePilots,
    totalFlights,

    pendingReviews,
    averageRating,

    revenueGrowth,
    bookingGrowth,
    customerGrowth,
  };
}

export async function getBookingPipeline(): Promise<BookingPipeline> {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('status');

  const pipeline = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  bookings?.forEach((booking: any) => {
    if (booking.status === 'pending') pipeline.pending++;
    else if (booking.status === 'confirmed') pipeline.confirmed++;
    else if (booking.status === 'completed') pipeline.completed++;
    else if (booking.status === 'cancelled') pipeline.cancelled++;
  });

  return pipeline;
}

export async function getWhatsAppStats() {
  try {
    // Get message counts directly
    const { count: totalMessages } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true });

    const { count: unreadMessages } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender', 'customer')
      .eq('status', 'received');

    // Get conversation counts
    const { count: totalConversations } = await supabase
      .from('whatsapp_conversations')
      .select('*', { count: 'exact', head: true })
      .neq('phone_number', 'bot')
      .neq('status', 'deleted');

    // Get recent active conversations (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: activeConversations } = await supabase
      .from('whatsapp_conversations')
      .select('*', { count: 'exact', head: true })
      .neq('phone_number', 'bot')
      .neq('status', 'deleted')
      .gte('last_message_at', tenMinutesAgo);

    // Get last activity timestamp
    const { data: recentMessage } = await supabase
      .from('whatsapp_messages')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastActivity = recentMessage?.created_at || null;
    const lastActivityFormatted = lastActivity
      ? new Date(lastActivity).toLocaleString('en-US', {
          minute: '2-digit',
          hour: '2-digit',
          day: '2-digit',
          month: 'short'
        })
      : 'No recent activity';

    return {
      totalConversations: totalConversations || 0,
      activeConversations: activeConversations || 0,
      totalMessages: totalMessages || 0,
      unreadMessages: unreadMessages || 0,
      lastActivity,
      lastActivityFormatted
    };
  } catch (error) {
    console.error('Error fetching WhatsApp stats:', error);
    return {
      totalConversations: 0,
      activeConversations: 0,
      totalMessages: 0,
      unreadMessages: 0,
      lastActivity: null,
      lastActivityFormatted: 'No data available'
    };
  }
}

export async function getIncomingContacts() {
  try {
    // Count contact submissions from today (primary source now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: contactSubmissions } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Also count new customers and bookings as secondary source
    const { count: newCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: newBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Total incoming contacts = contact form submissions + new customers + new bookings
    const total = (contactSubmissions || 0) + (newCustomers || 0) + (newBookings || 0);

    // Only return demo data if there are 0 real contacts
    return total > 0 ? total : 0;
  } catch (error) {
    console.error('Error fetching incoming contacts:', error);
    return 0; // No demo data - return 0 to avoid continuous alarms
  }
}

export async function getIncomingEmails() {
  try {
    // Check if incoming_emails table exists (from docs)
    const { count } = await supabase
      .from('incoming_emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');

    return count || 0;
  } catch (error) {
    console.error('Error fetching incoming emails:', error);
    return 0;
  }
}

export async function createContactSubmission(contactData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([contactData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getContactSubmissions() {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateContactSubmissionStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatBotStats() {
  try {
    // Count chatbot conversations from today (separate chatbot_conversations table)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    return count || 0;
  } catch (error) {
    console.error('Error fetching chatbot stats:', error);
    return 0; // Return 0 when table doesn't exist
  }
}

// ============================================
// UPCOMING BOOKINGS
// ============================================

export async function getUpcomingBookings(limit: number = 5) {
  try {
    const now = new Date();

    console.log('🔍 Upcoming Bookings: Current date filter:', now.toISOString().split('T')[0]);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_name,
        tour_name,
        booking_date,
        booking_time,
        status,
        total_amount,
        created_at,
        customers:customer_id (
          phone,
          email
        )
      `)
      .eq('status', 'confirmed')
      .gte('booking_date', now.toISOString().split('T')[0]) // Future dates
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })
      .limit(limit);

    if (error) throw error;

    console.log('🔍 Upcoming Bookings: Raw data from database:', bookings);

    // Format the data for display
    const formattedBookings = bookings?.map((booking: any) => ({
      id: booking.id,
      customer_name: booking.customer_name,
      tour_name: booking.tour_name,
      booking_date: new Date(booking.booking_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      booking_time: booking.booking_time,
      amount: booking.total_amount,
      phone: booking.customers?.phone,
      email: booking.customers?.email,
      display_time: booking.booking_time ? booking.booking_time.slice(0, 5) : 'TBD' // Remove seconds
    })) || [];

    console.log('🔍 Upcoming Bookings: Formatted result:', formattedBookings);

    return formattedBookings;
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return [];
  }
}
