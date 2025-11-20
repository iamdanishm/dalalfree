import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function MetricsCard({
  title,
  value,
  change,
  icon: IconComponent,
  positive,
  color = "bg-gradient-to-r from-primary to-primary/80",
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative ${color} rounded-xl p-6 text-white overflow-hidden shadow-lg`}
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <IconComponent className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <IconComponent className="w-6 h-6 opacity-80" />
          <div
            className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
              positive ? "bg-white/20" : "bg-red-500/20"
            }`}
          >
            {positive ? (
              <FiTrendingUp className="w-3 h-3" />
            ) : (
              <FiTrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-white/70 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>

      {/* Subtle border */}
      <div className="absolute inset-0 rounded-xl border border-white/10" />
    </motion.div>
  );
}
