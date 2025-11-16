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
