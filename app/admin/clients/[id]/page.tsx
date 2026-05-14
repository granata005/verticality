import { notFound } from "next/navigation";
import Link from "next/link";
import { sql, getProjectsByClientId, getDeliverablesByProjectId } from "@/lib/db";
import type { Client, Project, Deliverable } from "@/lib/db";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1`;
  const client = rows[0] as Client | undefined;
  if (!client) notFound();

  const projects = await getProjectsByClientId(client.id);

  // Fetch deliverables for each project
  const projectsWithDeliverables: Array<{
    project: Project;
    deliverables: Deliverable[];
  }> = await Promise.all(
    projects.map(async (project) => ({
      project,
      deliverables: await getDeliverablesByProjectId(project.id),
    }))
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/clients"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← All Clients
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          {client.name}
        </h1>
        <p className="text-gray-500 text-sm">{client.email}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Projects</h2>
        <Link
          href={`/admin/upload?clientId=${client.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Upload Deliverable
        </Link>
      </div>

      {projectsWithDeliverables.length === 0 ? (
        <p className="text-gray-500">No projects for this client yet.</p>
      ) : (
        <div className="space-y-6">
          {projectsWithDeliverables.map(({ project, deliverables }) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200"
            >
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
              {deliverables.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">
                  No deliverables yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {d.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {d.kind} ·{" "}
                          {new Date(d.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Link
                        href={`/portal/projects/${project.id}`}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
