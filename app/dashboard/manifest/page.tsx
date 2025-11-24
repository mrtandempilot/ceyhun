'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createShuttle, autoFillShuttle } from '@/app/actions/manifest'

export default function ManifestPage() {
    const [shuttles, setShuttles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadShuttles()
    }, [])

    const loadShuttles = async () => {
        const { data, error } = await supabase
            .from('shuttles')
            .select('*, assignments(*, pilots(*), bookings(*))')
            .order('departure_time', { ascending: true })

        if (data) {
            setShuttles(data)
        }
        setLoading(false)
    }

    const handleCreateShuttle = async () => {
        const time = prompt('Enter departure time (YYYY-MM-DD HH:MM)', new Date().toISOString().slice(0, 16).replace('T', ' '))
        if (!time) return

        await createShuttle(time)
        loadShuttles()
    }

    const handleAutoFill = async (shuttleId: string) => {
        const result = await autoFillShuttle(shuttleId)
        if (result.success) {
            alert(`Added ${result.count} teams to shuttle!`)
            loadShuttles()
        } else {
            alert('Error: ' + result.error)
        }
    }

    if (loading) return <div className="p-8 text-white">Loading manifests...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    🚐 Transfer Listeleri (Manifest)
                </h1>
                <button
                    onClick={handleCreateShuttle}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Yeni Servis Oluştur
                </button>
            </div>

            <div className="grid gap-6">
                {shuttles.map((shuttle) => (
                    <div key={shuttle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Servis: {new Date(shuttle.departure_time).toLocaleString('tr-TR')}
                                </h3>
                                <p className="text-gray-400">
                                    Plaka: {shuttle.vehicle_plate || 'Atanmadı'} |
                                    Kapasite: {shuttle.assignments?.length * 2 || 0} / {shuttle.capacity}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${shuttle.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                                    }`}>
                                    {shuttle.status}
                                </span>
                                <button
                                    onClick={() => handleAutoFill(shuttle.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                    Otomatik Doldur
                                </button>
                            </div>
                        </div>

                        {/* Passenger List */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Pilot</th>
                                        <th className="px-4 py-2">Yolcu</th>
                                        <th className="px-4 py-2">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shuttle.assignments && shuttle.assignments.length > 0 ? (
                                        shuttle.assignments.map((assignment: any) => (
                                            <tr key={assignment.id} className="border-b border-gray-700">
                                                <td className="px-4 py-2 font-medium text-white">
                                                    {assignment.pilots?.first_name} {assignment.pilots?.last_name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {assignment.bookings?.customer_name || 'Misafir'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {assignment.status}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                                                Bu serviste henüz kimse yok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {shuttles.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        Henüz planlanmış bir servis yok.
                    </div>
                )}
            </div>
        </div>
    )
}
