/**
 * ============================================================
 * DEVELOPMENT UTILITY — NOT FOR PRODUCTION
 * ============================================================
 * concurrency-test.js
 *
 * Fires two simultaneous POST /api/show-seats/:id/lock requests
 * from two different authenticated users using Promise.all.
 *
 * Expected outcome:
 *   - Exactly ONE request returns HTTP 200 (lock acquired)
 *   - The OTHER returns HTTP 409 (seat held by another user)
 *   - The database ends with status=HELD, heldBy=<exactly one userId>
 *
 * Usage:
 *   1. Start the backend:  cd server && npm run dev
 *   2. Set the three variables below.
 *   3. Run:  node scripts/concurrency-test.js
 * ============================================================
 */

const http = require('http');

// ── CONFIGURE THESE ──────────────────────────────────────────
const BASE_URL  = 'http://localhost:5000';
const SHOW_SEAT_ID = 'REPLACE_WITH_A_REAL_SHOWSEAT_ID';  // ObjectId of an AVAILABLE ShowSeat
const TOKEN_A   = 'REPLACE_WITH_JWT_TOKEN_FOR_USER_A';
const TOKEN_B   = 'REPLACE_WITH_JWT_TOKEN_FOR_USER_B';
// ─────────────────────────────────────────────────────────────

function postLock(showSeatId, token, label) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/show-seats/${showSeatId}/lock`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          label,
          statusCode: res.statusCode,
          body: JSON.parse(body)
        });
      });
    });

    req.on('error', (err) => {
      resolve({ label, statusCode: null, error: err.message });
    });

    req.end();
  });
}

async function run() {
  if (
    SHOW_SEAT_ID === 'REPLACE_WITH_A_REAL_SHOWSEAT_ID' ||
    TOKEN_A      === 'REPLACE_WITH_JWT_TOKEN_FOR_USER_A' ||
    TOKEN_B      === 'REPLACE_WITH_JWT_TOKEN_FOR_USER_B'
  ) {
    console.error('❌  Please set SHOW_SEAT_ID, TOKEN_A, and TOKEN_B before running.');
    process.exit(1);
  }

  console.log('🚀  Firing two simultaneous lock requests...\n');

  // Promise.all fires both requests as close together as the event loop allows
  const [resultA, resultB] = await Promise.all([
    postLock(SHOW_SEAT_ID, TOKEN_A, 'User A'),
    postLock(SHOW_SEAT_ID, TOKEN_B, 'User B')
  ]);

  console.log(`[${resultA.label}]  HTTP ${resultA.statusCode}`);
  console.log(JSON.stringify(resultA.body, null, 2));
  console.log();
  console.log(`[${resultB.label}]  HTTP ${resultB.statusCode}`);
  console.log(JSON.stringify(resultB.body, null, 2));
  console.log();

  const success200 = [resultA, resultB].filter((r) => r.statusCode === 200);
  const fail409    = [resultA, resultB].filter((r) => r.statusCode === 409);

  if (success200.length === 1 && fail409.length === 1) {
    console.log('✅  PASS — exactly one lock acquired, one 409 returned.');
    console.log(`    Lock holder: ${success200[0].label}`);
  } else {
    console.log('❌  FAIL — unexpected outcome:');
    console.log(`    200 responses: ${success200.length}  (expected 1)`);
    console.log(`    409 responses: ${fail409.length}  (expected 1)`);
  }
}

run();
