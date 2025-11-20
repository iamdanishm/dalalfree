import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PropertiesManagementTable from "../components/PropertiesManagementTable";

export default async function AdminPropertiesPage() {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">Property Management</h1>
        <p className="text-muted mt-2">
          Review and manage property listings. Approve or reject properties for
          the marketplace and monitor listing performance.
        </p>
      </div>

      <PropertiesManagementTable />
    </div>
  );
}
