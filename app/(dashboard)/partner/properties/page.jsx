"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiFilter, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import PartnerPropertyCard from "../components/PartnerPropertyCard";

export default function PartnerPropertiesPage() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        totalEarnings: 0
    });

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/partner/properties${filter !== 'all' ? `?status=${filter}` : ''}`);
            const data = await res.json();
            if (data.success) {
                setProperties(data.properties);

                // Calculate stats
                const newStats = data.properties.reduce((acc, prop) => {
                    acc.total++;
                    if (prop.status === 'approved') acc.approved++;
                    if (prop.status === 'pending') acc.pending++;
                    if (prop.commissionPaid) acc.totalEarnings += prop.partnerCommission;
                    return acc;
                }, { total: 0, approved: 0, pending: 0, totalEarnings: 0 });

                setStats(newStats);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [filter]);

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-border shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-heading tracking-tight">My Properties</h1>
                    <p className="text-body mt-2 font-medium opacity-70">
                        Manage your listings and track your commissions.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 relative z-10">
                    {/* Quick Stats in Header */}
                    <div className="flex gap-4 px-4 py-2 bg-surface rounded-2xl border border-border/50 mr-4 hidden lg:flex">
                        <div className="text-center px-4 border-r border-border/50">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                            <p className="text-lg font-bold text-heading">{stats.total}</p>
                        </div>
                        <div className="text-center px-4 border-r border-border/50">
                            <p className="text-[10px] uppercase font-bold text-green-500">Approved</p>
                            <p className="text-lg font-bold text-heading">{stats.approved}</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-[10px] uppercase font-bold text-emerald-500">Earned</p>
                            <p className="text-lg font-bold text-heading">₹{(stats.totalEarnings / 1000).toFixed(1)}k</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/partner/properties/create'}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span>List New Property</span>
                    </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 p-2 rounded-2xl border border-border/40 backdrop-blur-md">
                <div className="flex bg-white p-1 rounded-xl shadow-inner border border-border w-full lg:w-auto">
                    {['all', 'approved', 'pending', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === s
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-surface'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchProperties}
                        disabled={loading}
                        className="p-3 bg-white rounded-xl border border-border hover:bg-surface transition-colors text-gray-600 disabled:opacity-50"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-border/50" />
                    ))}
                </div>
            ) : filteredProperties.length > 0 ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {filteredProperties.map((property) => (
                            <PartnerPropertyCard
                                key={property._id}
                                property={property}
                                onEdit={(p) => window.location.href = `/partner/properties/edit/${p._id}`}
                                onArchive={(p) => alert(`Archive logic for ${p.title}`)}
                                onBoost={(p) => alert(`Boost logic for ${p.title}`)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-border p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                        <FiAlertCircle size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-heading">No Properties Found</h3>
                    <p className="text-body mt-2 max-w-md mx-auto">
                        {searchQuery
                            ? `No properties match your search "${searchQuery}". Try a different term or clear the search.`
                            : filter !== 'all'
                                ? `You don't have any properties with status "${filter}".`
                                : "You haven't listed any properties yet. Start earning 90% commission by listing your first property today!"}
                    </p>
                    {!searchQuery && filter === 'all' && (
                        <button
                            onClick={() => window.location.href = '/partner/properties/create'}
                            className="mt-8 bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20"
                        >
                            List First Property
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
