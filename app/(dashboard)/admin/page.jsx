"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not an admin, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "admin") {
        switch (userRole) {
          case "partner":
            router.push("/partner");
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

  // If authenticated but not an admin, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "admin"
  ) {
    return null;
  }

  // Sample data for placeholders
  const metrics = [
    { title: "Total Users", value: "2,847", change: "+12%", positive: true },
    {
      title: "Active Properties",
      value: "1,234",
      change: "+8%",
      positive: true,
    },
    { title: "Pending KYC", value: "45", change: "-5%", positive: false },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+18%",
      positive: true,
    },
  ];

  const recentUsers = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "Buyer",
      status: "Active",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Seller",
      status: "Pending",
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Partner",
      status: "Active",
    },
    {
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "Seller",
      status: "Active",
    },
  ];

  const propertyStats = [
    { type: "Residential", count: 856, percentage: 65 },
    { type: "Commercial", count: 234, percentage: 18 },
    { type: "Industrial", count: 89, percentage: 7 },
    { type: "Land", count: 135, percentage: 10 },
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
            <h1 className="text-3xl font-bold text-heading">Admin Dashboard</h1>
            <p className="mt-2 text-body">
              Manage users, properties, and platform analytics
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, index) => (
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
                <span className="text-sm text-muted ml-1">from last month</span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">
                Recent Users
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-heading">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Property Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">
                Property Distribution
              </h2>
            </div>
            <div className="p-6">
              {propertyStats.map((stat, index) => (
                <div key={stat.type} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-body">
                      {stat.type}
                    </span>
                    <span className="text-sm text-muted">{stat.count}</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-soft border border-border p-6"
        >
          <h2 className="text-lg font-semibold text-heading mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Add User",
                icon: "👤",
                action: "Create new user account",
              },
              {
                title: "Property Review",
                icon: "🏠",
                action: "Review pending properties",
              },
              {
                title: "KYC Approval",
                icon: "✅",
                action: "Process KYC applications",
              },
              {
                title: "Generate Report",
                icon: "📊",
                action: "Create platform report",
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
