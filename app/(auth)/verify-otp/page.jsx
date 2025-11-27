"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: emailFromParams,
    },
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const resetToken = watch("resetToken");

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

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

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp.replace(/\D/g, ""), // Remove any non-digits
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "OTP verified successfully! You can now reset your password."
        );
        setValue("resetToken", result.resetToken);
        setIsSuccess(true);
      } else {
        setErrorMsg(result.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  const handleResendOTP = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailFromParams,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMsg("New OTP sent successfully. Please check your email.");
        setCanResend(false);
        setCountdown(60); // 60 second cooldown
      } else {
        setErrorMsg(result.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  const handleContinueToReset = () => {
    if (resetToken) {
      // Pass reset token as query parameter to reset-password page
      router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
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
        <h1 className="text-2xl font-bold text-secondary mb-2">Verify OTP</h1>
        <p className="text-sm text-gray-500">
          Enter the 6-digit code sent to your email
        </p>
        {emailFromParams && (
          <p className="text-xs text-gray-400 mt-2">
            Code sent to: {emailFromParams}
          </p>
        )}
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
          {/* Email (read-only if from params) */}
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
              readOnly={!!emailFromParams}
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

          {/* OTP Input */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              OTP Code
            </label>
            <motion.input
              type="text"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Please enter a 6-digit OTP",
                },
                maxLength: {
                  value: 6,
                  message: "OTP must be exactly 6 digits",
                },
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
            />
            <AnimatePresence>
              {errors.otp && (
                <motion.span
                  key="otp-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-red-500 mt-1 block text-center"
                >
                  {errors.otp.message}
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
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </motion.span>
          </motion.button>
        </motion.form>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <motion.button
            onClick={handleContinueToReset}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg"
          >
            Reset Password
          </motion.button>
        </motion.div>
      )}

      {/* Resend OTP / Back to Login */}
      <motion.div
        className="text-center mt-6 space-y-2"
        variants={itemVariants}
      >
        {!isSuccess && (
          <div>
            {canResend ? (
              <button
                onClick={handleResendOTP}
                className="text-sm text-primary font-medium hover:text-primary/80 transition-colors duration-200"
                disabled={isSubmitting}
              >
                Didn't receive the code? Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in {countdown}s
              </p>
            )}
          </div>
        )}

        <div>
          <Link
            href="/login"
            className="text-sm text-primary font-medium hover:text-primary/80 transition-colors duration-200"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
