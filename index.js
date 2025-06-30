import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;

const jobStore = new Map(); // jobId -> { progress }
const clients = new Map();  // jobId -> Set of WebSocket

function sendToClients(jobId, progress) {
  const data = JSON.stringify({ jobId, progress });
  if (clients.has(jobId)) {
    for (const ws of clients.get(jobId)) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    }
  }
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/update') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { jobId, progress } = JSON.parse(body);
        if (!clients.has(jobId)) {
          jobStore.set(jobId, progress);
        } else {
          sendToClients(jobId, progress);
        }
        res.writeHead(200).end('OK');
      } catch {
        res.writeHead(400).end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(200).end('RenderServer Running');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.once('message', (msg) => {
    try {
      const { subscribeTo } = JSON.parse(msg);
      const jobId = subscribeTo;
      if (!clients.has(jobId)) clients.set(jobId, new Set());
      clients.get(jobId).add(ws);

      // Send stored progress if exists
      if (jobStore.has(jobId)) {
        ws.send(JSON.stringify({ jobId, progress: jobStore.get(jobId) }));
        jobStore.delete(jobId);
      }

      ws.on('close', () => {
        clients.get(jobId).delete(ws);
        if (clients.get(jobId).size === 0) clients.delete(jobId);
      });
    } catch {
      ws.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 renderServer running on port ${PORT}`);
});
