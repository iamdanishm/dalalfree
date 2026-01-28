import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function MetricsCard({
  title,
  value,
  change,
  icon: IconComponent,
  positive,
  color = "bg-gradient-to-r from-primary to-primary/80",
  delay = 0,
  onClick,
}) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative ${color} rounded-xl p-4 sm:p-6 text-white overflow-hidden shadow-lg cursor-pointer group`}
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute top-0 right-0 w-20 h-20 opacity-10"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <IconComponent className="w-full h-full" />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
            className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${positive ? "bg-white/20" : "bg-red-500/20"
              }`}
          >
            {positive ? (
              <FiTrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            ) : (
              <FiTrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            )}
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3, duration: 0.3 }}
            >
              {change}
            </motion.span>
          </motion.div>
        </div>

        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4, duration: 0.3 }}
        >
          <h3 className="text-white/70 text-xs sm:text-sm font-medium">
            {title}
          </h3>
          <motion.p
            className="text-xl sm:text-2xl font-bold tracking-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: delay + 0.5,
              duration: 0.3,
              type: "spring",
              stiffness: 200,
            }}
          >
            {value}
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle border with animation */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.3 }}
      />

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
