"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FiBarChart, FiTrendingUp } from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RecentPropertiesChart({ propertyData }) {
  const chartRef = useRef(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Mock data for recent properties added - replace with real API data
  const recentData = propertyData || [3, 7, 2, 8, 5, 9, 4]; // Last 7 days
  const verticalLabels = [
    "7d ago",
    "6d ago",
    "5d ago",
    "4d ago",
    "3d ago",
    "2d ago",
    "Today",
  ];
  const horizontalLabels = [
    "7 days ago",
    "6 days ago",
    "5 days ago",
    "4 days ago",
    "3 days ago",
    "2 days ago",
    "Yesterday",
  ];

  const data = {
    labels: isLargeScreen ? horizontalLabels : verticalLabels,
    datasets: [
      {
        label: "Properties Added",
        data: recentData,
        fill: true,
        backgroundColor: "rgba(229, 9, 20, 0.1)",
        borderColor: "#e50914",
        borderWidth: 3,
        pointBackgroundColor: "#e50914",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#e50914",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            return `${context.parsed.y} properties added`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b6b6b",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b6b6b",
          font: {
            size: 12,
            weight: "500",
          },
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
      line: {
        tension: 0.4,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const totalProperties = recentData.reduce((sum, count) => sum + count, 0);
  const averageProperties = (totalProperties / recentData.length).toFixed(1);
  const maxProperties = Math.max(...recentData);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-primary" />
              Recent Properties Added
            </h2>
            <p className="text-sm text-muted mt-1">
              Daily property additions in the last 7 days
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-heading">
              {totalProperties}
            </div>
            <div className="flex items-center text-sm font-medium text-green-600">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              {averageProperties}/day avg
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <div className={`${isLargeScreen ? "h-80" : "h-64"} w-full`}>
          <Line ref={chartRef} data={data} options={options} />
        </div>

        {/* Additional stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 grid grid-cols-3 gap-4"
        >
          <div className="p-3 bg-surface/50 rounded-lg text-center">
            <div className="text-lg font-bold text-heading">
              {totalProperties}
            </div>
            <div className="text-xs text-muted">Total This Week</div>
          </div>
          <div className="p-3 bg-surface/50 rounded-lg text-center">
            <div className="text-lg font-bold text-heading">
              {averageProperties}
            </div>
            <div className="text-xs text-muted">Daily Average</div>
          </div>
          <div className="p-3 bg-surface/50 rounded-lg text-center">
            <div className="text-lg font-bold text-heading">
              {maxProperties}
            </div>
            <div className="text-xs text-muted">Peak Day</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
