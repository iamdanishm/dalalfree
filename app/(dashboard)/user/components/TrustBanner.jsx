"use client";

import Image from "next/image";
import { FiShield, FiEye, FiCheckCircle, FiVideo } from "react-icons/fi";
import { motion } from "framer-motion";

export default function TrustBanner() {
  const features = [
    {
      icon: <FiShield size={18} />,
      title: "No Brokerage Fees",
      subtitle: "Connect directly with owners and builders.",
    },
    {
      icon: <FiEye size={18} />,
      title: "Transparent Deals",
      subtitle: "Clear pricing and honest details.",
    },
    {
      icon: <FiCheckCircle size={18} />,
      title: "Verified Listings",
      subtitle: "Each listing is reviewed for accuracy.",
    },
    {
      icon: <FiVideo size={18} />,
      title: "Watch Ad to Reveal Contact",
      subtitle: "Keep platform free and spam-free.",
    },
  ];

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

  const featureVariants = {
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      style={{ willChange: "transform" }}
    >
      {/* Outer rounded black container */}
      <div className="mx-auto max-w-7xl bg-secondary rounded-3xl p-6 sm:p-10 lg:p-12">
        {/* Inner content: uses flex on large screens */}
        <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-8">
          {/* LEFT: heading + 2x2 cards */}
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-sm text-gray-300 mb-6"
            >
              Built for trust, speed, and transparency.
            </motion.p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
            >
              {features.map((f, idx) => (
                <motion.div
                  key={idx}
                  variants={featureVariants}
                  whileHover={{
                    y: -2,
                    transition: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-soft"
                  style={{ willChange: "transform" }}
                >
                  <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-secondary leading-tight">
                      {f.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs">
                      {f.subtitle}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: framed image card */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="rounded-2xl overflow-hidden bg-white p-1"
              style={{ maxWidth: 620, width: "100%" }}
            >
              <div className="rounded-xl overflow-hidden">
                <Image
                  src="/images/home-lifestyle.png"
                  alt="Lifestyle"
                  width={1200}
                  height={800}
                  className="object-cover w-full h-64 sm:h-80 lg:h-72"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
