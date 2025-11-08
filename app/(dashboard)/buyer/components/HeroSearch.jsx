"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <section className="relative bg-secondary text-white flex items-center justify-center py-20 md:py-28 overflow-hidden">
      {/* === Background Skyline Illustration === */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-image.png"
          alt="City skyline"
          fill
          priority
          className="object-cover object-bottom sm:object-center md:object-top lg:object-center opacity-25 sm:opacity-35 brightness-100 sm:brightness-125 contrast-100 sm:contrast-125"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        />
      </div>

      {/* === Search Card === */}
      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-3xl shadow-lg p-6 sm:p-8"
          style={{ willChange: "transform" }}
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["Buy", "Rent", "Commercial"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-5 py-2 text-sm sm:text-base font-medium rounded-full transition-colors duration-200 ${
                  activeTab === tab.toLowerCase()
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                suppressHydrationWarning
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Inputs (responsive grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="City"
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
              suppressHydrationWarning
            />
            <input
              type="text"
              placeholder="Locality"
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
              suppressHydrationWarning
            />
            <input
              type="text"
              placeholder="Property Type"
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
              suppressHydrationWarning
            />
            <input
              type="text"
              placeholder="Budget"
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
              suppressHydrationWarning
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="bg-primary text-white font-semibold px-6 py-3 rounded-lg w-full sm:w-auto hover:opacity-90"
              suppressHydrationWarning
            >
              Search
            </motion.button>
          </div>

          {/* Caption */}
          <p className="text-gray-500 text-sm mt-4 text-center sm:text-left">
            No brokerage. 100% verified listings.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
