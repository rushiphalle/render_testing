import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket OK');
});

const wss = new WebSocketServer({ server });

let connected = 0;
let closed = 0;

function printStatus() {
  process.stdout.write(
    `\r🔌 Connected: ${connected.toString().padStart(4)} | 🛑 Closed: ${closed.toString().padStart(4)}`
  );
}

wss.on('connection', (ws) => {
  connected++;
  printStatus();

  ws.on('close', () => {
    closed++;
    printStatus();
  });

  ws.on('error', () => {
    closed++;
    printStatus();
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
