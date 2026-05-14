import { getAllClients, getProjectsByClientId } from "@/lib/db";
import { UploadForm } from "@/components/portal/UploadForm";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await getAllClients();

  // Pre-load projects for the pre-selected client
  const projects =
    clientId ? await getProjectsByClientId(clientId) : [];

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Upload Deliverable
      </h1>
      <UploadForm clients={clients} initialClientId={clientId} initialProjects={projects} />
    </div>
  );
}
