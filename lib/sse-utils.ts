// In-memory store for SSE connections (not production ready, but for demo)
const clients = new Map<string, ReadableStreamDefaultController>();

// Broadcast function to send updates to all connected clients
export function broadcastTelegramUpdate(type: 'conversations' | 'messages', data: any) {
  const message = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;

  // Send to all connected clients
  clients.forEach((controller, clientId) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Client might be disconnected, remove them
      console.log(`Removing disconnected SSE client: ${clientId}`);
      clients.delete(clientId);
    }
  });
}

// Function to add a client to the SSE connection
export function addSSEClient(clientId: string, controller: ReadableStreamDefaultController) {
  clients.set(clientId, controller);
}

// Function to remove a client from SSE connection
export function removeSSEClient(clientId: string) {
  clients.delete(clientId);
}
