"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../globals.css";
import PartnerNavbar from "./components/layout/PartnerNavbar";
import PartnerSidebar from "./components/layout/PartnerSidebar";

export default function PartnerLayout({ children }) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Poll for role changes to handle admin demotions in real-time
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/user/status?t=${Date.now()}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();

            // If they are no longer a partner, update session and kick them out
            if (data.user.role !== "partner") {
              console.log(`[PartnerLayout] Role changed to ${data.user.role}. Updating session...`);
              await updateSession({
                role: data.user.role,
                partnerRequestStatus: data.user.partnerRequestStatus
              });

              if (data.user.role === "admin") {
                router.push("/admin");
              } else {
                router.push("/user");
              }
            }
          }
        } catch (err) {
          console.error("Error polling user status in partner layout:", err);
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [status, session?.user?.role, updateSession, router]);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a partner, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "partner") {
        switch (userRole) {
          case "admin":
            router.push("/admin");
            break;
          case "user":
            router.push("/user");
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated but not a partner, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "partner"
  ) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <PartnerNavbar onMenuClick={() => setSidebarOpen(true)} />
      </motion.header>

      {/* Main Layout Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Part of the flow on desktop, overlay on mobile */}
        <motion.aside
          className={`fixed lg:translate-x-0 top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white border-r border-border overflow-y-auto z-40`}
          initial={{ x: -288 }}
          animate={{
            x: sidebarOpen ? 0 : isLargeScreen ? 0 : -288,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        >
          <PartnerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </motion.aside>

        {/* Mobile Overlay - Click to close sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area - Takes remaining space */}
        <motion.main
          className="flex-1 bg-surface/30 min-h-[calc(100vh-4rem)] overflow-y-auto lg:ml-72"
          layout
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="px-4 sm:px-6 lg:px-8 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
    </motion.div>
  );
}