import fetch from 'node-fetch';

const SERVER_URL = 'https://render-testing-m5mh.onrender.com/update'; // 🔁 Replace this
const TOTAL_JOBS = 1000;
const DELAY_BETWEEN = 10; // ms between each update

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function pushJobUpdates() {
  for (let i = 0; i < TOTAL_JOBS; i++) {
    const jobId = `job_${i}`;
    const progress = `Progress ${Math.floor(Math.random() * 100)}%`;

    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, progress }),
      });

      if (!response.ok) {
        console.error(`❌ Failed to update ${jobId}:`, await response.text());
      } else {
        console.log(`📤 Sent update for ${jobId}: ${progress}`);
      }
    } catch (err) {
      console.error(`❌ Network error for ${jobId}:`, err.message);
    }

    await delay(DELAY_BETWEEN); // prevent flooding
  }

  console.log('\n✅ Finished pushing 1000 job updates.');
}

pushJobUpdates();
