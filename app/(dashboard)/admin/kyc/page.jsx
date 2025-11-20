import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import KycManagementTable from "../components/KycManagementTable";

export default async function AdminKycPage() {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">KYC Management</h1>
        <p className="text-muted mt-2">
          Review and approve KYC applications from users and partners on the
          platform. Ensure compliance and verify user identities.
        </p>
      </div>

      <KycManagementTable />
    </div>
  );
}
