'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
                <div className="p-4">
                    <h2 className="text-lg font-bold text-white mb-6 px-2">Quick Actions</h2>
                    <nav className="space-y-1">
                        {/* Main Navigation */}
                        <div className="mb-6">
                            <Link
                                href="/dashboard"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard' ? 'bg-purple-900/30 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link
                                href="/dashboard/calendar"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/calendar' ? 'bg-blue-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Calendar</span>
                            </Link>
                            <Link
                                href="/dashboard/bookings"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/bookings' ? 'bg-green-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-sm font-medium">Bookings</span>
                            </Link>
                            <Link
                                href="/dashboard/customers"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/customers' ? 'bg-blue-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-sm font-medium">Customers</span>
                            </Link>
                            <Link
                                href="/dashboard/pilots"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/pilots' ? 'bg-purple-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-medium">Pilots</span>
                            </Link>
                            <Link
                                href="/dashboard/tours"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/tours' ? 'bg-cyan-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Tours</span>
                            </Link>
                        </div>

                        {/* Communication */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Communication</p>
                            <Link
                                href="/dashboard/mail"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/mail' ? 'bg-red-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Mail</span>
                            </Link>
                            <Link
                                href="/dashboard/conversations"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/conversations' ? 'bg-green-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <span className="text-sm font-medium">Conversations</span>
                            </Link>
                            <Link
                                href="/dashboard/channels"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/channels' ? 'bg-cyan-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm font-medium">Channels</span>
                            </Link>
                            <Link
                                href="/dashboard/notifications"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/notifications' ? 'bg-yellow-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="text-sm font-medium">Notifications</span>
                            </Link>
                        </div>

                        {/* Analytics & Settings */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Analytics & Settings</p>
                            <Link
                                href="/dashboard/analytics"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/analytics' ? 'bg-pink-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-sm font-medium">Analytics</span>
                            </Link>
                            <Link
                                href="/dashboard/accounting"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/accounting' ? 'bg-emerald-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Accounting</span>
                            </Link>
                            <Link
                                href="/dashboard/dispatch"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/dispatch' ? 'bg-orange-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm font-medium">Dispatch</span>
                            </Link>
                            <Link
                                href="/dashboard/system-monitor"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/system-monitor' ? 'bg-red-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-sm font-medium">System Monitor</span>
                            </Link>
                            <Link
                                href="/dashboard/ping"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/ping' ? 'bg-green-600 text-white' : ''
                                    }`}
                            >
                                <span className="text-xl mr-3">🏓</span>
                                <span className="text-sm font-medium">Database Ping</span>
                            </Link>
                            <Link
                                href="/dashboard/system-status"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/system-status' ? 'bg-blue-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">System Status</span>
                            </Link>
                            <Link
                                href="/dashboard/landing"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/landing' ? 'bg-indigo-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm font-medium">Landing Page</span>
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className={`flex items-center px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${pathname === '/dashboard/settings' ? 'bg-purple-600 text-white' : ''
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
