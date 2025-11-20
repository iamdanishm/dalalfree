import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UsersManagementTable from "../components/UsersManagementTable";

export default async function AdminUsersPage() {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">User Management</h1>
        <p className="text-muted mt-2">
          Manage all users, their roles, and account status from this
          centralized dashboard.
        </p>
      </div>

      <UsersManagementTable />
    </div>
  );
}
