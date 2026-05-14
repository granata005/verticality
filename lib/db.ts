import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const sql = neon(process.env.DATABASE_URL);

// Types
export interface Client {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Deliverable {
  id: string;
  client_id: string;
  project_id: string;
  title: string;
  file_path: string;
  kind: string;
  created_at: string;
}

export interface DownloadLog {
  id: string;
  client_id: string | null;
  deliverable_id: string;
  ts: string;
  ip: string | null;
}

// Client queries
export async function getClientByClerkId(clerkUserId: string): Promise<Client | null> {
  const rows = await sql`
    SELECT * FROM clients WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `;
  return (rows[0] as Client) ?? null;
}

export async function getAllClients(): Promise<Client[]> {
  const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
  return rows as unknown as Client[];
}

export async function createClient(data: {
  clerk_user_id: string;
  name: string;
  email: string;
}): Promise<Client> {
  const rows = await sql`
    INSERT INTO clients (clerk_user_id, name, email)
    VALUES (${data.clerk_user_id}, ${data.name}, ${data.email})
    RETURNING *
  `;
  return rows[0] as Client;
}

// Project queries
export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  const rows = await sql`
    SELECT * FROM projects WHERE client_id = ${clientId} ORDER BY created_at DESC
  `;
  return rows as unknown as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const rows = await sql`SELECT * FROM projects WHERE id = ${projectId} LIMIT 1`;
  return (rows[0] as Project) ?? null;
}

export async function createProject(data: {
  client_id: string;
  name: string;
  description?: string;
}): Promise<Project> {
  const rows = await sql`
    INSERT INTO projects (client_id, name, description)
    VALUES (${data.client_id}, ${data.name}, ${data.description ?? null})
    RETURNING *
  `;
  return rows[0] as Project;
}

// Deliverable queries
export async function getDeliverablesByProjectId(projectId: string): Promise<Deliverable[]> {
  const rows = await sql`
    SELECT * FROM deliverables WHERE project_id = ${projectId} ORDER BY created_at DESC
  `;
  return rows as unknown as Deliverable[];
}

export async function getDeliverableById(id: string): Promise<Deliverable | null> {
  const rows = await sql`SELECT * FROM deliverables WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Deliverable) ?? null;
}

export async function createDeliverable(data: {
  client_id: string;
  project_id: string;
  title: string;
  file_path: string;
  kind: string;
}): Promise<Deliverable> {
  const rows = await sql`
    INSERT INTO deliverables (client_id, project_id, title, file_path, kind)
    VALUES (${data.client_id}, ${data.project_id}, ${data.title}, ${data.file_path}, ${data.kind})
    RETURNING *
  `;
  return rows[0] as Deliverable;
}

// Audit log
export async function logDownload(data: {
  client_id: string | null;
  deliverable_id: string;
  ip: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO download_logs (client_id, deliverable_id, ip)
    VALUES (${data.client_id}, ${data.deliverable_id}, ${data.ip})
  `;
}
