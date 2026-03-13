'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats, getBookingPipeline } from '@/lib/crm';
import type { DashboardStats, BookingPipeline } from '@/types/crm';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<BookingPipeline | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (user.email !== 'mrtandempilot@gmail.com') {
          router.push('/');
          return;
        }

        const [dashboardStats, bookingPipeline] = await Promise.all([
          getDashboardStats(),
          getBookingPipeline()
        ]);

        setStats(dashboardStats);
        setPipeline(bookingPipeline);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading || !stats || !pipeline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-gray-600">Comprehensive business insights and metrics</p>
        </div>

        {/* Revenue Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</div>
              <div className={`mt-2 text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">This Month</div>
              <div className="text-3xl font-bold text-green-600">${stats.monthRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.monthBookings} bookings</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">This Week</div>
              <div className="text-3xl font-bold text-purple-600">${stats.weekRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.weekBookings} bookings</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Today</div>
              <div className="text-3xl font-bold text-orange-600">${stats.todayRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{stats.todayBookings} bookings</div>
            </div>
          </div>
        </div>

        {/* Booking Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Pipeline</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-400 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.pending / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Confirmed</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.confirmed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.confirmed / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.completed / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Cancelled</span>
                    <span className="text-sm font-semibold text-gray-900">{pipeline.cancelled}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{ width: `${stats.totalBookings > 0 ? (pipeline.cancelled / stats.totalBookings) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Booking Value</span>
                  <span className="text-lg font-bold text-gray-900">${stats.averageBookingValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Booking Growth</span>
                  <span className={`text-lg font-bold ${stats.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.bookingGrowth >= 0 ? '+' : ''}{stats.bookingGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats.totalBookings > 0 ? ((pipeline.completed / stats.totalBookings) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Total Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
                  <div className={`mt-2 text-sm ${stats.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.customerGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.customerGrowth).toFixed(1)}% growth
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Active Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {stats.totalCustomers > 0 ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-2">VIP Customers</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.vipCustomers}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {stats.totalCustomers > 0 ? ((stats.vipCustomers / stats.totalCustomers) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Distribution by Type */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Distribution by Type</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Website</div>
                    <div className="text-3xl font-bold">4</div>
                  </div>
                  <svg className="w-8 h-8 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 1h6v6H7V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mt-2 text-sm opacity-75">
                  Direct bookings from website
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">WhatsApp</div>
                    <div className="text-3xl font-bold">0</div>
                  </div>
                  <svg className="w-8 h-8 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mt-2 text-sm opacity-75">
                  WhatsApp inquiries & bookings
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Instagram</div>
                    <div className="text-3xl font-bold">6</div>
                  </div>
                  <svg className="w-8 h-8 opacity-75" fill="currentColor" viewBox="25 25 50 50">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="mt-2 text-sm opacity-75">
                  Instagram DM bookings & inquiries
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Telegram</div>
                    <div className="text-3xl font-bold">14</div>
                  </div>
                  <svg className="w-8 h-8 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div className="mt-2 text-sm opacity-75">
                  Telegram bot interactions
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Website</span>
                  </div>
                  <div className="text-sm font-semibold">4 (50.0%)</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">WhatsApp</span>
                  </div>
                  <div className="text-sm font-semibold">0 (0%)</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-sm text-gray-600">Instagram</span>
                  </div>
                  <div className="text-sm font-semibold">6 (75.0%)</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-sm text-gray-600">Telegram</span>
                  </div>
                  <div className="text-sm font-semibold">14 (50.0%)</div>
                </div>

                <div className="pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-gray-900">Total Activities</span>
                    <span className="text-gray-900">24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operations Analytics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Active Pilots</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.activePilots}</div>
              <div className="text-sm text-gray-500 mt-2">Managing operations</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Total Flights</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalFlights}</div>
              <div className="text-sm text-gray-500 mt-2">Across all pilots</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">Average Rating</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)} ⭐</div>
              <div className="text-sm text-gray-500 mt-2">{stats.pendingReviews} pending reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
