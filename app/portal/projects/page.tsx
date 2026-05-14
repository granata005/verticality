import { redirect } from "next/navigation";
import Link from "next/link";
import { getClerkUserId } from "@/lib/auth";
import { getClientByClerkId, getProjectsByClientId } from "@/lib/db";

export default async function ProjectsPage() {
  const clerkUserId = await getClerkUserId();
  const client = await getClientByClerkId(clerkUserId);

  if (!client) {
    redirect("/portal");
  }

  const projects = await getProjectsByClientId(client.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Your Projects
      </h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects yet. Your account manager will add them here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portal/projects/${project.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 transition-colors"
            >
              <h2 className="font-medium text-gray-900">{project.name}</h2>
              {project.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {project.description}
                </p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                Created{" "}
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
