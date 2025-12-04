import { NextResponse } from 'next/server';
import { getBlogStats } from '@/lib/crm';

export async function GET() {
    try {
        console.log('🧪 Testing blog stats directly...');
        const result = await getBlogStats();
        console.log('🧪 Test result:', result);

        return NextResponse.json({
            success: true,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('🧪 Test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
