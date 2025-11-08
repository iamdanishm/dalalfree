"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, height: 0, y: -10 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
    loading: { scale: 0.98, opacity: 0.8 },
  };

  const onSubmit = async (data) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");

      const res = await axios.post("/api/auth/register", data);
      if (res.status === 201) {
        setSuccessMsg("Account created successfully!");
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-2xl font-bold text-secondary mb-2">
          Create Account
        </h1>
        <p className="text-sm text-gray-500">
          Join Dalal Free to buy, sell, and rent properties easily.
        </p>
      </motion.div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="error"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-4"
          >
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              {errorMsg}
            </p>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            key="success"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-4"
          >
            <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              {successMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        variants={itemVariants}
      >
        {/* Name */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Full Name
          </label>
          <motion.input
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="Your Name"
            whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.span
                key="name-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500 mt-1 block"
              >
                {errors.name.message}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Email
          </label>
          <motion.input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="you@example.com"
            whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.span
                key="email-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500 mt-1 block"
              >
                {errors.email.message}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Password
          </label>
          <motion.input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Minimum 6 characters required",
              },
            })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="••••••••"
            whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
          />
          <AnimatePresence>
            {errors.password && (
              <motion.span
                key="password-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500 mt-1 block"
              >
                {errors.password.message}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Role Selection */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            I am a
          </label>
          <div className="relative group">
            <motion.select
              {...register("role", { required: true })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500 appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
              whileFocus={{
                scale: 1.01,
                transition: { duration: 0.2 },
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              }}
              whileHover={{
                borderColor: "#6B7280",
                transition: { duration: 0.2 },
              }}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
                paddingRight: "40px",
              }}
            >
              <option
                value=""
                disabled
                style={{ color: "#9CA3AF", backgroundColor: "white" }}
              >
                Select your role
              </option>
              <option
                value="buyer"
                style={{ color: "#111827", backgroundColor: "white" }}
              >
                🏠 Buyer - Looking for properties
              </option>
              <option
                value="seller"
                style={{ color: "#111827", backgroundColor: "white" }}
              >
                💼 Seller - Selling my property
              </option>
              <option
                value="partner"
                style={{ color: "#111827", backgroundColor: "white" }}
              >
                🤝 Dalal Free Partner - Real estate professional
              </option>
            </motion.select>
            <motion.div
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
              animate={{
                rotate: 0,
              }}
              whileHover={{
                rotate: 180,
                transition: { duration: 0.3 },
              }}
            >
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          variants={buttonVariants}
          initial="idle"
          whileHover={isSubmitting ? "loading" : "hover"}
          whileTap="tap"
          animate={isSubmitting ? "loading" : "idle"}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          <motion.span
            key={isSubmitting ? "loading" : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </motion.span>
        </motion.button>
      </motion.form>

      <motion.p
        className="text-sm text-center text-gray-600 mt-6"
        variants={itemVariants}
      >
        Already have an account?{" "}
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Login
          </Link>
        </motion.span>
      </motion.p>
    </motion.div>
  );
}
