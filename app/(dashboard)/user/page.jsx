"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import HeroSearch from "./components/HeroSearch";
import TrustBanner from "./components/TrustBanner";
import CTASection from "./components/CTASection";
import Testimonials from "./components/Testimonials";
import QuickCategories from "./components/QuickCategories";
import FeaturedGrid from "./components/FeaturedGrid";
import SubscriptionBanner from "./components/SubscriptionBanner";

export default function UserExplore() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

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
        } finally {
          setLoading(false);
        }
      } else if (status !== "loading") {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [status]);

  const handleStartTrial = () => {
    // Redirect to profile page where user can see subscription options
    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="bg-background text-foreground font-sans">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans">
      <HeroSearch />
      <QuickCategories />
      <TrustBanner />
      <FeaturedGrid />
      {/* Show subscription banner only for users with "none" status */}
      {userProfile?.subscriptionStatus === "none" && (
        <SubscriptionBanner onStartTrial={handleStartTrial} />
      )}
      <CTASection />
      <Testimonials />
    </div>
  );
}
