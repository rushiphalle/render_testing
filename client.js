import WebSocket from 'ws';
import cliProgress from 'cli-progress';

const SERVER_URL = 'wss://render-testing-m5mh.onrender.com'; // 🔁 Replace with your WebSocket server URL
const TOTAL = 5000;
const BATCH = 50;
const DELAY = 200;

let connected = 0;
let closed = 0;
let failed = 0;

const bar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: '{type} |{bar}| {value}/{total} {status}',
}, cliProgress.Presets.shades_classic);

const connectBar = bar.create(TOTAL, 0, { type: '🔌 Connecting', status: '' });
const closeBar = bar.create(TOTAL, 0, { type: '🛑 Closed     ', status: '' });
const errorBar = bar.create(TOTAL, 0, { type: '❌ Failed     ', status: '' });

let current = 0;

function connectBatch() {
  for (let i = 0; i < BATCH && current < TOTAL; i++, current++) {
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
      connected++;
      connectBar.update(connected);
    });

    ws.on('close', () => {
      closed++;
      closeBar.update(closed);
    });

    ws.on('error', () => {
      failed++;
      errorBar.update(failed);
    });
  }

  if (current < TOTAL) {
    setTimeout(connectBatch, DELAY);
  } else {
    // Stop bar when all connections are attempted
    const checkCompletion = setInterval(() => {
      if (connected + failed + closed >= TOTAL) {
        bar.stop();
        clearInterval(checkCompletion);
        console.log('\n✅ Load test complete!');
      }
    }, 1000);
  }
}

connectBatch();
