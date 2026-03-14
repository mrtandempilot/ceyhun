import { NextRequest, NextResponse } from 'next/server';
import { getSystemStatus } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Basic API Key security
    const authHeader = request.headers.get('Authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    const status = await getSystemStatus(detailed);
    
    return NextResponse.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error in Admin Status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    );
  }
}
