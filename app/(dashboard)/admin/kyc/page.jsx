"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import KycManagementTable from "../components/KycManagementTable";

export default function AdminKycPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle authentication and role checking
  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check role
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
            router.push("/");
            break;
        }
      }
    }
  }, [status, session, router]);

  // Loading states
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full"
        />
        <div className="ml-4 text-body">Loading KYC management...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role !== "admin"
  ) {
    return null;
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FiShield className="w-8 h-8 text-primary mb-3" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-heading"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          KYC Management
        </motion.h1>
        <motion.p
          className="text-muted mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Review and approve KYC applications from users and partners on the
          platform. Ensure compliance and verify user identities.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <KycManagementTable />
      </motion.div>
    </motion.div>
  );
}
