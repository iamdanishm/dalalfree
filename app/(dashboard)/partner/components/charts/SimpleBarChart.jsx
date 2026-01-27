"use client";

import { motion } from "framer-motion";

export default function SimpleBarChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-border p-6">
        <h2 className="text-lg font-semibold text-heading mb-4">{title}</h2>
        <div className="flex items-center justify-center h-32 text-muted">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border p-6" role="img" aria-labelledby={`chart-title-${title.replace(/\s+/g, '-')}`}>
      <h2 id={`chart-title-${title.replace(/\s+/g, '-')}`} className="text-lg font-semibold text-heading mb-4">{title}</h2>
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          
          return (
            <motion.div
              key={item.label}
              className="flex flex-col items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <motion.div
                className="bg-primary rounded-t w-full max-w-[40px]"
                style={{ height: `${height}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                whileHover={{ scaleY: 1.05 }}
              />
              <span className="text-xs text-muted mt-2">{item.label}</span>
              <span className="text-xs font-medium text-heading">
                {item.prefix || ""}{item.value}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}