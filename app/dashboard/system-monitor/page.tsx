'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface SystemStats {
    totals: Record<string, number>;
    today: Record<string, number>;
    timestamp: string;
}

interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    timestamp: string;
    icon: string;
    color: string;
}

interface TableInfo {
    table: string;
    count: number;
    today_count: number;
    error: string | null;
}

export default function SystemMonitorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [activeTab, setActiveTab] = useState<'activity' | 'tables' | 'analytics'>('analytics');

    useEffect(() => {
        async function checkAuth() {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    router.push('/login');
                    return;
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    useEffect(() => {
        if (!loading) {
            loadData();

            if (autoRefresh) {
                const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
                return () => clearInterval(interval);
            }
        }
    }, [autoRefresh, loading]);

    async function loadData() {
        try {
            const [statsRes, activityRes, tablesRes] = await Promise.all([
                fetch('/api/system/stats'),
                fetch('/api/system/activity?limit=100'),
                fetch('/api/system/tables'),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.data);
            }

            if (activityRes.ok) {
                const activityData = await activityRes.json();
                setActivities(activityData.data);
            }

            if (tablesRes.ok) {
                const tablesData = await tablesRes.json();
                setTables(tablesData.data);
            }
        } catch (error) {
            console.error('Error loading system data:', error);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading System Monitor...</p>
                </div>
            </div>
        );
    }

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-500',
            cyan: 'bg-cyan-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            indigo: 'bg-indigo-500',
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
        };
        return colors[color] || 'bg-gray-500';
    };

    const totalRecords = tables.reduce((sum, t) => sum + t.count, 0);
    const todayTotal = tables.reduce((sum, t) => sum + t.today_count, 0);

    // Prepare chart data
    const topTables = tables
        .filter(t => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const activityByType = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const activityChartData = Object.entries(activityByType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
    }));

    const COLORS = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

    // Activity timeline - group by hour
    const activityTimeline = activities.reduce((acc, activity) => {
        const hour = new Date(activity.timestamp).getHours();
        const key = `${hour}:00`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const timelineData = Object.entries(activityTimeline)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => parseInt(a.time) - parseInt(b.time));

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white">System Monitor</h1>
                        <p className="mt-2 text-gray-400">Real-time overview of all system activities and database</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded text-cyan-600 focus:ring-cyan-500"
                            />
                            Auto-refresh (10s)
                        </label>
                        <button
                            onClick={loadData}
                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Now
                        </button>
                    </div>
                </div>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
                    {/* Total Records */}
                    <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg shadow-lg p-6 border border-cyan-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-cyan-100">Total Records</h3>
                            <span className="text-2xl">💾</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</div>
                        <div className="text-xs text-cyan-100 mt-1">Across {tables.length} tables</div>
                    </div>

                    {/* Today's Activity */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 border border-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-green-100">Today's Activity</h3>
                            <span className="text-2xl">📊</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{todayTotal}</div>
                        <div className="text-xs text-green-100 mt-1">New records today</div>
                    </div>

                    {/* Bookings */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Bookings</h3>
                            <span className="text-2xl">📅</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totals.bookings || 0}</div>
                        <div className="text-xs text-green-400 mt-1">+{stats?.today.bookings || 0} today</div>
                    </div>

                    {/* Customers */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Customers</h3>
                            <span className="text-2xl">👥</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totals.customers || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">Total customers</div>
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">WhatsApp</h3>
                            <span className="text-2xl">💬</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totals.whatsapp_messages || 0}</div>
                        <div className="text-xs text-green-400 mt-1">+{stats?.today.whatsapp_messages || 0} today</div>
                    </div>

                    {/* Blog Posts */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Blog Posts</h3>
                            <span className="text-2xl">📝</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totals.blog_posts || 0}</div>
                        <div className="text-xs text-purple-400 mt-1">+{stats?.today.blog_posts || 0} published today</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-700">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-3 font-medium transition border-b-2 ${
                                activeTab === 'analytics'
                                    ? 'text-cyan-400 border-cyan-400'
                                    : 'text-gray-400 border-transparent hover:text-white'
                            }`}
                        >
                            📊 Analytics Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-6 py-3 font-medium transition border-b-2 ${
                                activeTab === 'activity'
                                    ? 'text-cyan-400 border-cyan-400'
                                    : 'text-gray-400 border-transparent hover:text-white'
                            }`}
                        >
                            🔔 Live Activity Feed ({activities.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('tables')}
                            className={`px-6 py-3 font-medium transition border-b-2 ${
                                activeTab === 'tables'
                                    ? 'text-cyan-400 border-cyan-400'
                                    : 'text-gray-400 border-transparent hover:text-white'
                            }`}
                        >
                            🗄️ Database Tables ({tables.length})
                        </button>
                    </nav>
                </div>

                {/* Analytics Dashboard */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top 10 Tables by Record Count */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Top 10 Tables by Record Count</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topTables} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                                        <YAxis type="category" dataKey="table" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={150} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Activity by Type */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Activity Distribution by Type</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={activityChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {activityChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 lg:col-span-2">
                            <h2 className="text-xl font-bold text-white mb-4">Activity Timeline (Last 24 Hours)</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="time" tick={{ fill: '#9CA3AF' }} />
                                        <YAxis tick={{ fill: '#9CA3AF' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Communication Stats */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Communication Channels</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💬</span>
                                        <div>
                                            <div className="font-semibold text-white">WhatsApp</div>
                                            <div className="text-sm text-gray-400">{stats?.totals.whatsapp_conversations || 0} conversations</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{stats?.totals.whatsapp_messages || 0}</div>
                                        <div className="text-xs text-green-400">+{stats?.today.whatsapp_messages || 0} today</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📱</span>
                                        <div>
                                            <div className="font-semibold text-white">Telegram</div>
                                            <div className="text-sm text-gray-400">{stats?.totals.telegram_conversations || 0} conversations</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{stats?.totals.telegram_messages || 0}</div>
                                        <div className="text-xs text-cyan-400">+{stats?.today.telegram_messages || 0} today</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💭</span>
                                        <div>
                                            <div className="font-semibold text-white">Website Chat</div>
                                            <div className="text-sm text-gray-400">{stats?.totals.chat_conversations || 0} conversations</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">Active</div>
                                        <div className="text-xs text-indigo-400">Live chatbot</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                    <span className="text-gray-300">Pilots</span>
                                    <span className="font-bold text-white">{stats?.totals.pilots || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                    <span className="text-gray-300">Total Bookings</span>
                                    <span className="font-bold text-white">{stats?.totals.bookings || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                    <span className="text-gray-300">Total Customers</span>
                                    <span className="font-bold text-white">{stats?.totals.customers || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                    <span className="text-gray-300">Blog Posts Published</span>
                                    <span className="font-bold text-white">{stats?.totals.blog_posts || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded border-t-2 border-cyan-500">
                                    <span className="text-gray-300 font-semibold">Database Records</span>
                                    <span className="font-bold text-cyan-400 text-lg">{totalRecords.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Activity Feed */}
                {activeTab === 'activity' && (
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-white">Live Activity Feed</h2>
                            <p className="text-sm text-gray-400 mt-1">Real-time feed of all system events - Bookings, Messages, Blog Posts, and more</p>
                        </div>
                        <div className="p-6">
                            {activities.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No recent activity</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[800px] overflow-y-auto">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition"
                                        >
                                            <div className={`flex-shrink-0 w-12 h-12 ${getColorClass(activity.color)} rounded-lg flex items-center justify-center text-2xl`}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 mb-2">{activity.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        activity.status === 'success' || activity.status === 'published' || activity.status === 'confirmed'
                                                            ? 'bg-green-900 text-green-300'
                                                            : activity.status === 'pending'
                                                            ? 'bg-yellow-900 text-yellow-300'
                                                            : 'bg-gray-900 text-gray-300'
                                                    }`}>
                                                        {activity.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500 uppercase">{activity.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Database Tables */}
                {activeTab === 'tables' && (
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-2xl font-bold text-white">All Database Tables</h2>
                            <p className="text-sm text-gray-400 mt-1">Complete overview of Supabase database - {tables.length} tables with {totalRecords.toLocaleString()} total records</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {tables.map((table) => (
                                    <div key={table.table} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition border border-gray-600">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white capitalize text-sm">{table.table.replace(/_/g, ' ')}</h3>
                                            {table.today_count > 0 && (
                                                <span className="px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded font-bold">
                                                    +{table.today_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">Records:</span>
                                                <span className="font-bold text-white text-lg">{table.count.toLocaleString()}</span>
                                            </div>
                                            {table.today_count > 0 && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">Today:</span>
                                                    <span className="font-semibold text-green-400">+{table.today_count}</span>
                                                </div>
                                            )}
                                        </div>
                                        {table.error && (
                                            <p className="text-xs text-red-400 mt-2">{table.error}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Updated */}
                {stats && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Last updated: {new Date(stats.timestamp).toLocaleString()} • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                    </div>
                )}
            </div>
        </div>
    );
}
