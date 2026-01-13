"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProfileHeader from "./components/ProfileHeader";
import SubscriptionDashboard from "./components/SubscriptionDashboard";
import PropertyManagement from "./components/PropertyManagement";
import AccountSettings from "./components/AccountSettings";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a user (regular user), redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "user") {
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "partner":
            router.push("/partner");
            break;
          case "subadmin":
            router.push("/admin"); // Redirect subadmins to admin panel too
            break;
          default:
            router.push("/");
            break;
        }
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setUserProfile(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated but not a user (regular user), don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "user"
  ) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account, properties, and subscription
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error loading profile: {error}</p>
            </div>
          )}

          {/* Profile Content - Card-Based Dashboard */}
          <div className="space-y-6 md:space-y-8">
            {/* Profile Hero Card - Full Width */}
            <ProfileHeader
              user={userProfile}
              onProfileUpdate={fetchUserProfile}
            />

            {/* Property Management Section - Full Width */}
            <PropertyManagement user={userProfile} />

            {/* Main Content Cards - Responsive Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4 md:space-y-6">
                <SubscriptionDashboard user={userProfile} />
              </div>

              {/* Right Column */}
              <div className="space-y-4 md:space-y-6">
                <AccountSettings
                  user={userProfile}
                  onProfileUpdate={fetchUserProfile}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}