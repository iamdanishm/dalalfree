"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "../../globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const metadata = {
  title: "Dalal Free | Explore Properties",
  description:
    "Find your dream property with Dalal Free – 100% verified, zero brokerage.",
};

export default function BuyerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      // Redirect unauthenticated users to login
      router.push("/login");
      return;
    }

    // If authenticated but not a buyer, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "buyer") {
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
          default:
            // If role is not recognized, redirect to home
            router.push("/");
            break;
        }
      }
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

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated but not a buyer, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "buyer"
  ) {
    return null;
  }

  return (
    <div>
      {/* Main Content Area */}
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
