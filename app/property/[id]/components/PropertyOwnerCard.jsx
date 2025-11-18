import { useSession } from "next-auth/react";
import {
  FiPhone,
  FiMail,
  FiClock,
  FiShield,
  FiUser,
  FiAward,
} from "react-icons/fi";

export default function PropertyOwnerCard() {
  const { status } = useSession();

  // Using the mock data from original file - in production this would be from props or API
  const owner = {
    name: "Rajesh Sharma",
    role: "Verified Owner",
    avatar: "/images/home-lifestyle.png",
    contact: "+91 98765 43210",
    email: "rajesh.sharma@example.com",
    rating: 4.8,
    completedDeals: 25,
    memberSince: "2019",
    response: "Responds within 2 hours",
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
          <FiUser className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Property Owner</h3>
      </div>

      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {owner.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{owner.name}</h4>
          <p className="text-green-600 text-sm font-medium">{owner.role}</p>
          <p className="text-gray-500 text-xs">{owner.response}</p>
        </div>
      </div>

      {/* Owner Stats */}
      <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
        <FiClock className="mx-auto mb-1 text-blue-600" size={18} />
        <div className="text-sm font-medium text-gray-900">
          Member since {owner.memberSince}
        </div>
        <div className="text-xs text-gray-600">{owner.response}</div>
      </div>

      {status === "authenticated" ? (
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <FiPhone className="mr-3 flex-shrink-0" size={16} />
            <span className="text-sm">{owner.contact}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiMail className="mr-3 flex-shrink-0" size={16} />
            <span className="text-sm">{owner.email}</span>
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FiShield className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm text-gray-600">
            Login to view owner contact details
          </p>
        </div>
      )}
    </div>
  );
}
