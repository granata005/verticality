import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const user = await currentUser();
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  return user.publicMetadata?.role === "admin";
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: admin access required");
  }
}

export async function getClerkUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}
