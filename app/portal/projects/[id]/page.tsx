import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getClerkUserId, isAdmin } from "@/lib/auth";
import {
  getClientByClerkId,
  getProjectById,
  getDeliverablesByProjectId,
} from "@/lib/db";
import { DownloadButton } from "@/components/portal/DownloadButton";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clerkUserId = await getClerkUserId();
  const admin = await isAdmin();

  const project = await getProjectById(id);
  if (!project) notFound();

  // Non-admin clients can only see their own projects
  if (!admin) {
    const client = await getClientByClerkId(clerkUserId);
    if (!client || client.id !== project.client_id) {
      redirect("/portal");
    }
  }

  const deliverables = await getDeliverablesByProjectId(project.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={admin ? `/admin/clients/${project.client_id}` : "/portal/projects"}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-1 text-gray-500">{project.description}</p>
        )}
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">Deliverables</h2>
      {deliverables.length === 0 ? (
        <p className="text-gray-500">No deliverables yet.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {deliverables.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="font-medium text-gray-900">{d.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {d.kind} ·{" "}
                  {new Date(d.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <DownloadButton deliverableId={d.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
