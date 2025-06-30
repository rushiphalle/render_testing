import WebSocket from 'ws';
import cliProgress from 'cli-progress';

const SERVER_URL = 'wss://render-testing-m5mh.onrender.com'; // 🔁 Replace with your WebSocket server URL
const TOTAL_CLIENTS = 1000;
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 100;

let connected = 0;
let closed = 0;
let failed = 0;

const jobIds = Array.from({ length: TOTAL_CLIENTS }, (_, i) => `job_${Math.floor(i / 10)}`); 
// 10 clients per job (100 jobs total)

const multiBar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: '{type} |{bar}| {value}/{total} {extra}',
}, cliProgress.Presets.shades_classic);

const connectBar = multiBar.create(TOTAL_CLIENTS, 0, { type: '🔌 Connected', extra: '' });
const closeBar = multiBar.create(TOTAL_CLIENTS, 0, { type: '🛑 Closed   ', extra: '' });
const failBar = multiBar.create(TOTAL_CLIENTS, 0, { type: '❌ Failed   ', extra: '' });

let index = 0;

function launchBatch() {
  for (let i = 0; i < BATCH_SIZE && index < TOTAL_CLIENTS; i++, index++) {
    const jobId = jobIds[index];
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
      connected++;
      connectBar.update(connected);
      ws.send(JSON.stringify({ subscribeTo: jobId }));
    });

    ws.on('message', (data) => {
      const { jobId, progress } = JSON.parse(data);
      console.log(`[Client ${index}] 📥 ${jobId}: ${progress}`);
    });

    ws.on('close', () => {
      closed++;
      closeBar.update(closed);
    });

    ws.on('error', () => {
      failed++;
      failBar.update(failed);
    });
  }

  if (index < TOTAL_CLIENTS) {
    setTimeout(launchBatch, DELAY_BETWEEN_BATCHES);
  } else {
    // Done launching all — wait for cleanup
    const interval = setInterval(() => {
      if (closed + failed === TOTAL_CLIENTS) {
        multiBar.stop();
        clearInterval(interval);
        console.log('\n✅ All clients done.');
      }
    }, 1000);
  }
}

launchBatch();
