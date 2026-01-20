"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiPhone,
  FiMail,
  FiClock,
  FiShield,
  FiUser,
  FiAward,
  FiPlay,
  FiCreditCard,
  FiStar,
  FiLock,
} from "react-icons/fi";
import ContactRevealModal from "./ContactRevealModal";

export default function PropertyOwnerCard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealMethod, setRevealMethod] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/users/profile");
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else if (status !== "loading") {
        setLoading(false);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [status]);

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

  const calculateTrialDaysLeft = () => {
    if (!userProfile?.freeTrialEndDate) return 0;
    const now = new Date();
    const endDate = new Date(userProfile.freeTrialEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const trialDaysLeft = calculateTrialDaysLeft();

  const handleContactReveal = (method) => {
    // For free users, show the reveal modal
    if (method !== "schedule_visit") {
      setRevealMethod(method);
      setShowRevealModal(true);
    } else {
      // Handle schedule visit - placeholder
      console.log("Schedule visit clicked");
    }
  };

  const handleRevealSuccess = (method) => {
    // Handle successful contact reveal - update state, deduct credits, etc.
    console.log(`Successfully revealed contact via: ${method}`);
    setShowRevealModal(false);
    setRevealMethod(null);

    // In production:
    // 1. Deduct credits if applicable
    // 2. Update user profile state
    // 3. Call contact reveal API
    // 4. Show contact details
  };

  const handleStartTrial = () => {
    router.push("/profile");
  };

  const getSubscriptionUI = () => {
    if (loading) {
      return (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      );
    }

    if (status !== "authenticated") {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FiShield className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm text-gray-600 mb-3">
            Login to view contact details
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </div>
      );
    }

    const subscriptionStatus = userProfile?.subscriptionStatus || "none";

    // Free Trial Users - Full Access
    if (subscriptionStatus === "free_trial") {
      return (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <FiStar size={12} />
              Trial Active: {trialDaysLeft} days left
            </div>
            <button
              onClick={() => handleContactReveal("schedule_visit")}
              className="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Schedule Visit
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <FiPhone
                className="mr-3 flex-shrink-0 text-green-600"
                size={16}
              />
              <span className="text-sm font-medium">{owner.contact}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FiMail className="mr-3 flex-shrink-0 text-green-600" size={16} />
              <span className="text-sm font-medium">{owner.email}</span>
            </div>
          </div>
        </>
      );
    }

    // Paid Users - Premium Access
    if (subscriptionStatus === "active") {
      return (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-medium">
              <FiAward size={12} />
              Premium Member
            </div>
            <button
              onClick={() => handleContactReveal("schedule_visit")}
              className="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Schedule Visit
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <FiPhone className="mr-3 flex-shrink-0 text-primary" size={16} />
              <span className="text-sm font-medium">{owner.contact}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FiMail className="mr-3 flex-shrink-0 text-primary" size={16} />
              <span className="text-sm font-medium">{owner.email}</span>
            </div>
          </div>
        </>
      );
    }

    // Expired Users
    if (subscriptionStatus === "expired") {
      return (
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <FiClock className="mx-auto mb-2 text-orange-500" size={24} />
          <p className="text-sm text-orange-800 font-medium mb-2">
            Access Expired
          </p>
          <p className="text-xs text-orange-600 mb-4">
            Renew your subscription to contact owners
          </p>
          <button
            onClick={handleStartTrial}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors w-full"
          >
            <FiCreditCard className="inline mr-1" size={14} />
            Renew Access
          </button>
        </div>
      );
    }

    // Free Users - No Subscription
    return (
      <>
        {/* Blurred Contact Preview */}
        <div className="relative mb-4">
          <div className="space-y-3 filter blur-sm">
            <div className="flex items-center text-gray-300">
              <FiPhone className="mr-3 flex-shrink-0" size={16} />
              <span className="text-sm">XXX XXX XXXX</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FiMail className="mr-3 flex-shrink-0" size={16} />
              <span className="text-sm">owner@example.com</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiLock className="text-gray-400 text-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Watch Ad Option */}
          <button
            onClick={() => handleContactReveal("ad_watch")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
          >
            <FiPlay size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Watch Ad (1 credit)</div>
              <div className="text-xs opacity-75">Reveal contact instantly</div>
            </div>
          </button>

          {/* Buy Package Option */}
          <button
            onClick={() => handleContactReveal("purchase")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
          >
            <FiCreditCard size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">₹200 - 30 contacts</div>
              <div className="text-xs opacity-75">Lifetime access</div>
            </div>
          </button>

          {/* Free Trial Option */}
          <button
            onClick={handleStartTrial}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200"
          >
            <FiAward size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Start Free Trial</div>
              <div className="text-xs opacity-75">30 days unlimited</div>
            </div>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-linear-to-r from-green-100 to-blue-100 rounded-lg">
          <FiUser className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Property Owner</h3>
      </div>

      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mr-4 flex items-center justify-center">
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

      {/* Subscription-Based Contact Logic */}
      {getSubscriptionUI()}

      {/* Contact Reveal Modal */}
      <ContactRevealModal
        isOpen={showRevealModal}
        onClose={() => {
          setShowRevealModal(false);
          setRevealMethod(null);
        }}
        owner={owner}
        revealMethod={revealMethod}
        onReveal={handleRevealSuccess}
        userSubscription={userProfile}
      />
    </div>
  );
}
