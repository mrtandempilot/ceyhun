import { NextRequest } from 'next/server';
import { addSSEClient, removeSSEClient } from '@/lib/sse-utils';

export async function GET(request: NextRequest) {
  // Create a unique client ID
  const clientId = Math.random().toString(36).substring(2);

  console.log(`🐱 SSE Client connected: ${clientId}`);

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this client
      addSSEClient(clientId, controller);

      // Send initial connection confirmation
      controller.enqueue('data: {"type": "connected"}\n\n');
    },
    cancel() {
      console.log(`🐱 SSE Client disconnected: ${clientId}`);
      removeSSEClient(clientId);
    }
  });

  // Return the stream with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
