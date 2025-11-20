"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FiPieChart } from "react-icons/fi";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PropertyStatsChart({ propertyStats }) {
  const chartRef = useRef(null);

  // Use provided data or fallback to mock data
  const stats = propertyStats || [
    { type: "Residential", count: 45, percentage: 52 },
    { type: "Commercial", count: 23, percentage: 26 },
    { type: "Industrial", count: 12, percentage: 14 },
    { type: "Land", count: 8, percentage: 9 },
  ];

  const data = {
    labels: stats.map((stat) => stat.type),
    datasets: [
      {
        data: stats.map((stat) => stat.percentage),
        backgroundColor: [
          "#e50914", // Primary red
          "#ff6b6b", // Lighter red
          "#4ecdc4", // Teal
          "#45b7d1", // Blue
        ],
        borderColor: ["#d1080f", "#e55a5a", "#3ab0a8", "#3a9bbf"],
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const totalProperties = stats.reduce((sum, stat) => sum + stat.count, 0);
  const primaryType = stats.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  );

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-heading flex items-center">
          <FiPieChart className="w-5 h-5 mr-2 text-primary" />
          Property Distribution
        </h2>
        <p className="text-sm text-muted mt-1">Types of properties listed</p>
      </div>

      <div className="p-6">
        <div className="h-64 w-full flex items-center justify-center">
          <Doughnut
            ref={chartRef}
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "rectRounded",
                    font: { size: 12, weight: "500" },
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  titleColor: "#ffffff",
                  bodyColor: "#ffffff",
                  borderColor: "#e50914",
                  borderWidth: 1,
                  cornerRadius: 8,
                  padding: 12,
                  callbacks: {
                    label: function (context) {
                      const count = stats[context.dataIndex].count;
                      const percentage = context.parsed;
                      return `${context.label}: ${count} properties (${percentage}%)`;
                    },
                  },
                },
              },
              cutout: "60%",
              radius: "90%",
            }}
          />
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-heading">
                {totalProperties}
              </div>
              <div className="text-sm text-muted font-medium">
                Total Properties
              </div>
            </div>
          </div>
        </div>

        {/* Most popular type highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
        >
          <div className="text-center">
            <div className="text-sm font-medium text-heading">Most Popular</div>
            <div className="text-lg font-bold text-primary">
              {primaryType.type}
            </div>
            <div className="text-xs text-muted">
              {primaryType.count} properties • {primaryType.percentage}%
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
