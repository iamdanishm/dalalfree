"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
  FiDollarSign,
  FiClock,
  FiEye,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import MetricsCard from "./components/MetricsCard";
import RecentPropertiesChart from "./components/RecentPropertiesChart";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for real data
  const [metrics, setMetrics] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [propertyStats, setPropertyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch user analytics
      const userAnalyticsRes = await fetch("/api/admin/users/analytics");
      const userAnalytics = await userAnalyticsRes.json();

      // Fetch recent users
      const usersRes = await fetch("/api/admin/users?page=1&limit=10");
      const usersData = await usersRes.json();

      // Transform data for UI
      const transformedMetrics = [
        {
          title: "Total Users",
          value:
            userAnalytics.detailedStats?.totals?.totalUsers?.toString() || "0",
          change: "+12%",
          positive: true,
        },
        {
          title: "Active Properties",
          value:
            userAnalytics.metrics?.find((m) => m.title === "Active Properties")
              ?.value || "0",
          change: "+8%",
          positive: true,
        },
        {
          title: "Pending KYC",
          value:
            userAnalytics.metrics?.find((m) => m.title === "Pending KYC")
              ?.value || "0",
          change: "-5%",
          positive: false,
        },
        {
          title: "Monthly Revenue",
          value:
            userAnalytics.metrics?.find((m) => m.title === "Monthly Revenue")
              ?.value || "$0",
          change: "+18%",
          positive: true,
        },
      ];

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
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

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
          case "user":
            router.push("/user");
            break;
          default:
            router.push("/");
            break;
        }
      }
    }

    // Fetch data once authenticated as admin
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchDashboardData();
    }
  }, [status, session, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
            <div className="text-body">Loading dashboard data...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="text-red-600 text-lg mb-2">
              Error loading dashboard
            </div>
            <div className="text-muted">{error}</div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-heading">
            Welcome back, {session?.user?.name || "Admin"}!
          </h1>
          <p className="text-body mt-1">
            Here's what's happening with your platform today.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center space-x-3 mt-4 sm:mt-0"
        >
          <motion.div
            className="flex items-center space-x-2 text-sm text-muted"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
            </span>
          </motion.div>
          <motion.button
            onClick={() => fetchDashboardData()}
            className="inline-flex items-center px-4 py-2 border border-border rounded-lg text-sm font-medium text-heading bg-white hover:bg-surface transition-all duration-200"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.6,
          ease: "easeOut",
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{
              opacity: 0,
              y: 20,
              rotateY: -10,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotateY: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.6 + index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -8,
              transition: {
                duration: 0.2,
                type: "spring",
                stiffness: 300,
              },
            }}
            className="transform-gpu"
          >
            <MetricsCard
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
                  : "bg-gradient-to-r from-purple-500 to-pink-600"
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Properties & Users Section - Side by side on large screens */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.8,
          duration: 0.6,
          ease: "easeOut",
        }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {/* Recent Properties Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 1.0,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <RecentPropertiesChart />
        </motion.div>

        {/* Recent Users Table */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 1.2,
            duration: 0.5,
            ease: "easeOut",
          }}
          className="bg-white rounded-xl shadow-soft border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-lg font-semibold text-heading flex items-center"
            >
              <FiUsers className="w-5 h-5 mr-2 text-primary" />
              Recent Users
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View all
            </motion.button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentUsers.slice(0, 5).map((user, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 1.6 + index * 0.05,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transition: { duration: 0.15 },
                    }}
                    className="cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </motion.div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-heading">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 1.8 + index * 0.05,
                          type: "spring",
                          stiffness: 300,
                        }}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary hover:text-primary/80">
                      <motion.button
                        whileHover={{ scale: 1.1, color: "#d1080f" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="flex items-center"
                      >
                        <FiEye className="w-4 h-4 mr-1" />
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 2.0,
          duration: 0.6,
          ease: "easeOut",
        }}
        className="bg-gradient-to-r from-surface to-surface/80 rounded-xl shadow-soft border border-border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="text-lg font-semibold text-heading flex items-center"
          >
            <FiActivity className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.3, type: "spring" }}
          >
            <FiClock className="w-5 h-5 text-muted" />
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Add User",
              icon: FiUsers,
              action: "Create new user account",
              color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
            },
            {
              title: "Property Review",
              icon: FiMapPin,
              action: "Review pending properties",
              color: "bg-green-50 text-green-600 hover:bg-green-100",
            },
            {
              title: "KYC Approval",
              icon: FiCheckCircle,
              action: "Process KYC applications",
              color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
            },
            {
              title: "Generate Report",
              icon: FiTrendingUp,
              action: "Create platform report",
              color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
            },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 2.4 + index * 0.1,
                duration: 0.4,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`p-4 rounded-xl border border-border/50 transition-all text-left group ${action.color}`}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-6 h-6 mb-2"
              >
                <action.icon />
              </motion.div>
              <h3 className="font-semibold text-heading text-sm">
                {action.title}
              </h3>
              <p className="text-xs opacity-80 mt-1">{action.action}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
