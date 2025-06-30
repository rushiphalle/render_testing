import fetch from 'node-fetch';

const RENDER_URL = 'https://render-testing-m5mh.onrender.com/update'; // Replace with actual

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function pushProgress(jobId, updates) {
  for (const progress of updates) {
    await fetch(RENDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, progress }),
    });

    console.log(`📤 Sent update for ${jobId}: ${progress}`);
    await delay(2000); // simulate time between progress
  }
}

// Example jobs
pushProgress('job123', ['0%', '25%', '50%', '75%', 'Done']);
pushProgress('job456', ['Starting', 'Running', 'Completed']);
