/**
 * Auth-boundary smoke test — verifies that a client cannot access another client's deliverables.
 *
 * This hits the running app's download API directly with crafted requests.
 *
 * Usage (requires the app running at BASE_URL):
 *   BASE_URL=https://verticality-production.up.railway.app \
 *   CLIENT1_SESSION_TOKEN=<clerk session JWT for client 1> \
 *   CLIENT2_DELIVERABLE_ID=<deliverable id belonging to client 2> \
 *   npx tsx scripts/test-auth-boundary.ts
 *
 * Expects: HTTP 403 when client 1 tries to download client 2's deliverable.
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const sessionToken = process.env.CLIENT1_SESSION_TOKEN;
const otherDeliverableId = process.env.CLIENT2_DELIVERABLE_ID;

if (!sessionToken || !otherDeliverableId) {
  console.error(
    "Set CLIENT1_SESSION_TOKEN and CLIENT2_DELIVERABLE_ID env vars."
  );
  process.exit(1);
}

async function run() {
  const url = `${BASE_URL}/api/deliverables/${otherDeliverableId}/download`;
  console.log(`GET ${url}`);

  const res = await fetch(url, {
    headers: {
      Cookie: `__session=${sessionToken}`,
    },
  });

  console.log(`Status: ${res.status}`);
  const body = await res.text();
  console.log(`Body: ${body}`);

  if (res.status === 403) {
    console.log("\n✓ Auth boundary holds — 403 returned as expected.");
    process.exit(0);
  } else {
    console.error(
      `\n✗ Auth boundary FAILED — expected 403, got ${res.status}.`
    );
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
