import WebSocket from 'ws';

const SERVER_URL = 'wss://your-render-websocket-url.com'; // 🔁 Replace with your Render WebSocket URL
const TOTAL_CONNECTIONS = 1000;
const sockets = [];

let connected = 0;
let closed = 0;
let errored = 0;

for (let i = 0; i < TOTAL_CONNECTIONS; i++) {
  const ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    connected++;
    console.log(`[${i}] ✅ Connected. Total: ${connected}`);
  });

  ws.on('message', (data) => {
    console.log(`[${i}] 📥 Received: ${data.length} bytes`);
  });

  ws.on('error', (err) => {
    errored++;
    console.error(`[${i}] ❌ Error: ${err.message} | Total errors: ${errored}`);
  });

  ws.on('close', (code, reason) => {
    closed++;
    console.log(`[${i}] 🔌 Closed. Code: ${code}, Reason: ${reason || 'N/A'} | Total closed: ${closed}`);
  });

  sockets.push(ws);
}
