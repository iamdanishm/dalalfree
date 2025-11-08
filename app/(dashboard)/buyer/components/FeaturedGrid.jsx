"use client";

import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

export default function FeaturedGrid() {
  const properties = [
    {
      id: 1,
      price: "₹95 Lakh",
      title: "Green Heights, Baner",
      location: "Pune",
      size: "1,200 sq.ft",
      tag: "2BHK",
      image: "/images/home-lifestyle.png",
    },
    {
      id: 2,
      price: "₹45,000/mo",
      title: "Skyline Residency, HSR",
      location: "Bengaluru",
      size: "1,350 sq.ft",
      tag: "3BHK",
      image: "/images/home-lifestyle.png",
    },
    {
      id: 3,
      price: "₹1.2 Lakh/mo",
      title: "Grade-A Space, Cybercity",
      location: "Gurgaon",
      size: "3,000 sq.ft",
      tag: "Office",
      image: "/images/home-lifestyle.png",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-2xl sm:text-3xl font-bold text-heading mb-4 sm:mb-0"
          >
            Featured Properties
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-primary text-white font-medium text-sm px-6 py-2 rounded-full hover:opacity-90"
            suppressHydrationWarning
          >
            View All
          </motion.button>
        </div>

        {/* Property Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {properties.map((property) => (
            <motion.div
              key={property.id}
              variants={cardVariants}
              whileHover={{
                y: -3,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              className="bg-white rounded-3xl shadow-sm hover:shadow-md overflow-hidden border border-gray-100 flex flex-col"
              style={{ willChange: "transform" }}
            >
              {/* Image */}
              <div className="relative w-full h-52">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover rounded-t-3xl"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.3,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute top-3 right-3 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {property.tag}
                </motion.span>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-lg font-semibold text-secondary">
                    {property.price}
                  </p>
                  <p className="text-lg font-bold text-secondary mt-1">
                    {property.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FiMapPin className="text-gray-400" />
                    {property.location} • {property.size}
                  </p>
                </div>

                <div className="mt-5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:opacity-90"
                    suppressHydrationWarning
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
