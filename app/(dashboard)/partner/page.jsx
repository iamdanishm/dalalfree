"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiTrendingUp,
  FiPlus
} from "react-icons/fi";
import MetricsCard from "../admin/components/layout/MetricsCard";

import PropertyStatusChart from "./components/charts/PropertyStatusChart";

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProperties: 0,
    approvedProperties: 0,
    rejectedProperties: 0,
    totalEarnings: 0,
    availableBalance: 0,
    recentEarnings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const [propsRes, earningsRes] = await Promise.all([
          fetch("/api/partner/properties"),
          fetch("/api/partner/earnings")
        ]);

        const propsData = await propsRes.json();
        const earningsData = await earningsRes.json();

        if (propsData.success && earningsData.success) {
          const properties = propsData.properties;
          setStats({
            totalProperties: properties.length,
            approvedProperties: properties.filter(p => p.status === 'approved').length,
            rejectedProperties: properties.filter(p => p.status === 'rejected').length,
            totalEarnings: earningsData.summary.totalEarnings,
            availableBalance: earningsData.summary.availableBalance,
            recentEarnings: earningsData.recentEarnings || []
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "partner") {
      fetchStats();
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const metrics = [
    {
      title: "Total Properties",
      value: stats.totalProperties.toString(),
      icon: FiMapPin,
      color: "bg-blue-500",
      href: "/partner/properties"
    },
    {
      title: "Approved Listings",
      value: stats.approvedProperties.toString(),
      icon: FiCheckCircle,
      color: "bg-green-500",
      href: "/partner/properties?status=approved"
    },
    {
      title: "Rejected Listings",
      value: stats.rejectedProperties.toString(),
      icon: FiXCircle,
      color: "bg-red-500",
      href: "/partner/properties?status=rejected"
    },
    /* {
      title: "Available Balance",
      value: formatCurrency(stats.availableBalance),
      icon: FiDollarSign,
      color: "bg-emerald-500",
      href: "/partner/earnings"
    }, */
  ];

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">
            Dashboard
          </h1>
          <p className="text-body mt-1 font-medium opacity-60">
            Welcome back, {session?.user?.name.split(' ')[0] || "Partner"}. Here is your performance overview.
          </p>
        </div>
        <button
          onClick={() => router.push('/partner/properties/create')}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <FiPlus size={20} />
          New Listing
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(metric.href)}
            className="group cursor-pointer"
          >
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className={`w-12 h-12 ${metric.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon size={24} />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{metric.title}</p>
              <h3 className="text-2xl font-black text-heading">{metric.value}</h3>

              <FiArrowRight className="absolute bottom-6 right-6 text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Status Chart */}
        <div className="lg:col-span-2">
          <PropertyStatusChart stats={stats} />
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <div className="bg-surface p-8 rounded-[2.5rem] border border-border/50">
            <h3 className="font-black text-heading mb-4">Quick Tip</h3>
            <p className="text-sm text-gray-500 leading-relaxed italic">
              "Verified properties get 3x more views and tend to sell 40% faster. Make sure to upload clear KYC documents for all your listings."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}