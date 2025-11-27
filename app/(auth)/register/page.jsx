"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const password = watch("password");

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z\d]/.test(password)) score += 1;

    const strength = {
      0: { label: "Very Weak", color: "bg-red-500" },
      1: { label: "Weak", color: "bg-red-400" },
      2: { label: "Fair", color: "bg-yellow-500" },
      3: { label: "Good", color: "bg-yellow-400" },
      4: { label: "Strong", color: "bg-green-500" },
      5: { label: "Very Strong", color: "bg-green-600" },
    };

    return { score, ...strength[Math.min(score, 5)] };
  };

  const passwordStrength = getPasswordStrength(password);

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

        // Auto-login the user with NextAuth
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false, // Don't auto-redirect
        });

        if (signInResult?.ok) {
          // Success - redirect to onboarding
          setTimeout(() => router.push("/onboard"), 1500);
        } else {
          // Fallback - redirect to login if auto-login fails
          setTimeout(() => router.push("/login"), 1500);
        }
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

        {/* Mobile Number */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Mobile Number
          </label>
          <motion.input
            type="tel"
            {...register("phone", {
              required: "Mobile number is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message:
                  "Please enter a valid 10-digit mobile number starting with 6-9",
              },
            })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="9876543210"
            whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
          />
          <AnimatePresence>
            {errors.phone && (
              <motion.span
                key="phone-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-red-500 mt-1 block"
              >
                {errors.phone.message}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Password
          </label>
          <div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
                validate: (value) => {
                  const hasUpperCase = /[A-Z]/.test(value);
                  const hasLowerCase = /[a-z]/.test(value);
                  const hasNumbers = /\d/.test(value);

                  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                    return "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
                  }
                  return true;
                },
              })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 pr-10"
              placeholder="••••••••"
              whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${passwordStrength.color}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {passwordStrength.label}
                </span>
              </div>
            </motion.div>
          )}

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
