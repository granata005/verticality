import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getProjectById,
  createProject,
  createDeliverable,
} from "@/lib/db";
import { uploadDeliverable } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const clientId = formData.get("clientId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const newProjectName = formData.get("newProjectName") as string | null;
  const title = formData.get("title") as string | null;
  const kind = formData.get("kind") as string | null;
  const file = formData.get("file") as File | null;

  if (!clientId || !title || !kind || !file) {
    return NextResponse.json(
      { error: "clientId, title, kind, and file are required" },
      { status: 400 }
    );
  }

  // Resolve project — use existing or create new
  let resolvedProjectId: string;
  if (projectId) {
    const existing = await getProjectById(projectId);
    if (!existing || existing.client_id !== clientId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    resolvedProjectId = existing.id;
  } else if (newProjectName) {
    const project = await createProject({
      client_id: clientId,
      name: newProjectName,
    });
    resolvedProjectId = project.id;
  } else {
    return NextResponse.json(
      { error: "projectId or newProjectName required" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const contentType = file.type || "application/octet-stream";

  // We need the deliverable id before uploading so the path includes it.
  // Create a placeholder deliverable first, then update with the real path.
  const { randomUUID } = await import("crypto");
  const tempId = randomUUID();

  const filePath = await uploadDeliverable(buffer, file.name, tempId, contentType);

  const deliverable = await createDeliverable({
    client_id: clientId,
    project_id: resolvedProjectId,
    title,
    file_path: filePath,
    kind,
  });

  return NextResponse.json({ deliverable }, { status: 201 });
}
