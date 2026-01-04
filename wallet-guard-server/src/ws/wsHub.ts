import type WebSocket from 'ws';

const ownerSockets = new Map<string, Set<WebSocket>>();

export function registerSocket(owner: string, ws: WebSocket) {
  const key = owner.toLowerCase();
  if (!ownerSockets.has(key)) {
    ownerSockets.set(key, new Set());
  }
  ownerSockets.get(key)!.add(ws);
}

export function unregisterSocket(owner: string, ws: WebSocket) {
  const key = owner.toLowerCase();
  ownerSockets.get(key)?.delete(ws);
}

export function pushToOwner(owner: string, payload: any) {
  const sockets = ownerSockets.get(owner.toLowerCase());
  if (!sockets) return;

  const msg = JSON.stringify(payload);

  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}
