"use client";
import Image from "next/image";
import { FiMapPin, FiEdit3, FiEye, FiArchive, FiZap, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PartnerPropertyCard({ property, onEdit, onArchive, onBoost }) {
    const router = useRouter();

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getCommissionStatusColor = (paid) => {
        return paid
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border group overflow-hidden"
        >
            {/* Property Image & Status Badges */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={property.images?.[0]?.url || "/images/home-lifestyle.png"}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getStatusColor(property.status)}`}>
                        {property.status}
                    </span>
                    {property.verified && (
                        <span className="bg-blue-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <FiZap className="fill-current" /> Verified
                        </span>
                    )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={() => router.push(`/property/${property.slug}`)}
                        className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-lg backdrop-blur-sm transition-colors"
                        title="View Public Listing"
                    >
                        <FiEye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(property)}
                        className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-lg shadow-lg backdrop-blur-sm transition-colors"
                        title="Edit Property"
                    >
                        <FiEdit3 size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                    </h3>
                    <p className="font-bold text-primary whitespace-nowrap ml-2">
                        {formatCurrency(property.price)}
                    </p>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FiMapPin className="mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.location || `${property.city}, ${property.state}`}</span>
                </div>

                {/* Commission Box */}
                <div className="bg-surface/50 rounded-xl p-3 border border-border/50 mb-5 relative overflow-hidden group/comm">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Commission</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCommissionStatusColor(property.commissionPaid)}`}>
                            {property.commissionPaid ? 'PAID' : 'PENDING'}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-emerald-600">{formatCurrency(property.partnerCommission)}</span>
                        <span className="text-[10px] text-gray-400 font-medium">(90% Share)</span>
                    </div>
                    <FiDollarSign className="absolute -right-2 -bottom-2 text-emerald-500/10 w-12 h-12 rotate-12 transition-transform group-hover/comm:scale-125" />
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onBoost(property)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-sm"
                    >
                        <FiZap className="text-yellow-400" /> Boost
                    </button>
                    <button
                        onClick={() => onArchive(property)}
                        className="px-3 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                        title="Archive Property"
                    >
                        <FiArchive size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
