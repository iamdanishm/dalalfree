"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a partner, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "partner") {
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "seller":
            router.push("/seller");
            break;
          case "buyer":
            router.push("/buyer");
            break;
          default:
            // If role is not recognized, redirect to home
            router.push("/");
            break;
        }
      }
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated but not a partner, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "partner"
  ) {
    return null;
  }

  // Sample data for placeholders
  const partnershipMetrics = [
    { title: "Active Partnerships", value: "24", change: "+2", positive: true },
    {
      title: "Total Revenue",
      value: "$45,320",
      change: "+15%",
      positive: true,
    },
    {
      title: "Commission Earned",
      value: "$4,532",
      change: "+12%",
      positive: true,
    },
    { title: "Properties Listed", value: "156", change: "+8", positive: true },
  ];

  const recentPartnerships = [
    {
      name: "Prime Properties LLC",
      type: "Real Estate",
      status: "Active",
      joined: "Jan 2024",
    },
    {
      name: "Urban Developers",
      type: "Development",
      status: "Active",
      joined: "Dec 2023",
    },
    {
      name: "Skyline Realtors",
      type: "Brokerage",
      status: "Pending",
      joined: "Feb 2024",
    },
    {
      name: "Metro Estates",
      type: "Investment",
      status: "Active",
      joined: "Nov 2023",
    },
  ];

  const collaborationProjects = [
    {
      name: "Downtown Complex",
      progress: 75,
      value: "$2.1M",
      deadline: "Mar 2024",
    },
    {
      name: "Riverside Towers",
      progress: 45,
      value: "$3.5M",
      deadline: "Jun 2024",
    },
    {
      name: "Garden Villas",
      progress: 90,
      value: "$1.8M",
      deadline: "Feb 2024",
    },
    {
      name: "Business Park",
      progress: 25,
      value: "$5.2M",
      deadline: "Aug 2024",
    },
  ];

  const monthlyEarnings = [
    { month: "Oct", amount: 3200 },
    { month: "Nov", amount: 4100 },
    { month: "Dec", amount: 3800 },
    { month: "Jan", amount: 4532 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-heading">
              Partner Dashboard
            </h1>
            <p className="mt-2 text-body">
              Manage partnerships, collaborations, and revenue tracking
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Partnership Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {partnershipMetrics.map((metric, index) => (
            <div
              key={metric.title}
              className="bg-white rounded-lg shadow-soft p-6 border border-border"
            >
              <h3 className="text-sm font-medium text-muted">{metric.title}</h3>
              <p className="text-2xl font-bold text-heading mt-2">
                {metric.value}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm font-medium ${
                    metric.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-sm text-muted ml-1">this month</span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Partnerships */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">
                Recent Partnerships
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPartnerships.map((partnership, index) => (
                    <tr key={index} className="hover:bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-heading">
                            {partnership.name}
                          </div>
                          <div className="text-sm text-muted">
                            Joined {partnership.joined}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                        {partnership.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            partnership.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {partnership.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Monthly Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">
                Monthly Earnings
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between h-32">
                {monthlyEarnings.map((data, index) => {
                  const maxAmount = Math.max(
                    ...monthlyEarnings.map((d) => d.amount)
                  );
                  const height = (data.amount / maxAmount) * 100;

                  return (
                    <div
                      key={data.month}
                      className="flex flex-col items-center"
                    >
                      <div
                        className="bg-primary rounded-t"
                        style={{
                          height: `${height}%`,
                          width: "40px",
                        }}
                      ></div>
                      <span className="text-xs text-muted mt-2">
                        {data.month}
                      </span>
                      <span className="text-xs font-medium text-heading">
                        ${data.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Collaboration Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-soft border border-border mb-8"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-heading">
              Active Collaborations
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collaborationProjects.map((project, index) => (
                <div
                  key={project.name}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-heading">{project.name}</h3>
                    <span className="text-sm text-muted">
                      {project.deadline}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-body">Progress</span>
                      <span className="text-sm text-muted">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Project Value</span>
                    <span className="text-sm font-medium text-heading">
                      {project.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-lg shadow-soft border border-border p-6"
        >
          <h2 className="text-lg font-semibold text-heading mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "New Partnership",
                icon: "🤝",
                action: "Invite new partner",
              },
              {
                title: "List Property",
                icon: "🏠",
                action: "Add new property",
              },
              {
                title: "Generate Report",
                icon: "📊",
                action: "Create partnership report",
              },
              {
                title: "Track Commissions",
                icon: "💰",
                action: "View earnings details",
              },
            ].map((action, index) => (
              <button
                key={action.title}
                className="p-4 border border-border rounded-lg hover:bg-surface transition-colors text-left"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-medium text-heading">{action.title}</h3>
                <p className="text-sm text-muted mt-1">{action.action}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
