"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiClock,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import MetricsCard from "./components/layout/MetricsCard";
import RecentPropertiesChart from "./components/analytics/RecentPropertiesChart";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for real data
  const [metrics, setMetrics] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [propertyData, setPropertyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Fetch user analytics
      const userAnalyticsRes = await fetch("/api/admin/properties/analytics");
      const userAnalytics = await userAnalyticsRes.json();

      // Fetch recent users
      const usersRes = await fetch("/api/admin/users?page=1&limit=10");
      const usersData = await usersRes.json();

      // Fetch property chart data
      const propertyChartRes = await fetch("/api/properties/daily-chart");
      const propertyChartData = await propertyChartRes.json();

      // Use real metrics from API (now with dynamic growth calculations)
      const transformedMetrics = userAnalytics.metrics || [];

      const transformedUsers = (usersData.users || [])
        .slice(0, 5)
        .map((user) => ({
          name: user.name,
          email: user.email,
          role:
            user.role === "user"
              ? "Buyer"
              : user.role === "partner"
              ? "Partner"
              : user.role === "admin"
              ? "Admin"
              : user.role,
          status:
            user.accountStatus.charAt(0).toUpperCase() +
            user.accountStatus.slice(1),
        }));

      setMetrics(transformedMetrics);
      setRecentUsers(transformedUsers);
      setPropertyData(propertyChartData.data || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  }, []);

  // Handle authentication and role checking
  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check role
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "admin") {
        switch (userRole) {
          case "partner":
            router.push("/partner");
            break;
          case "user":
            router.push("/user");
            break;
          default:
            router.push("/");
            break;
        }
      }
    }
  }, [status, session, router]);

  // Fetch data when authenticated as admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboardData();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [status, session, fetchDashboardData]);

  // Loading states
  if (status === "loading" || loading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-heading">
              Welcome back, {session?.user?.name || "Admin"}!
            </h1>
            <p className="text-body mt-1">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>
        </div>

        {/* Loading Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-soft border border-border p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-surface rounded-xl animate-pulse"></div>
                <div className="text-sm text-muted animate-pulse">+0.0%</div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-surface rounded animate-pulse"></div>
                <div className="h-8 bg-surface rounded animate-pulse w-3/4"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-soft border border-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
            >
              <div className="p-6 border-b border-border">
                <div className="h-6 bg-surface rounded animate-pulse w-1/3"></div>
              </div>
              <div className="p-6">
                <div className="h-64 bg-surface rounded animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Loading Spinner */}
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-lg border border-border p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-body font-medium">
              Loading dashboard data&hellip;
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "admin"
  ) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <div>
          <div className="text-red-600 text-lg mb-2">
            Error loading dashboard
          </div>
          <div className="text-muted">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">
            Welcome back, {session?.user?.name || "Admin"}!
          </h1>
          <p className="text-body mt-1">
            Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted">
            <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
            </span>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center justify-center px-3 sm:px-4 py-2 border border-border rounded-lg text-sm font-medium text-heading bg-white hover:bg-surface transition-colors duration-200 whitespace-nowrap"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {metrics.map((metric, index) => {
          const delay = 0.1 * index;
          return (
            <MetricsCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={
                metric.title === "Total Users"
                  ? FiUsers
                  : metric.title === "Active Properties"
                  ? FiMapPin
                  : metric.title === "Pending KYC"
                  ? FiCheckCircle
                  : metric.title === "Rejected Today"
                  ? FiXCircle
                  : FiDollarSign
              }
              positive={metric.positive}
              color={
                metric.title === "Total Users"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : metric.title === "Active Properties"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : metric.title === "Pending KYC"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600"
                  : metric.title === "Rejected Today"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-600"
              }
              delay={delay}
            />
          );
        })}
      </motion.div>

      {/* Charts and Tables */}
      <motion.div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Property Chart with Real Data */}
        <motion.div>
          <RecentPropertiesChart propertyData={propertyData} />
        </motion.div>

        {/* Recent Users Table */}
        <div className="bg-white rounded-xl shadow-soft border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-heading flex items-center">
              <FiUsers className="w-5 h-5 mr-2 text-primary" />
              Recent Users
            </h2>
            <button
              onClick={() => router.push("/admin/users")}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 cursor-pointer"
            >
              View all →
            </button>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-heading">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">{user.role}</td>
                    <td className="px-6 py-4">
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
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="bg-linear-to-r from-surface to-surface/80 rounded-xl shadow-soft border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-heading flex items-center">
            <FiActivity className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Add User",
              icon: FiUsers,
              action: "Create new user account",
            },
            {
              title: "Property Review",
              icon: FiMapPin,
              action: "Review pending properties",
            },
            {
              title: "KYC Approval",
              icon: FiCheckCircle,
              action: "Process KYC applications",
            },
            {
              title: "Generate Report",
              icon: FiTrendingUp,
              action: "Create platform report",
            },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              className={`p-4 rounded-xl border border-border/50 text-left hover:bg-surface/50`}
            >
              <div className="w-6 h-6 mb-2">
                <action.icon />
              </div>
              <h3 className="font-semibold text-heading text-sm">
                {action.title}
              </h3>
              <p className="text-xs text-muted mt-1">{action.action}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
