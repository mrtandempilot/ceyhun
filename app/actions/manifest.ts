'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShuttle(departureTime: string, capacity: number = 14) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('shuttles')
        .insert({
            departure_time: departureTime,
            capacity: capacity,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating shuttle:', error)
        return { success: false, error: 'Failed to create shuttle' }
    }

    revalidatePath('/dashboard/manifest')
    return { success: true, shuttle: data }
}

export async function autoFillShuttle(shuttleId: string) {
    const supabase = createClient()

    // 1. Get Shuttle Details
    const { data: shuttle, error: shuttleError } = await supabase
        .from('shuttles')
        .select('*')
        .eq('id', shuttleId)
        .single()

    if (shuttleError || !shuttle) {
        return { success: false, error: 'Shuttle not found' }
    }

    // 2. Get Unassigned Assignments
    // Logic:
    // - Status is 'assigned' or 'accepted' (Pilots ready)
    // - Not yet assigned to a shuttle (shuttle_id is null)
    // - Booking time is roughly near shuttle departure (simplified for now: just take next available)
    const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, bookings(*), pilots(*)')
        .in('status', ['assigned', 'accepted'])
        .is('shuttle_id', null)
        .order('assigned_at', { ascending: true })
        .limit(Math.floor(shuttle.capacity / 2)) // 2 seats per assignment (Pilot + Customer)

    if (assignmentsError) {
        return { success: false, error: 'Error fetching assignments' }
    }

    if (!assignments || assignments.length === 0) {
        return { success: false, error: 'No pending assignments found' }
    }

    // 3. Assign to Shuttle
    const assignmentIds = assignments.map(a => a.id)
    const { error: updateError } = await supabase
        .from('assignments')
        .update({ shuttle_id: shuttleId })
        .in('id', assignmentIds)

    if (updateError) {
        return { success: false, error: 'Failed to update assignments' }
    }

    revalidatePath('/dashboard/manifest')
    return { success: true, count: assignments.length }
}
