'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function autoAssignPilot(bookingId: string) {
    const supabase = createClient()

    // 1. Get Booking Details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        return { success: false, error: 'Booking not found' }
    }

    // Mock customer weight if not present (In a real app, this would be in the booking)
    // For now, we assume a standard weight or fetch from a hypothetical 'customer_details'
    const customerWeight = 75 // Default to 75kg for MVP

    // 2. Get Available Pilots
    // Logic: 
    // - Must be 'active'
    // - Weight limit must cover customer weight
    // - Sort by daily_flight_count ASC (Fairness)
    const { data: pilots, error: pilotsError } = await supabase
        .from('pilots')
        .select('*')
        .eq('status', 'active')
        .lte('weight_limit_min', customerWeight)
        .gte('weight_limit_max', customerWeight)
        .order('daily_flight_count', { ascending: true })

    if (pilotsError) {
        return { success: false, error: 'Error fetching pilots' }
    }

    if (!pilots || pilots.length === 0) {
        return { success: false, error: 'No suitable pilots found' }
    }

    // 3. Select the Best Pilot (Top of the list due to sorting)
    const bestPilot = pilots[0]

    // 4. Create Assignment
    const { error: assignError } = await supabase
        .from('assignments')
        .insert({
            booking_id: bookingId,
            pilot_id: bestPilot.id,
            status: 'assigned'
        })

    if (assignError) {
        return { success: false, error: 'Failed to create assignment' }
    }

    // 5. Update Pilot's Flight Count
    const { error: updateError } = await supabase
        .from('pilots')
        .update({ daily_flight_count: (bestPilot.daily_flight_count || 0) + 1 })
        .eq('id', bestPilot.id)

    if (updateError) {
        // Log error but don't fail the whole process, assignment is done
        console.error('Failed to update pilot flight count', updateError)
    }

    revalidatePath('/dashboard/dispatch')
    return { success: true, pilot: bestPilot.name }
}
