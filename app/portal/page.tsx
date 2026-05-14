import { redirect } from "next/navigation";
import { getClerkUserId, isAdmin } from "@/lib/auth";
import { getClientByClerkId } from "@/lib/db";

export default async function PortalPage() {
  const clerkUserId = await getClerkUserId();
  const admin = await isAdmin();

  if (admin) {
    redirect("/admin");
  }

  const client = await getClientByClerkId(clerkUserId);
  if (!client) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Account not configured
        </h1>
        <p className="text-gray-500">
          Your account has not been linked to a client profile yet. Please
          contact your account manager.
        </p>
      </div>
    );
  }

  redirect("/portal/projects");
}
