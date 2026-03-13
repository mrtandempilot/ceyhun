'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TableStatus {
    name: string;
    count: number;
    status: string;
    error?: string;
    lastChecked: Date;
}

export default function SystemStatusPage() {
    const [tables, setTables] = useState<TableStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        checkTables();
    }, []);

    async function checkTables() {
        setLoading(true);

        const tableNames = [
            'customers',
            'pilots',
            'bookings',
            'tour_packages',
            'posts',
            'post_categories',
            'post_tags',
            'post_category_relations',
            'post_tag_relations',
            'contact_submissions',
            'whatsapp_messages',
            'whatsapp_conversations',
            'chatbot_conversations',
            'incoming_emails',
            'reviews',
            'communications',
            'customer_interactions',
            'invoices'
        ];

        const results = await Promise.allSettled(
            tableNames.map(async (tableName) => {
                try {
                    console.log(`Testing table: ${tableName}`);

                    // Try to count records in the table
                    const { count, error } = await supabase
                        .from(tableName)
                        .select('*', { count: 'exact', head: true });

                    console.log(`${tableName}:`, { count, error });

                    return {
                        name: tableName,
                        count: count || 0,
                        status: (error ? 'error' : 'success') as TableStatus['status'],
                        error: error?.message,
                        lastChecked: new Date()
                    };
                } catch (err: any) {
                    console.error(`Error checking ${tableName}:`, err);
                    return {
                        name: tableName,
                        count: 0,
                        status: 'error',
                        error: err?.message || 'Unknown error',
                        lastChecked: new Date()
                    };
                }
            })
        );

        // Process results
        const tableStatuses: TableStatus[] = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    name: tableNames[index],
                    count: 0,
                    status: 'error' as const,
                    error: result.reason?.message || 'Promise rejected',
                    lastChecked: new Date()
                };
            }
        });

        setTables(tableStatuses as TableStatus[]);
        setLoading(false);
        setLastRefresh(new Date());

        console.log('All table statuses:', tableStatuses);
    }

    const StatusIcon = ({ status }: { status: TableStatus['status'] }) => {
        if (status === 'success') return <span className="text-green-500">✅</span>;
        if (status === 'error') return <span className="text-red-500">❌</span>;
        return <span className="text-gray-500">⏳</span>;
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">System Status</h1>
                    <p className="mt-2 text-gray-400">Supabase Tables Status & Counts</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-400">
                        Last checked: {lastRefresh.toLocaleString()}
                    </p>
                    <button
                        onClick={checkTables}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition duration-200"
                    >
                        {loading ? 'Checking...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-4 text-gray-400">Checking all tables...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table) => (
                        <div
                            key={table.name}
                            className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${table.status === 'success' ? 'bg-green-900/20 border-green-700' :
                                table.status === 'error' ? 'bg-red-900/20 border-red-700' :
                                    'bg-gray-900/20'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">{table.name}</h3>
                                <StatusIcon status={table.status} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Records:</span>
                                    <span className="font-mono text-white">{table.count.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`text-xs px-2 py-1 rounded ${table.status === 'success' ? 'bg-green-600 text-white' :
                                        table.status === 'error' ? 'bg-red-600 text-white' :
                                            'bg-gray-600 text-white'
                                        }`}>
                                        {table.status}
                                    </span>
                                </div>

                                {table.error && (
                                    <div className="mt-3 p-2 bg-red-900/50 rounded border border-red-700">
                                        <p className="text-red-400 text-xs">{table.error}</p>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 mt-2">
                                    Checked: {table.lastChecked.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-green-500">{tables.filter(t => t.status === 'success').length}</p>
                        <p className="text-gray-400">Working Tables</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-500">{tables.filter(t => t.status === 'error').length}</p>
                        <p className="text-gray-400">Error Tables</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-500">{tables.reduce((sum, t) => sum + t.count, 0).toLocaleString()}</p>
                        <p className="text-gray-400">Total Records</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-500">
                            {tables.filter(t => t.status === 'success' && t.count > 0).length}
                        </p>
                        <p className="text-gray-400">Tables with Data</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
