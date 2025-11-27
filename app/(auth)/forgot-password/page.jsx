"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    watch,
  } = useForm();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const email = watch("email");

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

  const errorVariants = {
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

  const successVariants = {
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
    setErrorMsg("");
    setSuccessMsg("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Password reset OTP sent successfully. Please check your email."
        );
        setIsSuccess(true);
      } else {
        setErrorMsg(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  const handleContinueToVerification = () => {
    if (email) {
      // Pass email as query parameter to verify-otp page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
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
          Reset Password
        </h1>
        <p className="text-sm text-gray-500">
          Enter your email to receive a password reset OTP
        </p>
      </motion.div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="error"
            variants={errorVariants}
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
      </AnimatePresence>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            key="success"
            variants={successVariants}
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

      {!isSuccess ? (
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          variants={itemVariants}
        >
          {/* Email */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Email Address
            </label>
            <motion.input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
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
              {isSubmitting ? "Sending OTP..." : "Send Reset OTP"}
            </motion.span>
          </motion.button>
        </motion.form>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <motion.button
            onClick={handleContinueToVerification}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg"
          >
            Enter OTP
          </motion.button>

          <motion.button
            onClick={() => {
              setIsSuccess(false);
              setSuccessMsg("");
            }}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200"
          >
            Try Different Email
          </motion.button>
        </motion.div>
      )}

      <motion.div className="text-center mt-6" variants={itemVariants}>
        <Link
          href="/login"
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors duration-200"
        >
          ← Back to Login
        </Link>
      </motion.div>
    </motion.div>
  );
}
