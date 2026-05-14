import Link from "next/link";
import { getAllClients } from "@/lib/db";

export default async function ClientsPage() {
  const clients = await getAllClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <Link
          href="/admin/upload"
          className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Upload Deliverable
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500">
          No clients yet. Run the seed script or add clients via the API.
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <span className="text-sm text-gray-400">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
