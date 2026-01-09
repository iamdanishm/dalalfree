"use client";
import { motion } from "framer-motion";
import { FiHome, FiMapPin } from "react-icons/fi";
import PropertiesManagementTable from "../components/properties/PropertiesManagementTable";

export default function AdminPropertiesPageClient() {
  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
          <FiMapPin className="w-8 h-8 text-primary mb-3" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-heading"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Property Management
        </motion.h1>
        <motion.p
          className="text-muted mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Review and manage property listings. Approve or reject properties for
          the marketplace and monitor listing performance.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <PropertiesManagementTable />
      </motion.div>
    </motion.div>
  );
}
