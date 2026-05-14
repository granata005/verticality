import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getDeliverableById,
  getClientByClerkId,
  logDownload,
} from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/storage";
import { isAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deliverable = await getDeliverableById(id);
  if (!deliverable) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await isAdmin();
  let clientId: string | null = null;

  if (!admin) {
    const client = await getClientByClerkId(userId);
    if (!client || client.id !== deliverable.client_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    clientId = client.id;
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  await logDownload({ client_id: clientId, deliverable_id: id, ip });

  const url = await getSignedDownloadUrl(deliverable.file_path);
  return NextResponse.json({ url });
}
