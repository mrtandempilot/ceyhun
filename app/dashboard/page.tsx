'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats, getBookingPipeline, getWhatsAppStats, getIncomingContacts, getIncomingEmails, getChatBotStats, getUpcomingBookings } from '@/lib/crm';
import type { DashboardStats, BookingPipeline } from '@/types/crm';

// Simple animated bar chart component
function AnimatedBarChart({ title, value, maxValue, icon, color }: { title: string; value: number; maxValue: number; icon: string; color: string }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== currentValue) {
      setAnimating(true);
      setPrevValue(currentValue);
      setCurrentValue(value);

      // Reset animation after 10 seconds
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);

  const percentage = Math.min((currentValue / maxValue) * 100, 100);

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 transition-all duration-500 ${animating ? 'animate-pulse shadow-red-500/50 shadow-lg border-red-500 ring-2 ring-red-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl transition-colors duration-300 ${animating ? 'animate-bounce' : ''}`}>{icon}</span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className={`text-2xl font-bold text-white transition-colors duration-300 ${animating ? 'text-red-400 animate-pulse' : ''}`}>{currentValue}</span>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>{maxValue}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<BookingPipeline | null>(null);
  const [whatsappStats, setWhatsappStats] = useState<any>(null);
  const [incomingContacts, setIncomingContacts] = useState(0);
  const [incomingEmails, setIncomingEmails] = useState(0);
  const [chatBotStats, setChatBotStats] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔍 Starting dashboard data load...');

        // Local development: skip authentication checks
        console.log('🔍 Running in local development mode - skipping auth');

        console.log('🔍 Fetching dashboard stats and pipeline...');
        const [dashboardStats, bookingPipeline, whatsAppData, contactsData, emailsData, chatBotData, upcomingData] = await Promise.all([
          getDashboardStats(),
          getBookingPipeline(),
          getWhatsAppStats(),
          getIncomingContacts(),
          getIncomingEmails(),
          getChatBotStats(),
          getUpcomingBookings(5)
        ]);

        console.log('🔍 Dashboard stats:', dashboardStats);
        console.log('🔍 Booking pipeline:', bookingPipeline);
        console.log('🔍 WhatsApp stats:', whatsAppData);
        console.log('🔍 Incoming contacts:', contactsData);
        console.log('🔍 Incoming emails:', emailsData);
        console.log('🔍 Chat bot stats:', chatBotData);
        console.log('🔍 Upcoming bookings:', upcomingData);

        setStats(dashboardStats);
        setPipeline(bookingPipeline);
        setWhatsappStats(whatsAppData);
        setIncomingContacts(contactsData);
        setIncomingEmails(emailsData);
        setChatBotStats(chatBotData);
        setUpcomingBookings(upcomingData);
        console.log('🔍 Dashboard data loaded successfully!');
      } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard: ' + (error as Error).message + '\n\nCheck console for details.');
      } finally {
        setLoading(false);
      }
    }

    // Load initial data
    loadData();

    // Auto-refresh data every 10 seconds for live updates
    const interval = setInterval(() => {
      loadData();
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [router]);

  if (loading || !stats || !pipeline) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">CRM Dashboard</h1>
          <p className="mt-2 text-gray-400">Welcome back! Here's your business overview.</p>
        </div>

        {/* Animated Live Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedBarChart
            title="WhatsApp Messages"
            value={whatsappStats ? whatsappStats.totalMessages : 0}
            maxValue={1000}
            icon="📱"
            color="bg-green-500"
          />
          <AnimatedBarChart
            title="Incoming Contacts"
            value={incomingContacts}
            maxValue={500}
            icon="📞"
            color="bg-blue-500"
          />
          <AnimatedBarChart
            title="Incoming Emails"
            value={incomingEmails}
            maxValue={100}
            icon="📧"
            color="bg-yellow-500"
          />
          <AnimatedBarChart
            title="Chat Bot Interactions"
            value={chatBotStats > 0 ? chatBotStats : 1} // Show at least 1 for testing
            maxValue={200}
            icon="🤖"
            color="bg-purple-500"
          />
        </div>

        {/* Time Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Today</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Bookings</span>
                <span className="font-semibold text-white">{stats.todayBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="font-semibold text-white">${stats.todayRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Bookings</span>
                <span className="font-semibold text-white">{stats.weekBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="font-semibold text-white">${stats.weekRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Bookings</span>
                <span className="font-semibold text-white">{stats.monthBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="font-semibold text-white">${stats.monthRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Pipeline & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Pipeline */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Booking Pipeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-gray-300">Pending</span>
                </div>
                <span className="font-semibold text-white">{pipeline.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Confirmed</span>
                </div>
                <span className="font-semibold text-white">{pipeline.confirmed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Completed</span>
                </div>
                <span className="font-semibold text-white">{pipeline.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Cancelled</span>
                </div>
                <span className="font-semibold text-white">{pipeline.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Active Customers</span>
                <span className="font-semibold text-white">{stats.activeCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">VIP Customers</span>
                <span className="font-semibold text-white flex items-center">
                  {stats.vipCustomers}
                  <svg className="w-4 h-4 ml-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Active Pilots</span>
                <span className="font-semibold text-white">{stats.activePilots}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Flights</span>
                <span className="font-semibold text-white">{stats.totalFlights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Avg Booking Value</span>
                <span className="font-semibold text-white">${stats.averageBookingValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/dashboard/customers"
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Customer
            </a>
            <a
              href="/bookings"
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Booking
            </a>
            <a
              href="/dashboard/pilots"
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Manage Pilots
            </a>
            <a
              href="/dashboard/dispatch"
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Dispatch Center
            </a>
            <button
              onClick={() => {
                // Test WhatsApp notification with voice
                if (window && (window as any).testWhatsAppNotification) {
                  (window as any).testWhatsAppNotification();
                } else {
                  alert('Test function not loaded yet. Try refreshing the page.');
                }
              }}
              className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              🗣️ Test Voice Alert
            </button>

          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upcoming Bookings
            </h3>
            <a
              href="/bookings"
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              View All →
            </a>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking: any, index: number) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {booking.customer_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.tour_name} • {booking.booking_date} at {booking.display_time}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        ${booking.amount?.toLocaleString() || 'TBD'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={`/bookings?booking=${booking.id}`}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
