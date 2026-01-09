"use client";

import { motion } from "framer-motion";
import {
  FiUser,
  FiHome,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";

export default function ActivityTimeline() {
  // Mock activity data - replace with real API data
  const activities = [
    {
      id: 1,
      type: "user_joined",
      title: "New user registration",
      description: "Sarah Johnson joined the platform",
      time: "2 minutes ago",
      icon: FiUser,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      type: "property_approved",
      title: "Property approved",
      description: "Downtown Apartment Complex listing approved",
      time: "15 minutes ago",
      icon: FiCheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      id: 3,
      type: "kyc_pending",
      title: "KYC awaiting review",
      description: "Mike Chen submitted KYC documents",
      time: "32 minutes ago",
      icon: FiAlertTriangle,
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: 4,
      type: "revenue_increase",
      title: "Revenue milestone",
      description: "Monthly revenue exceeded $50k target",
      time: "1 hour ago",
      icon: FiTrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: 5,
      type: "property_submitted",
      title: "New property listing",
      description: "Commercial Office Space submitted for review",
      time: "2 hours ago",
      icon: FiHome,
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: 6,
      type: "system_maintenance",
      title: "Scheduled maintenance",
      description: "System maintenance completed successfully",
      time: "4 hours ago",
      icon: FiClock,
      color: "bg-gray-50 text-gray-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-heading flex items-center">
          <FiClock className="w-5 h-5 mr-2 text-primary" />
          Recent Activity
        </h2>
        <p className="text-sm text-muted mt-1">Platform activity timeline</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-surface/50 transition-colors cursor-pointer group"
            >
              {/* Activity icon */}
              <div
                className={`flex-shrink-0 p-2 rounded-lg ${activity.color} group-hover:scale-110 transition-transform`}
              >
                <activity.icon className="w-4 h-4" />
              </div>

              {/* Activity details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-heading group-hover:text-primary transition-colors">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-muted ml-2">
                    {activity.time}
                  </span>
                </div>
                <p className="text-sm text-muted mt-1">
                  {activity.description}
                </p>
              </div>

              {/* Timeline connector */}
              {index < activities.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-px h-8 bg-border"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                  <div className="w-px h-8 bg-border"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-4 border-t border-border text-center"
        >
          <button className="text-sm text-primary hover:text-primary/80 font-medium px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
            View all activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}
