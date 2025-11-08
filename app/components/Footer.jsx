"use client";

import Link from "next/link";
import { FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const columnVariants = {
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

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const bottomBarVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-secondary text-white pt-16 pb-6"
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
          {/* About */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-3">About Us</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Dalal Free is a no-broker marketplace to buy, sell, and rent
              properties with confidence.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-3">Contact</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                <motion.a
                  href="mailto:support@dalalfree.com"
                  className="hover:text-white"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  support@dalalfree.com
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="tel:+918000000000"
                  className="hover:text-white"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  +91 80000 00000
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="hover:text-white"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  Twitter
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Policies */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-3">Policies</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/terms" className="hover:text-white">
                    Terms & Conditions
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/refund" className="hover:text-white">
                    Refund Policy
                  </Link>
                </motion.div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-5 mb-8">
          {[
            { icon: FiFacebook, href: "#" },
            { icon: FiTwitter, href: "#" },
            { icon: FiInstagram, href: "#" },
          ].map((social, i) => (
            <motion.div
              key={i}
              variants={socialVariants}
              custom={i}
              whileHover={{
                y: -2,
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              <Link
                href={social.href}
                className="text-gray-400 hover:text-white transition"
              >
                <social.icon size={20} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={bottomBarVariants}
          className="border-t border-gray-700 pt-4 text-xs text-gray-400"
        >
          © 2025 Dalal Free | Built for Transparent Real Estate.
        </motion.div>
      </div>
    </motion.footer>
  );
}
