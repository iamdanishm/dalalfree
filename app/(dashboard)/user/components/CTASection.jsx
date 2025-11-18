"use client";
import { motion } from "framer-motion";

export default function CTASection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-primary text-primary-foreground py-4 md:py-7"
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <motion.h3
          variants={itemVariants}
          className="text-2xl font-semibold text-center md:text-left"
        >
          Start Listing Your Property for Free
        </motion.h3>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-50"
          suppressHydrationWarning
        >
          Post Property Now
        </motion.button>
      </div>
    </motion.section>
  );
}
