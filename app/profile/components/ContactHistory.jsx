"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiPhone, FiMail, FiMessageCircle, FiMapPin, FiDollarSign, FiCalendar, FiExternalLink, FiShield } from "react-icons/fi";

export default function ContactHistory({ user, data, onRefresh }) {
  const [contacts, setContacts] = useState(data?.contacts?.contacts || []);
  const [totalCount, setTotalCount] = useState(data?.contacts?.totalCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.contacts) {
      setContacts(data.contacts.contacts || []);
      setTotalCount(data.contacts.totalCount || 0);
    }
  }, [data]);

  const getContactIcon = (contactType) => {
    switch (contactType) {
      case "phone":
        return FiPhone;
      case "email":
        return FiMail;
      case "whatsapp":
        return FiMessageCircle;
      default:
        return FiPhone;
    }
  };

  const formatContactValue = (value, type) => {
    if (!value) return "Contact revealed";

    // For privacy, show masked version in the UI
    switch (type) {
      case "phone":
      case "whatsapp":
        if (value.length <= 4) return value;
        return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);

      case "email":
        const [username, domain] = value.split("@");
        if (!domain) return value;
        const maskedUsername = username.length > 2
          ? username.substring(0, 2) + "*".repeat(username.length - 2)
          : username;
        return `${maskedUsername}@${domain}`;

      default:
        return value;
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Price not set";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <FiPhone size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Contact History
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't revealed any contact information yet. Start exploring properties and connect with sellers when you're ready to make a move.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiExternalLink size={18} />
          Find Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FiShield className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {totalCount} Contact{totalCount !== 1 ? 's' : ''} Revealed
            </h3>
            <p className="text-sm text-gray-600">
              Properties where you've accessed seller contact information
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiShield className="text-blue-600 mt-0.5" size={16} />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Privacy Protection</h4>
            <p className="text-xs text-blue-700">
              Contact information is masked for your privacy. Full contact details are only revealed when you spend credits.
            </p>
          </div>
        </div>
      </div>

      {/* Contact History List */}
      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const property = contact.propertyId;
          if (!property) return null;

          const ContactIcon = getContactIcon(contact.contactType);

          return (
            <motion.div
              key={contact._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Property Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FiPhone size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/property/${property.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {property.title}
                    </h3>
                  </Link>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin size={14} />
                      <span className="truncate">
                        {property.city}, {property.state}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <FiDollarSign size={14} />
                      <span>{formatPrice(property.price)}</span>
                    </div>

                    {/* Property Type */}
                    <div className="text-gray-600">
                      {property.propertyType} • {property.category}
                    </div>

                    {/* Date Contacted */}
                    <div className="flex items-center gap-2 text-gray-500">
                      <FiCalendar size={14} />
                      <span>{formatDate(contact.contactRevealedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-shrink-0">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <ContactIcon className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-900 capitalize">
                        {contact.contactType} Contact
                      </span>
                    </div>
                    <p className="text-sm text-green-800 font-mono">
                      {formatContactValue(contact.contactValue, contact.contactType)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {contact.creditsUsed} credit{contact.creditsUsed !== 1 ? 's' : ''} used
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/property/${property.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <FiExternalLink size={14} />
                    View Property
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Load More or View All */}
      {totalCount > contacts.length && (
        <div className="text-center pt-6">
          <p className="text-gray-600 mb-4">
            Showing {contacts.length} of {totalCount} contacts
          </p>
          <button
            onClick={() => {
              // Could implement pagination here
              console.log("Load more contacts");
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Load More History
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Need More Contact Reveals?</h3>
        <p className="text-gray-600 mb-4">
          Upgrade your subscription for more contact credits and premium features
        </p>
        <Link
          href="#subscription"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <FiExternalLink size={18} />
          Upgrade Subscription
        </Link>
      </div>
    </div>
  );
}