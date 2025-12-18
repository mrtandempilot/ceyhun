import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      console.log('🔗 Instagram SSE connection established');

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Instagram SSE connected' })}\n\n`)
      );

      let lastCheck = new Date();

      const checkForUpdates = async () => {
        try {
          // Check for new messages since last check
          const { data: newMessages, error } = await supabaseAdmin
            .from('instagram_messages')
            .select('conversation_id, created_at')
            .gte('created_at', lastCheck.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            console.error('❌ Error checking Instagram messages:', error);
            return;
          }

          if (newMessages && newMessages.length > 0) {
            console.log(`🔔 ${newMessages.length} new Instagram messages detected`);
            
            // Send update notification
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'messages', 
                count: newMessages.length,
                data: newMessages 
              })}\n\n`)
            );

            // Also send conversations update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'conversations' })}\n\n`)
            );
          }

          lastCheck = new Date();
        } catch (error) {
          console.error('❌ Error in Instagram SSE check:', error);
        }
      };

      // Check for updates every 3 seconds
      const interval = setInterval(checkForUpdates, 3000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        console.log('🔌 Instagram SSE connection closed');
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
