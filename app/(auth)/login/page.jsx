"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// Commented out API integration for development
// import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [errorMsg, setErrorMsg] = useState("");

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

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
    loading: { scale: 0.98, opacity: 0.8 },
  };

  const googleButtonVariants = {
    idle: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 8px 25px rgba(66, 133, 244, 0.3)",
      transition: { duration: 0.2, ease: "easeOut" },
    },
    tap: { scale: 0.98, y: 0, transition: { duration: 0.1 } },
    loading: { scale: 0.98, opacity: 0.8 },
  };

  const googleIconVariants = {
    idle: { rotate: 0, scale: 1 },
    hover: { rotate: 5, scale: 1.1, transition: { duration: 0.3 } },
    loading: {
      rotate: 360,
      scale: 1,
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };

  const onSubmit = async (data) => {
    setErrorMsg("");
    // Commented out API integration for development - using dummy data instead
    /*
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      // Get user info from the session
      const user = res.user;
      if (user) {
        // Role-based redirect
        switch (user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "partner":
            router.push("/partner");
            break;
          case "user":
          default:
            router.push("/user");
            break;
        }
      } else {
        // Fallback to user dashboard
        router.push("/user");
      }
    }
    */

    // Dummy login logic for development
    try {
      const response = await fetch("/dummyUsers.json");
      const users = await response.json();
      const user = users.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!user) {
        setErrorMsg("Invalid email or password");
        return;
      }

      // Role-based redirect
      switch (user.role) {
        case "admin":
          router.push("/admin");
          break;
        case "partner":
          router.push("/partner");
          break;
        case "user":
        default:
          router.push("/user");
          break;
      }
    } catch (error) {
      setErrorMsg("Login failed. Please try again.");
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
        <h1 className="text-2xl font-bold text-secondary mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-500">
          Log in to continue your Dalal Free journey
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

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        variants={itemVariants}
      >
        {/* Email */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Email
          </label>
          <motion.input
            type="email"
            {...register("email", { required: "Email is required" })}
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

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Password
          </label>
          <motion.input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
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
            {isSubmitting ? "Logging in..." : "Login"}
          </motion.span>
        </motion.button>
      </motion.form>

      <motion.p
        className="text-sm text-center text-gray-600 mt-6"
        variants={itemVariants}
      >
        Don&apos;t have an account?{" "}
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Register
          </Link>
        </motion.span>
      </motion.p>

      {/* Or separator */}
      <motion.div className="mt-6 relative" variants={itemVariants}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <motion.span
            className="px-4 bg-white text-gray-500 font-medium"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Or continue with
          </motion.span>
        </div>
      </motion.div>

      {/* Enhanced Google Button */}
      <motion.div className="mt-6" variants={itemVariants}>
        <motion.button
          type="button"
          // Commented out Google login API integration for development
          // onClick={() => signIn("google", { callbackUrl: "/" })}
          variants={googleButtonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          animate="idle"
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3.5 px-4 bg-white hover:bg-gray-50 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md"
        >
          {/* Background gradient effect on hover */}
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />

          {/* Google Icon with animation */}
          <motion.div variants={googleIconVariants} className="relative z-10">
            <FcGoogle size={22} className="drop-shadow-sm" />
          </motion.div>

          {/* Button text */}
          <motion.span
            className="text-sm font-medium text-gray-700 relative z-10"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            Continue with Google
          </motion.span>

          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 bg-blue-100 opacity-0 rounded-xl"
            whileTap={{ opacity: [0, 0.3, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Additional styling for better visual hierarchy */}
        <motion.p
          className="text-xs text-center text-gray-500 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          Secure authentication powered by Google
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
