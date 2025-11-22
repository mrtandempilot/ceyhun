import { NextRequest, NextResponse } from 'next/server';
import { ZelloNotificationService } from '@/lib/zello-server';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // Validate API key exists (security check)
    const apiKey = process.env.ZELLO_SERVER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Zello API key not configured' },
        { status: 500 }
      );
    }

    let success = false;

    // Handle different notification types
    switch (type) {
      case 'booking':
        success = await ZelloNotificationService.notifyBookingToPilots(data);
        break;

      case 'operations':
        success = await ZelloNotificationService.notifyOperations(data.message);
        break;

      case 'weather':
        success = await ZelloNotificationService.sendWeatherAlert(data.message);
        break;

      case 'safety':
        success = await ZelloNotificationService.sendSafetyAlert(data.message);
        break;

      default:
        success = await ZelloNotificationService.sendTextMessageToOperations(
          `📢 Notification: ${JSON.stringify(data)}`
        );
        break;
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent to Zello operations channel'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification to Zello' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Zello notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET requests for testing
export async function GET() {
  try {
    const apiKeyConfigured = !!process.env.ZELLO_SERVER_API_KEY;
    const success = await ZelloNotificationService.notifyOperations(
      '🤖 Test notification from paragliding dashboard - Zello integration active!'
    );

    return NextResponse.json({
      status: 'Test Complete',
      apiKeyConfigured,
      notificationSent: success
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
