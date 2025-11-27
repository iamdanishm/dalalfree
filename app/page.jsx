"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserExplorePage from "./(dashboard)/user/page";
import AdminDashboard from "./(dashboard)/admin/page";
import PartnerDashboard from "./(dashboard)/partner/page";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LogoLoader from "./components/LogoLoader";

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
        case "user":
        default:
          // Stay on home page for users (show user explore page)
          break;
      }
    } else if (status === "unauthenticated") {
      // For unauthenticated users, show the user explore page
      // This allows them to browse properties before logging in
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <LogoLoader />;
  }

  // For authenticated users, render their appropriate dashboard
  if (status === "authenticated" && session?.user) {
    const userRole = session.user.role;

    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "partner":
        return <PartnerDashboard />;
      case "user":
      default:
        return (
          <>
            <Navbar />
            <UserExplorePage />
            <Footer />
          </>
        );
    }
  }

  // For unauthenticated users, show user explore page
  return (
    <>
      <Navbar />
      <UserExplorePage />
      <Footer />
    </>
  );
}
