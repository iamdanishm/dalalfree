"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a seller, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "seller") {
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "partner":
            router.push("/partner");
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

  // If authenticated but not a seller, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "seller"
  ) {
    return null;
  }

  // Sample data for placeholders
  const sellerMetrics = [
    { title: "Active Listings", value: "12", change: "+3", positive: true },
    { title: "Total Views", value: "2,847", change: "+18%", positive: true },
    { title: "Inquiries", value: "45", change: "+5", positive: true },
    { title: "Sold Properties", value: "3", change: "+1", positive: true },
  ];

  const propertyListings = [
    {
      title: "Modern Apartment Downtown",
      price: "$250,000",
      status: "Active",
      views: 425,
      inquiries: 8,
    },
    {
      title: "Family House Suburbs",
      price: "$450,000",
      status: "Active",
      views: 312,
      inquiries: 12,
    },
    {
      title: "Commercial Office Space",
      price: "$750,000",
      status: "Pending",
      views: 189,
      inquiries: 3,
    },
    {
      title: "Luxury Villa",
      price: "$1,200,000",
      status: "Active",
      views: 156,
      inquiries: 15,
    },
  ];

  const kycStatus = {
    status: "Verified",
    completedSteps: 3,
    totalSteps: 4,
    lastUpdate: "Jan 15, 2024",
    nextAction: "Upload tax documents",
  };

  const recentActivity = [
    {
      type: "inquiry",
      description: "New inquiry for Modern Apartment Downtown",
      time: "2 hours ago",
    },
    {
      type: "view",
      description: "Your listing was viewed 15 times today",
      time: "4 hours ago",
    },
    {
      type: "sold",
      description: "Property inquiry marked as sold",
      time: "1 day ago",
    },
    {
      type: "update",
      description: "Property details updated successfully",
      time: "2 days ago",
    },
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
              Seller Dashboard
            </h1>
            <p className="mt-2 text-body">
              Manage your property listings and track performance
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {sellerMetrics.map((metric, index) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Property Listings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-heading">
                  Property Listings
                </h2>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                  Add New Property
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Inquiries
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {propertyListings.map((property, index) => (
                    <tr key={index} className="hover:bg-surface">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-heading">
                          {property.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                        {property.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            property.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                        {property.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                        {property.inquiries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* KYC Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">KYC Status</h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-primary"
                    style={{
                      background: `conic-gradient(#e50914 0deg ${
                        (kycStatus.completedSteps / kycStatus.totalSteps) * 360
                      }deg, #e5e5e5 ${
                        (kycStatus.completedSteps / kycStatus.totalSteps) * 360
                      }deg 360deg)`,
                    }}
                  ></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-heading">
                      {Math.round(
                        (kycStatus.completedSteps / kycStatus.totalSteps) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-heading">
                  {kycStatus.status}
                </h3>
                <p className="text-sm text-muted">
                  {kycStatus.completedSteps} of {kycStatus.totalSteps} steps
                  completed
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-heading mb-2">
                    Required Documents
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Identity Proof",
                      "Address Proof",
                      "Bank Details",
                      "Tax Documents",
                    ].map((doc, index) => (
                      <div key={doc} className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            index < kycStatus.completedSteps
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span
                          className={`text-sm ${
                            index < kycStatus.completedSteps
                              ? "text-green-600"
                              : "text-muted"
                          }`}
                        >
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted mb-2">
                    Last updated: {kycStatus.lastUpdate}
                  </p>
                  <p className="text-sm text-body mb-3">
                    Next action: {kycStatus.nextAction}
                  </p>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90">
                    Complete KYC
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-soft border border-border"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-heading">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "inquiry"
                          ? "bg-blue-500"
                          : activity.type === "view"
                          ? "bg-green-500"
                          : activity.type === "sold"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-body">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted mt-1">{activity.time}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Add Property",
                  icon: "🏠",
                  action: "List new property",
                },
                {
                  title: "Edit Listings",
                  icon: "✏️",
                  action: "Update existing",
                },
                {
                  title: "View Analytics",
                  icon: "📊",
                  action: "Check performance",
                },
                {
                  title: "Manage KYC",
                  icon: "✅",
                  action: "Complete verification",
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
    </div>
  );
}
