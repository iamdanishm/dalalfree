"use client";

import { FiHome, FiKey, FiDollarSign } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function QuickCategories() {
  const categories = [
    {
      title: "Buy",
      desc: "Explore verified homes for sale",
      icon: <FiHome className="text-xl text-secondary" />,
    },
    {
      title: "Rent",
      desc: "Find houses, flats and PGs",
      icon: <FiKey className="text-xl text-secondary" />,
    },
    {
      title: "Sell",
      desc: "List and reach buyers fast",
      icon: <FiDollarSign className="text-xl text-secondary" />,
    },
    {
      title: "Commercial",
      desc: "Offices, shops & warehouses",
      icon: <HiOutlineBuildingOffice2 className="text-xl text-secondary" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Increased stagger for smoother feel
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 }, // Increased initial offset
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6, // Slightly longer for smoother feel
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth feel
      },
    },
  };

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-2xl sm:text-3xl font-bold text-heading mb-8"
        >
          Quick Categories
        </motion.h2>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Reduced amount for earlier trigger
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{
                y: -2, // Reduced movement for smoother feel
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              className="group flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md px-5 py-5 cursor-pointer"
              style={{ willChange: "transform" }} // Performance hint
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-50 transition-colors duration-200">
                  <motion.div
                    whileHover={{ scale: 1.05 }} // Reduced scale for smoother feel
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>

              <motion.div
                whileHover={{ x: 3 }} // Reduced movement
                transition={{
                  type: "spring",
                  stiffness: 400, // Reduced stiffness for smoother spring
                  damping: 25,
                }}
              >
                <FiChevronRight className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
