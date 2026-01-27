"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiTrendingUp,
    FiPieChart,
    FiArrowUpRight,
    FiChevronRight,
    FiCreditCard
} from "react-icons/fi";

export default function PartnerEarningsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, historyRes] = await Promise.all([
                    fetch("/api/partner/earnings"),
                    fetch("/api/partner/earnings/history")
                ]);

                const summaryData = await summaryRes.json();
                const historyData = await historyRes.json();

                if (summaryData.success) setData(summaryData);
                if (historyData.success) setHistory(historyData.history);
            } catch (error) {
                console.error("Failed to fetch earnings data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }

    const summary = data?.summary || {
        totalEarnings: 0,
        withdrawnAmount: 0,
        pendingWithdrawals: 0,
        availableBalance: 0,
        pendingCommission: 0
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header & Balance Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col justify-between p-10 bg-gray-900 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-gray-200">
                    <div className="relative z-10">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                        <h1 className="text-6xl font-black tracking-tight mb-8">
                            {formatCurrency(summary.availableBalance)}
                        </h1>

                        <div className="flex gap-8">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Earned</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.totalEarnings)}</p>
                            </div>
                            <div className="w-px h-10 bg-gray-800" />
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="font-bold">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex gap-4 relative z-10">
                        <button
                            className="flex-1 bg-white text-gray-900 px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-white/10"
                            onClick={() => alert("Withdrawal system is currently on hold.")}
                        >
                            <FiCreditCard size={20} />
                            Withdraw Funds
                        </button>
                        <button className="px-6 py-4 bg-gray-800 rounded-2xl font-bold hover:bg-gray-700 transition-all border border-gray-700">
                            View Tax Report
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <FiDollarSign className="absolute bottom-[-10%] right-[-5%] text-white/5 w-64 h-64 -rotate-12 pointer-events-none" />
                </div>

                {/* Secondary Stats */}
                <div className="space-y-4">
                    <div className="p-8 bg-white rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                <FiClock size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Release</p>
                                <p className="text-2xl font-black text-heading">{formatCurrency(summary.pendingCommission)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Commissions from approved deals waiting for final payout.
                        </p>
                    </div>

                    <div className="p-8 bg-white rounded-[2rem] border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                                <FiTrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Commission Rate</p>
                                <p className="text-2xl font-black text-heading">90%</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Your current partnership tier commission share.
                        </p>
                    </div>

                    <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                <FiCheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-emerald-800/60 text-xs font-bold uppercase tracking-wider">Withdrawn</p>
                                <p className="text-2xl font-black text-emerald-900">{formatCurrency(summary.withdrawnAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Earnings History Table */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-border shadow-sm flex flex-col">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                        <h2 className="text-xl font-black text-heading flex items-center gap-3">
                            <FiClock className="text-primary" />
                            Earnings History
                        </h2>
                        <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                            Export CSV <FiChevronRight />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {history.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4">Source Property</th>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Price</th>
                                        <th className="px-8 py-4">Commission</th>
                                        <th className="px-8 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map((item, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-surface/40 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-heading text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">TXN: {item.commissionTransactionId || 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-600 font-medium whitespace-nowrap">
                                                {new Date(item.commissionPaidDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-600 font-bold whitespace-nowrap">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-black text-emerald-600">
                                                    {formatCurrency(item.partnerCommission)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black w-fit border border-emerald-100 uppercase">
                                                    <FiCheckCircle size={12} />
                                                    Settled
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center">
                                <FiPieChart size={48} className="text-gray-200 mb-4" />
                                <h3 className="font-bold text-gray-400">No earnings history yet</h3>
                                <p className="text-sm text-gray-300">Your settled commissions will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Breakdown / Info Sidebar */}
                <div className="space-y-8">
                    {/* Policy Info */}
                    <div className="p-8 bg-gradient-to-br from-indigo-500 to-primary rounded-[2.5rem] text-white shadow-xl shadow-primary/10">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <FiArrowUpRight size={24} />
                            Payout Policy
                        </h3>
                        <ul className="space-y-4 text-sm font-medium text-white/80">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0" />
                                <span>90/10 commission split on all property sales.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0" />
                                <span>Minimum withdrawal amount is ₹100.</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0" />
                                <span>Payouts are processed by admin within 24-48 hours.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Performance Summary snippet */}
                    <div className="p-8 bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden relative group">
                        <h3 className="font-black text-heading mb-6">Performance Snapshot</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-gray-400 uppercase">Settled Deals</span>
                                    <span className="text-primary">{history.length}</span>
                                </div>
                                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((history.length / 20) * 100, 100)}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-gray-400 uppercase">Growth</span>
                                    <span className="text-emerald-500">+12.5%</span>
                                </div>
                                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "65%" }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <FiTrendingUp size={120} className="absolute bottom-[-20px] right-[-20px] text-gray-50 group-hover:text-primary/5 transition-colors duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
