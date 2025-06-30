import WebSocket from 'ws';

const jobId = 'job123'; // Replace with actual jobId
const ws = new WebSocket('wss://your-render-server.onrender.com');

ws.on('open', () => {
  ws.send(JSON.stringify({ subscribeTo: jobId }));
  console.log(`📡 Subscribed to ${jobId}`);
});

ws.on('message', (msg) => {
  const data = JSON.parse(msg);
  console.log(`📥 [${data.jobId}] => ${data.progress}`);
});

ws.on('close', () => {
  console.log('❌ Disconnected');
});
