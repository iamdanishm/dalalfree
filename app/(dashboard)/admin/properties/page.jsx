import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminPropertiesPageClient from "./AdminPropertiesPageClient";

export default async function AdminPropertiesPage() {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  return <AdminPropertiesPageClient />;
}
