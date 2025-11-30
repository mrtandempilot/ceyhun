import { NextRequest, NextResponse } from 'next/server';
import { checkPilotAvailability } from '@/lib/bookings';

/**
 * API endpoint for checking pilot availability before creating bookings
 * Used by n8n chatbot to make capacity-aware responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, adults, children } = body;

    // Validate required parameters
    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    const requestedPassengers = (adults || 0) + (children || 0);

    if (requestedPassengers <= 0) {
      return NextResponse.json(
        { error: 'At least one passenger required' },
        { status: 400 }
      );
    }

    // Check pilot availability
    const availability = await checkPilotAvailability(date, time, requestedPassengers);

    return NextResponse.json({
      available: availability.available,
      passengers_requested: requestedPassengers,
      available_slots: availability.availableSeats,
      message: availability.message,
      can_proceed: availability.available || false
    });

  } catch (error: any) {
    console.error('Capacity check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check capacity availability' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick capacity status by date/time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const adults = parseInt(searchParams.get('adults') || '0');
    const children = parseInt(searchParams.get('children') || '0');

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    const requestedPassengers = adults + children;

    if (requestedPassengers <= 0) {
      return NextResponse.json(
        { error: 'At least one passenger required' },
        { status: 400 }
      );
    }

    const availability = await checkPilotAvailability(date, time, requestedPassengers);

    return NextResponse.json({
      available: availability.available,
      passengers_requested: requestedPassengers,
      available_slots: availability.availableSeats,
      message: availability.message,
      can_proceed: availability.available
    });

  } catch (error: any) {
    console.error('Capacity check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check capacity availability' },
      { status: 500 }
    );
  }
}
