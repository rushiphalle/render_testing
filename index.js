import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket OK');
});

const wss = new WebSocketServer({ server });
let totalConnected = 0;
let totalClosed = 0;

wss.on('connection', (ws) => {
  totalConnected++;
  process.stdout.write(`\r🔌 Connected: ${totalConnected} | 🛑 Closed: ${totalClosed}`);

  ws.on('close', () => {
    totalClosed++;
    process.stdout.write(`\r🔌 Connected: ${totalConnected} | 🛑 Closed: ${totalClosed}`);
  });

  ws.on('error', () => {
    totalClosed++;
    process.stdout.write(`\r🔌 Connected: ${totalConnected} | 🛑 Closed: ${totalClosed}`);
  });

  ws.send('connected');
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server on port ${PORT}`);
});
