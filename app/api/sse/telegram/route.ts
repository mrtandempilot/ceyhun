import { NextRequest } from 'next/server';

// In-memory store for SSE connections (not production ready, but for demo)
const clients = new Map<string, ReadableStreamDefaultController>();

// Broadcast function to send updates to all connected clients
export function broadcastTelegramUpdate(type: 'conversations' | 'messages', data: any) {
  const message = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;

  // Send to all connected clients
  clients.forEach((controller, clientId) => {
    try {
      controller.enqueue(`data: ${message}`);
    } catch (error) {
      // Client might be disconnected, remove them
      console.log(`Removing disconnected SSE client: ${clientId}`);
      clients.delete(clientId);
    }
  });
}

export async function GET(request: NextRequest) {
  // Create a unique client ID
  const clientId = Math.random().toString(36).substring(2);

  console.log(`🐱 SSE Client connected: ${clientId}`);

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this client
      clients.set(clientId, controller);

      // Send initial connection confirmation
      controller.enqueue('data: {"type": "connected"}\n\n');
    },
    cancel() {
      console.log(`🐱 SSE Client disconnected: ${clientId}`);
      clients.delete(clientId);
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
