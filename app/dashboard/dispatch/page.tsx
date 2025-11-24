import { createClient } from '@/utils/supabase/server'
import { autoAssignPilot } from '@/app/actions/dispatch'

export default async function DispatchPage() {
    const supabase = createClient()

    // Fetch Pending Bookings (Not yet assigned)
    // We check if there is NO entry in assignments table for this booking
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*, assignments(*)')
        .eq('status', 'confirmed')
        .order('booking_date', { ascending: true })

    const pendingBookings = bookings?.filter((b: any) => b.assignments.length === 0) || []

    // Fetch Active Pilots
    const { data: pilots } = await supabase
        .from('pilots')
        .select('*')
        .eq('status', 'active')
        .order('daily_flight_count', { ascending: true })

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🪂 Operasyon Merkezi (Dispatch)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT PANEL: PENDING BOOKINGS */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Bekleyen Uçuşlar</h2>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                            {pendingBookings.length}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {pendingBookings.length === 0 ? (
                            <p className="text-gray-500">Atama bekleyen uçuş yok.</p>
                        ) : (
                            pendingBookings.map((booking: any) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{booking.customer_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(booking.booking_date).toLocaleDateString()} - {booking.tour_start_time}
                                        </p>
                                        <p className="text-xs text-blue-500">{booking.tour_name}</p>
                                    </div>
                                    <form action={async () => {
                                        'use server'
                                        await autoAssignPilot(booking.id)
                                    }}>
                                        <button
                                            type="submit"
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        >
                                            ⚡ Auto-Assign
                                        </button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: PILOT STATUS */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Pilot Durumu (Canlı)</h2>
                    </div>
                    <div className="space-y-4">
                        {pilots?.map((pilot: any) => (
                            <div key={pilot.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{pilot.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Max: {pilot.weight_limit_max}kg | Skill: {pilot.skills?.join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{pilot.daily_flight_count}</p>
                                    <p className="text-xs text-gray-400">Uçuş Bugün</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
