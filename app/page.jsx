"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BuyerExplorePage from "./(dashboard)/buyer/page";
import AdminDashboard from "./(dashboard)/admin/page";
import PartnerDashboard from "./(dashboard)/partner/page";
import SellerDashboard from "./(dashboard)/seller/page";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      switch (userRole) {
        case "admin":
          router.push("/admin");
          break;
        case "partner":
          router.push("/partner");
          break;
        case "seller":
          router.push("/seller");
          break;
        case "buyer":
        default:
          // Stay on home page for buyers (show buyer explore page)
          break;
      }
    } else if (status === "unauthenticated") {
      // For unauthenticated users, show the buyer explore page
      // This allows them to browse properties before logging in
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For authenticated users, render their appropriate dashboard
  if (status === "authenticated" && session?.user) {
    const userRole = session.user.role;

    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "partner":
        return <PartnerDashboard />;
      case "seller":
        return <SellerDashboard />;
      case "buyer":
      default:
        return (
          <>
            <Navbar />
            <BuyerExplorePage />
            <Footer />
          </>
        );
    }
  }

  // For unauthenticated users, show buyer explore page
  return (
    <>
      <Navbar />
      <BuyerExplorePage />
      <Footer />
    </>
  );
}
