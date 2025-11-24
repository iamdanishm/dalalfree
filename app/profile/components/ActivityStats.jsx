"use client";

import { FiEye, FiHeart, FiPhone, FiTrendingUp } from "react-icons/fi";

export default function ActivityStats({ user }) {
  // Static data for design purposes - as requested by user
  const staticStats = {
    propertiesViewed: 27,
    contactsRevealed: 8,
    propertiesFavorited: 12,
    totalCreditsUsed: 7,
  };

  const statCards = [
    {
      icon: FiEye,
      label: "Properties Viewed",
      value: staticStats.propertiesViewed,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "This month",
    },
    {
      icon: FiPhone,
      label: "Contacts Revealed",
      value: staticStats.contactsRevealed,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Using credits",
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: staticStats.propertiesFavorited,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Saved properties",
    },
    {
      icon: FiTrendingUp,
      label: "Credits Used",
      value: staticStats.totalCreditsUsed,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "This month",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Activity Overview
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Your recent property search and contact activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} border border-gray-200`}
                >
                  <IconComponent className={stat.color} size={20} />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {stat.label}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center gap-3 p-4 text-left bg-primary/5 hover:bg-primary/10 text-primary rounded-lg border border-primary/20 hover:border-primary/30 transition-colors duration-200">
            <FiHeart size={18} />
            <div>
              <p className="text-sm font-medium">View Favorites</p>
              <p className="text-xs opacity-75">Manage saved properties</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 hover:border-green-300 transition-colors duration-200">
            <FiPhone size={18} />
            <div>
              <p className="text-sm font-medium">Contact History</p>
              <p className="text-xs opacity-75">Properties you've contacted</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
