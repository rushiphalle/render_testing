import WebSocket from 'ws';

const SERVER_URL = 'wss://render-testing-m5mh.onrender.com'; // Replace with your actual Render URL
const TOTAL_CONNECTIONS = 1000;

let active = 0;

for (let i = 0; i < TOTAL_CONNECTIONS; i++) {
  const ws = new WebSocket(SERVER_URL);

  ws.on('open', () => {
    active++;
    console.log(`Connected: ${active}`);
  });

  ws.on('message', (data) => {
    console.log(`[${i}] Received: ${data.length} bytes`);
  });

  ws.on('close', () => {
    active--;
    console.log(`Closed: ${active}`);
  });

  ws.on('error', (err) => {
    console.error(`[${i}] Error:`, err.message);
  });
}
