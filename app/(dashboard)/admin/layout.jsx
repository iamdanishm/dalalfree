"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../../globals.css";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not an admin, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole !== "admin") {
        switch (userRole) {
          case "partner":
            router.push("/partner");
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

  // If authenticated but not an admin, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "admin"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Part of the flow on desktop, overlay on mobile */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:translate-x-0 top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white border-r border-border transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
        >
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Mobile Overlay - Click to close sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - Takes remaining space */}
        <main className="flex-1 bg-surface/30 min-h-[calc(100vh-4rem)] overflow-y-auto lg:ml-72">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
