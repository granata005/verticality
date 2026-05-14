import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/portal");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-gray-900">
              Verticality Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/clients"
                className="text-gray-600 hover:text-gray-900"
              >
                Clients
              </Link>
              <Link
                href="/admin/upload"
                className="text-gray-600 hover:text-gray-900"
              >
                Upload
              </Link>
            </nav>
          </div>
          <UserButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
