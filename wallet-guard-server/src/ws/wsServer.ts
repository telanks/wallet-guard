import { WebSocketServer } from 'ws';
import { registerSocket, unregisterSocket } from './wsHub';

export function startWsServer(port = 3002) {
  const wss = new WebSocketServer({ port });

  console.log(`🟢 WS Server listening on ws://localhost:${port}`);

  wss.on('connection', (ws, req) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      const owner = url.searchParams.get('owner')?.toLowerCase();

      console.log(`🟢 -----WS connection from ${owner}`);

      if (!owner) {
        ws.close();
        return;
      }

      registerSocket(owner, ws);

      ws.on('close', () => {
        unregisterSocket(owner, ws);
      });
    } catch (err) {
      ws.close();
    }
  });
}
