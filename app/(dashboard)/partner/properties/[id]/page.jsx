"use client";
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    FiMapPin,
    FiCalendar,
    FiUser,
    FiPhone,
    FiMail,
    FiArrowLeft,
    FiExternalLink,
    FiDollarSign,
    FiActivity
} from "react-icons/fi";
import { useToast } from "@/app/lib/hooks/useToast";
import { formatPrice } from "@/app/lib/propertyHelpers";


export default function PartnerPropertyDetailPage({ params }) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error } = useToast();

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Property Details (Use Partner API to get commission data)
            const propRes = await fetch(`/api/partner/properties/${id}`);
            const propData = await propRes.json();

            if (propData.success) {
                setProperty(propData.property);
            } else {
                error("Failed to load property details");
                return;
            }

            // 2. Fetch Leads
            const leadsRes = await fetch(`/api/partner/properties/${id}/leads`);
            const leadsData = await leadsRes.json();

            if (leadsData.success) {
                setLeads(leadsData.leads);
            }

        } catch (err) {
            console.error(err);
            error("An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Property not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Back & Header */}
            <div>
                <button
                    onClick={() => router.push('/partner/properties')}
                    className="flex items-center text-gray-500 hover:text-primary transition-colors mb-4 gap-2 font-medium"
                >
                    <FiArrowLeft /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                        <Image
                            src={property.images?.[0]?.url || "/images/home-lifestyle.png"}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {property.status}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <FiMapPin className="mr-1" />
                                    {property.location || `${property.city}, ${property.state}`}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{formatPrice(property.price)}</div>
                                <div className="text-sm text-gray-500">Listed Price</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-medium mb-1">Commission</div>
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(property.partnerCommission)}</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="text-sm text-purple-600 font-medium mb-1">Total Leads</div>
                                <div className="text-lg font-bold text-gray-900">{leads.length}</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                <div className="text-sm text-green-600 font-medium mb-1">Status</div>
                                <div className="text-lg font-bold capitalize text-gray-900">{property.status}</div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => router.push(`/property/${property.slug}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                            >
                                <FiExternalLink /> View Public Page
                            </button>
                            <button
                                onClick={() => router.push(`/partner/properties/edit/${property.slug}`)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Edit Property
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Interested Leads</h2>
                        <p className="text-gray-500 text-sm mt-1">People who have revealed your contact details for this property.</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                        {leads.length} Leads
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Revealed</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                                    {lead.userId?.name?.[0]?.toUpperCase() || <FiUser />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{lead.userId?.name || "Unknown User"}</div>
                                                    <div className="text-xs text-gray-500">Lead ID: {lead._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <FiPhone className="text-gray-400" size={14} />
                                                    {lead.userId?.phone || "N/A"}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <FiMail className="text-gray-400" size={14} />
                                                    {lead.userId?.email || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400" />
                                                {formatDate(lead.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`tel:${lead.userId?.phone}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                <FiPhone size={12} /> Call Now
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FiUser className="text-gray-300 text-2xl" />
                                        </div>
                                        <p className="font-medium">No leads yet</p>
                                        <p className="text-sm opacity-70">When users reveal your contact info, they will appear here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
