import http from 'http';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const jobStore = new Map(); // jobId => { progress, timer }
const clients = new Map();  // jobId => Set of WebSocket

function storeJobProgress(jobId, progress) {
  // If no clients yet, store in memory
  if (!clients.has(jobId)) {
    jobStore.set(jobId, { progress });

    // Clear after 10 minutes if unused
    setTimeout(() => {
      if (jobStore.has(jobId)) {
        jobStore.delete(jobId);
        console.log(`🧹 Cleared job ${jobId} after timeout`);
      }
    }, 10 * 60 * 1000);
  } else {
    // Push directly if listeners exist
    for (const ws of clients.get(jobId)) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ jobId, progress }));
      }
    }
  }
}

// HTTP + WS server
const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/update') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { jobId, progress } = JSON.parse(body);
        storeJobProgress(jobId, progress);
        res.writeHead(200).end('OK');
      } catch (err) {
        res.writeHead(400).end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(200).end('WebSocket Server OK');
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  let jobId;

  ws.once('message', (msg) => {
    try {
      const { subscribeTo } = JSON.parse(msg);
      jobId = subscribeTo;

      if (!clients.has(jobId)) clients.set(jobId, new Set());
      clients.get(jobId).add(ws);

      // Send buffered progress if exists
      if (jobStore.has(jobId)) {
        ws.send(JSON.stringify({ jobId, progress: jobStore.get(jobId).progress }));
        jobStore.delete(jobId); // delivered
      }

      ws.on('close', () => {
        clients.get(jobId).delete(ws);
        if (clients.get(jobId).size === 0) {
          clients.delete(jobId);
        }
      });
    } catch (e) {
      ws.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket + HTTP server on port ${PORT}`);
});
