const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const sockets = new Set();

wss.on('connection', (ws) => {
  sockets.add(ws);

  ws.on('close', () => sockets.delete(ws));

  ws.send(JSON.stringify({ status: 'connected' }));
});

setInterval(() => {
  const sampleData = 'A'.repeat(200 * 1024); // 200 KB message
  let count = 0;

  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN && count < 100) {
      ws.send(sampleData);
      count++;
    }
  }
}, 30 * 1000); // every 30 seconds

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
