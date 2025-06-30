import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;

// Create HTTP server (to satisfy Render's health check)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Server Running');
});

const wss = new WebSocketServer({ server });

const sockets = new Set();

wss.on('connection', (ws, req) => {
  sockets.add(ws);
  const ip = req.socket.remoteAddress;
  console.log(`🔌 Client connected from ${ip}. Total connections: ${sockets.size}`);

  ws.send(JSON.stringify({ status: 'connected' }));

  ws.on('close', (code, reason) => {
    sockets.delete(ws);
    console.log(`❌ Client disconnected. Code: ${code}. Remaining: ${sockets.size}`);
  });

  ws.on('error', (err) => {
    console.error(`⚠️ Socket error: ${err.message}`);
  });
});

// Send 200 KB to 100 sockets every 30s
setInterval(() => {
  const sampleData = 'A'.repeat(200 * 1024); // 200 KB
  let sent = 0;

  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN && sent < 100) {
      ws.send(sampleData);
      sent++;
    }
  }

  console.log(`📤 Sent 200KB to ${sent} clients.`);
}, 30_000);

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
