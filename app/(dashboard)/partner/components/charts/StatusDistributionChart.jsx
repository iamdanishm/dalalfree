"use client";

import { motion } from "framer-motion";

export default function StatusDistributionChart({ data, title }) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border p-6" role="img" aria-labelledby={`chart-title-${title.replace(/\s+/g, '-')}`}>
      <h2 id={`chart-title-${title.replace(/\s+/g, '-')}`} className="text-lg font-semibold text-heading mb-4">{title}</h2>
      
      {/* Simple horizontal bar chart */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          
          return (
            <motion.div
              key={item.label}
              className="space-y-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-heading">{item.label}</span>
                <span className="text-sm text-muted">{item.value}</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${percentage}%`, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}