"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import MetricsCard from "../admin/components/layout/MetricsCard";
import SimpleBarChart from "./components/charts/SimpleBarChart";
import StatusDistributionChart from "./components/charts/StatusDistributionChart";

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

  // Static placeholder data for MVP
  const metrics = [
    {
      title: "Total Properties",
      value: "24",
      change: "+2",
      positive: true,
    },
    {
      title: "Sold Properties",
      value: "8",
      change: "+1",
      positive: true,
    },
    {
      title: "Rejected Properties",
      value: "3",
      change: "-1",
      positive: false,
    },
    {
      title: "Total Earnings",
      value: "$45,320",
      change: "+15%",
      positive: true,
    },
  ];

  const monthlyEarningsData = [
    { label: "Oct", value: 3200, prefix: "$" },
    { label: "Nov", value: 4100, prefix: "$" },
    { label: "Dec", value: 3800, prefix: "$" },
    { label: "Jan", value: 4532, prefix: "$" },
  ];

  const statusDistributionData = [
    { label: "Active", value: 15, color: "bg-green-500" },
    { label: "Pending", value: 6, color: "bg-yellow-500" },
    { label: "Sold", value: 8, color: "bg-blue-500" },
    { label: "Rejected", value: 3, color: "bg-red-500" },
  ];

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
            Welcome back, {session?.user?.name || "Partner"}!
          </h1>
          <p className="text-body mt-1">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        role="region"
        aria-label="Key performance indicators"
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
                metric.title === "Total Properties"
                  ? FiMapPin
                  : metric.title === "Sold Properties"
                  ? FiCheckCircle
                  : metric.title === "Rejected Properties"
                  ? FiXCircle
                  : FiDollarSign
              }
              positive={metric.positive}
              color={
                metric.title === "Total Properties"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : metric.title === "Sold Properties"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : metric.title === "Rejected Properties"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-600"
              }
              delay={delay}
            />
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        role="region"
        aria-label="Analytics charts"
      >
        {/* Monthly Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <SimpleBarChart 
            data={monthlyEarningsData} 
            title="Monthly Earnings" 
          />
        </motion.div>

        {/* Status Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          <StatusDistributionChart 
            data={statusDistributionData} 
            title="Property Status Distribution" 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}