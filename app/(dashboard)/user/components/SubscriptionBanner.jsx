"use client";
import { motion } from "framer-motion";
import { FiPhone, FiZap, FiStar } from "react-icons/fi";

export default function SubscriptionBanner({ onStartTrial }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="mx-4 sm:mx-6 lg:mx-8 mb-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white border-2 border-primary rounded-xl p-6 shadow-xl relative overflow-hidden"
        >
          {/* Decorative Accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-red-500 origin-left"
          ></motion.div>

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-4 right-4 text-primary opacity-10"
          >
            <FiZap size={48} />
          </motion.div>

          <div className="flex items-center justify-between gap-6 relative z-10">
            {/* Left Content */}
            <div className="flex items-center gap-4 flex-1">
              {/* Premium Badge */}
              <div className="shrink-0 relative">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <FiZap size={24} className="text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                  <FiStar size={8} className="text-primary-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🔥 LIMITED TIME OFFER
                  </span>
                </div>
                <h3 className="text-secondary font-bold text-xl leading-tight mb-1">
                  Connect Directly with Property Owners
                </h3>
                <p className="text-muted text-sm">
                  Get 30 direct contact numbers instantly • Skip the brokers •
                  Save lakhs on brokerage fees
                </p>
              </div>
            </div>

            {/* Right CTA */}
            <div className="shrink-0 flex items-center gap-4">
              <div className="text-center hidden sm:block p-4 bg-gray-50 rounded-lg border-2 border-primary/20">
                <div className="text-primary font-bold text-3xl mb-1">₹200</div>
                <div className="text-secondary text-sm font-medium">
                  for 30 contacts
                </div>
                <div className="text-success text-xs font-bold">Save ₹800</div>
              </div>

              <div className="text-center sm:hidden p-3 bg-gray-50 rounded-lg border-2 border-primary/20">
                <div className="text-primary font-bold text-xl">₹200</div>
                <div className="text-secondary text-xs">30 contacts</div>
              </div>

              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartTrial}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <FiPhone size={18} />
                  Get Contacts Now
                </motion.button>
                <div className="text-center">
                  <span className="text-primary text-xs font-semibold">
                    ⚡ Instant Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
