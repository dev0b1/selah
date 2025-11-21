/*
  Quick dev script to exercise the daily check-in flow.
  Usage:
    BASE_URL=http://localhost:5000 USER_ID=<id> tsx scripts/test-daily-flow.ts

  This script will:
  - GET /api/daily/check-in?userId=
  - POST /api/daily/motivation
  - GET /api/daily/check-in?userId= (again)

  Note: run this against a running dev server.
*/

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const USER_ID = process.env.USER_ID;

if (!USER_ID) {
  console.error('Please set USER_ID env var.');
  process.exit(1);
}

async function getCheckIn() {
  const res = await fetch(`${BASE}/api/daily/check-in?userId=${USER_ID}`);
  const json = await res.json();
  console.log('GET check-in status:', res.status, json);
  return json;
}

async function postMotivation() {
  const payload = {
    userId: USER_ID,
    mood: 'confidence',
    message: 'Testing daily flow from script'
  };

  const res = await fetch(`${BASE}/api/daily/motivation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  console.log('POST motivation:', res.status, json);
  return { status: res.status, body: json };
}

async function run() {
  console.log('Base URL:', BASE);
  await getCheckIn();
  const post = await postMotivation();
  if (post.status === 409) {
    console.log('Already checked in today — expected behavior for repeat runs.');
  }
  await getCheckIn();
}

run().catch(e => {
  console.error('Test script failed:', e);
  process.exit(1);
});
