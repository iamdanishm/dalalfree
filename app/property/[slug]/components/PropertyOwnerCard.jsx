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
import { useToast } from "@/app/lib/hooks/useToast";

export default function PropertyOwnerCard({ property }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealMethod, setRevealMethod] = useState(null);
  const [revealedOwner, setRevealedOwner] = useState(null);
  const { success, error } = useToast();

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
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [status]);

  // Use property owner data or fallbacks
  const ownerData = property?.owner || {
    name: "Property Owner",
    role: "Verified Owner",
    avatar: "/images/home-lifestyle.png",
    contact: "Contact for details",
    email: "contact@example.com",
    memberSince: "2024",
    response: "Responds within 24 hours"
  };

  const handleContactReveal = (method) => {
    if (method !== "schedule_visit") {
      setRevealMethod(method);
      setShowRevealModal(true);
    } else {
      console.log("Schedule visit clicked");
    }
  };

  const handleRevealSuccess = async (method) => {
    try {
      const response = await fetch(`/api/properties/${property.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          contactType: 'phone' // Default 
        })
      });

      const data = await response.json();

      if (data.success) {
        setRevealedOwner(data.contact);
        setShowRevealModal(false);
        setRevealMethod(null);
        success("Contact details revealed!");
      } else {
        error(data.error || "Failed to reveal contact");
      }
    } catch (err) {
      console.error(err);
      error("An error occurred");
    }
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

    // If contact is already revealed
    if (revealedOwner) {
      return (
        <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center text-gray-800">
            <FiPhone className="mr-3 flex-shrink-0 text-green-600" size={16} />
            <span className="text-sm font-bold">{revealedOwner.phone}</span>
          </div>
          <div className="flex items-center text-gray-800">
            <FiMail className="mr-3 flex-shrink-0 text-green-600" size={16} />
            <span className="text-sm font-medium">{revealedOwner.email}</span>
          </div>
          <p className="text-xs text-green-700 text-center mt-2">Contact Revealed</p>
        </div>
      );
    }

    const subscriptionStatus = userProfile?.subscriptionStatus || "none";

    // Free Trial Users - Full Access
    if (subscriptionStatus === "free_trial" || subscriptionStatus === "active") {
      // Logic adjustment: Even active users might need to "Click to Reveal" to log it as a lead.
      // But for UX, maybe we auto-reveal? 
      // The requirement creates a "Lead" when revealed. 
      // Let's keep the "Reveal" button even for premium but make it free/instant?
      // Or better, premium users see it directly?
      // If they see directly, we must log the view.
      // For now, I'll stick to the "Click to view" pattern or check if already viewed.
      // Simplification: Show "Click to View Contact" button for premium users that auto-fires or behaves like 0-cost.
      // Actually, let's reuse the blurred UI but with a "View Contact" button that calls ID/reveal immediately.
      return (
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
            <button
              onClick={() => handleRevealSuccess('premium_view')}
              className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <FiUser /> View Contact Details
            </button>
          </div>
        </div>
      )
    }

    // Expired Users
    if (subscriptionStatus === "expired") {
      return (
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <FiClock className="mx-auto mb-2 text-orange-500" size={24} />
          <p className="text-sm text-orange-800 font-medium mb-2">
            Access Expired
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

    // Check if the current user is the owner (partner preview case)
    const isActualOwner =
      session?.user &&
      property?.ownerId &&
      String(session.user.id || session.user._id) ===
      String(property.ownerId._id || property.ownerId);

    // If it's the owner (partner previewing his listing), show details directly
    if (isActualOwner) {
      return (
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center text-gray-800">
            <FiPhone className="mr-3 flex-shrink-0 text-blue-600" size={16} />
            <span className="text-sm font-bold">
              {ownerData.phone || "No phone added"}
            </span>
          </div>
          <div className="flex items-center text-gray-800">
            <FiMail className="mr-3 flex-shrink-0 text-blue-600" size={16} />
            <span className="text-sm font-medium">
              {ownerData.email || "No email added"}
            </span>
          </div>
          <p className="text-xs text-blue-700 text-center mt-2 italic">
            Preview: Contact visible to you as the owner
          </p>
        </div>
      );
    }

    // Default: Show lead generation options for non-owners (including for partner listings)
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
            </div>
          </button>

          {/* Buy Package Option */}
          <button
            onClick={() => handleContactReveal("purchase")}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
          >
            <FiCreditCard size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Buy Credits</div>
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
        <h3 className="text-xl font-semibold text-gray-900">
          {ownerData.role === "Verified Partner" ? "Professional Partner" : "Property Owner"}
        </h3>
      </div>

      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mr-4 flex items-center justify-center overflow-hidden">
          {ownerData.avatar && ownerData.avatar !== "/images/home-lifestyle.png" ? (
            <img src={ownerData.avatar} alt={ownerData.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-xl">
              {ownerData.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{ownerData.name}</h4>
          <p className="text-green-600 text-sm font-medium">{ownerData.role}</p>
          <p className="text-gray-500 text-xs">{ownerData.response}</p>
        </div>
      </div>

      {/* Owner Stats */}
      <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
        <FiClock className="mx-auto mb-1 text-blue-600" size={18} />
        <div className="text-sm font-medium text-gray-900">
          Member since {ownerData.memberSince}
        </div>
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
        owner={ownerData}
        revealMethod={revealMethod}
        onReveal={handleRevealSuccess}
        userSubscription={userProfile}
      />
    </div>
  );
}
