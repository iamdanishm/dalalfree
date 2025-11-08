"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Aarav Patel",
      role: "Buyer, Pune",
      feedback:
        "Found a great 3BHK with zero brokerage. Smooth process end-to-end.",
      avatar: "/images/home-lifestyle.png",
    },
    {
      id: 2,
      name: "Neha Sharma",
      role: "Owner, Bengaluru",
      feedback:
        "Listing took minutes and quality leads started coming the same day.",
      avatar: "/images/home-lifestyle.png",
    },
    {
      id: 3,
      name: "Rohit Mehta",
      role: "Tenant, Gurgaon",
      feedback: "Direct chat with owners and verified details made it easy.",
      avatar: "/images/home-lifestyle.png",
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
    <section className="bg-background py-20">
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
          className="text-2xl sm:text-3xl font-bold text-heading mb-10"
        >
          Loved by 100K+ users
        </motion.h2>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((user) => (
            <motion.div
              key={user.id}
              variants={cardVariants}
              whileHover={{
                y: -2,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100"
              style={{ willChange: "transform" }}
            >
              {/* Header: Avatar + Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-secondary">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* Feedback */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.feedback}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
