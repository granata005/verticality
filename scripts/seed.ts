/**
 * Seed script — creates two test clients, each with one project and one placeholder deliverable.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Required env vars (in .env.local):
 *   DATABASE_URL=...
 *   SEED_CLIENT_1_CLERK_ID=user_...   (Clerk user ID for test client 1)
 *   SEED_CLIENT_2_CLERK_ID=user_...   (Clerk user ID for test client 2)
 *
 * The Clerk user IDs must already exist in your Clerk project.
 * To find them: Clerk Dashboard → Users → click user → copy the "User ID"
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  const clerk1 =
    process.env.SEED_CLIENT_1_CLERK_ID ?? "user_placeholder_client1";
  const clerk2 =
    process.env.SEED_CLIENT_2_CLERK_ID ?? "user_placeholder_client2";

  console.log("Seeding clients...");

  // Upsert client 1
  const [c1] = await sql`
    INSERT INTO clients (clerk_user_id, name, email)
    VALUES (${clerk1}, 'Acme Corp', 'ceo@acme-test.example')
    ON CONFLICT (clerk_user_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
    RETURNING *
  `;
  console.log("Client 1:", c1.id, c1.name);

  // Upsert client 2
  const [c2] = await sql`
    INSERT INTO clients (clerk_user_id, name, email)
    VALUES (${clerk2}, 'Beta Inc', 'owner@beta-test.example')
    ON CONFLICT (clerk_user_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
    RETURNING *
  `;
  console.log("Client 2:", c2.id, c2.name);

  // Projects
  const [p1] = await sql`
    INSERT INTO projects (client_id, name, description)
    VALUES (${c1.id}, 'Acme SEO Retainer', 'Monthly SEO reporting and optimisation')
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
  const project1 = p1 ?? (await sql`SELECT * FROM projects WHERE client_id = ${c1.id} LIMIT 1`)[0];
  console.log("Project 1:", project1.id, project1.name);

  const [p2] = await sql`
    INSERT INTO projects (client_id, name, description)
    VALUES (${c2.id}, 'Beta Google Ads', 'PPC campaign management')
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
  const project2 = p2 ?? (await sql`SELECT * FROM projects WHERE client_id = ${c2.id} LIMIT 1`)[0];
  console.log("Project 2:", project2.id, project2.name);

  // Deliverables (placeholder file paths — no actual file in storage yet)
  const [d1] = await sql`
    INSERT INTO deliverables (client_id, project_id, title, file_path, kind)
    VALUES (${c1.id}, ${project1.id}, 'SEO Audit — May 2026', 'deliverables/placeholder/acme-seo-audit-may-2026.pdf', 'seo_audit')
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
  const deliverable1 = d1 ?? (await sql`SELECT * FROM deliverables WHERE project_id = ${project1.id} LIMIT 1`)[0];
  console.log("Deliverable 1:", deliverable1.id, deliverable1.title);

  const [d2] = await sql`
    INSERT INTO deliverables (client_id, project_id, title, file_path, kind)
    VALUES (${c2.id}, ${project2.id}, 'Google Ads Audit — May 2026', 'deliverables/placeholder/beta-ads-audit-may-2026.pdf', 'ads_audit')
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
  const deliverable2 = d2 ?? (await sql`SELECT * FROM deliverables WHERE project_id = ${project2.id} LIMIT 1`)[0];
  console.log("Deliverable 2:", deliverable2.id, deliverable2.title);

  console.log("\n✓ Seed complete.");
  console.log(`\nClient 1 (${c1.name}): clerk_user_id=${clerk1}`);
  console.log(`  Project: ${project1.id}`);
  console.log(`  Deliverable: ${deliverable1.id}`);
  console.log(`\nClient 2 (${c2.name}): clerk_user_id=${clerk2}`);
  console.log(`  Project: ${project2.id}`);
  console.log(`  Deliverable: ${deliverable2.id}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
