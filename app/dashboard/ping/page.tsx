'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PingStatus {
    table: string;
    status: 'connected' | 'disconnected' | 'checking';
    count: number;
    lastChecked: Date;
}

export default function PingPage() {
    const [pingStatuses, setPingStatuses] = useState<PingStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const tables = [
        'customers',
        'pilots',
        'bookings',
        'tour_packages',
        'posts',
        'whatsapp_messages',
        'whatsapp_conversations',
        'telegram_messages',
        'telegram_conversations',
        'instagram_messages',
        'instagram_conversations',
        'chatbot_conversations',
        'contact_submissions',
        'reviews',
        'communications',
        'invoices',
        'post_categories',
        'post_tags',
        'incoming_emails'
    ];

    useEffect(() => {
        pingTables();
    }, []);

    async function pingTables() {
        setLoading(true);

        console.log('🏓 Starting database ping test...');

        const initialStatuses: PingStatus[] = tables.map(table => ({
            table,
            status: 'checking',
            count: 0,
            lastChecked: new Date()
        }));

        setPingStatuses(initialStatuses);

        const results = await Promise.allSettled(
            tables.map(async (tableName, index) => {
                try {
                    console.log(`🏓 Pinging table: ${tableName}`);

                    // Set as checking
                    setPingStatuses(prev => prev.map((item, i) =>
                        i === index
                            ? { ...item, status: 'checking' as const }
                            : item
                    ));

                    // Try to get a count from the table
                    const { count, error } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true })
                        .limit(1000); // Small limit for quick check

                    const isConnected = !error;
                    const recordCount = count || 0;

                    console.log(`🏓 ${tableName}: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'} (${recordCount} records)`);

                    const result: PingStatus = {
                        table: tableName,
                        status: isConnected ? 'connected' : 'disconnected',
                        count: recordCount,
                        lastChecked: new Date()
                    };

                    // Update individual table status
                    setPingStatuses(prev => prev.map((item, i) =>
                        i === index ? result : item
                    ));

                    return result;

                } catch (err: any) {
                    console.error(`🏓 ${tableName}: ERROR - ${err?.message || 'Unknown error'}`);

                    const result: PingStatus = {
                        table: tableName,
                        status: 'disconnected',
                        count: 0,
                        lastChecked: new Date()
                    };

                    setPingStatuses(prev => prev.map((item, i) =>
                        i === index ? result : item
                    ));

                    return result;
                }
            })
        );

        setLoading(false);
        console.log('🏓 Ping test completed');
    }

    const StatusBadge = ({ status }: { status: PingStatus['status'] }) => {
        const isConnected = status === 'connected';
        const isChecking = status === 'checking';

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isConnected
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : isChecking
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                }`}>
                <div className={`w-3 h-3 rounded-full ${isConnected
                    ? 'bg-green-500'
                    : isChecking
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`} />
                {isConnected ? 'CONNECTED' : isChecking ? 'CHECKING...' : 'DISCONNECTED'}
            </div>
        );
    };

    const connectedCount = pingStatuses.filter(s => s.status === 'connected').length;
    const totalTables = tables.length;

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        🏓 Database Ping
                    </h1>
                    <p className="mt-2 text-gray-400">Check connectivity status of all database tables</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                            {connectedCount}/{totalTables}
                        </div>
                        <div className="text-sm text-gray-400">Tables Connected</div>
                    </div>
                    <button
                        onClick={pingTables}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition duration-200 font-medium"
                    >
                        {loading ? 'Pinging...' : '🔄 Ping Database'}
                    </button>
                </div>
            </div>

            {/* Connection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">✅</div>
                        <div>
                            <div className="text-3xl font-bold">{connectedCount}</div>
                            <div className="text-green-100">Connected Tables</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">❌</div>
                        <div>
                            <div className="text-3xl font-bold">{totalTables - connectedCount}</div>
                            <div className="text-red-100">Disconnected Tables</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">🏓</div>
                        <div>
                            <div className="text-3xl font-bold">
                                {pingStatuses.reduce((sum, s) => sum + s.count, 0).toLocaleString()}
                            </div>
                            <div className="text-blue-100">Total Records</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables List */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-900 border-b border-gray-600">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Table Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Records
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Last Checked
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {pingStatuses.map((ping) => (
                                <tr
                                    key={ping.table}
                                    className={`hover:bg-gray-750 transition-colors ${ping.status === 'connected' ? 'bg-green-900/20' :
                                        ping.status === 'checking' ? 'bg-yellow-900/20' :
                                            'bg-red-900/20'
                                        }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <code className="text-sm font-semibold text-white bg-gray-700 px-2 py-1 rounded">
                                                {ping.table}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={ping.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className="font-mono font-bold">
                                            {ping.count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {ping.lastChecked.toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Status Legend</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-gray-300">
                            <strong className="text-green-400">CONNECTED</strong> - Table accessible and working
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-gray-300">
                            <strong className="text-red-400">DISCONNECTED</strong> - Table not found or error
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
