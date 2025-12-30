import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminAmenitiesPageClient from "./AdminAmenitiesPageClient";

export default async function AdminAmenitiesPage() {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  return <AdminAmenitiesPageClient />;
}
