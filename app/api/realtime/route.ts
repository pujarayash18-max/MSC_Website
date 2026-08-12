import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Global subscriber set for SSE broadcasts
type SSEClient = (data: string) => void;
const sseClients = new Set<SSEClient>();

export function broadcastEvent(event: string, payload: Record<string, unknown>) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const send of sseClients) {
    try {
      send(data);
    } catch {
      sseClients.delete(send);
    }
  }
}

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const send: SSEClient = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch {
          sseClients.delete(send);
        }
      };

      sseClients.add(send);

      // Send initial connection ACK
      controller.enqueue(new TextEncoder().encode(`: connected\n\n`));

      // Periodic heartbeat ping every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
          sseClients.delete(send);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        sseClients.delete(send);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
