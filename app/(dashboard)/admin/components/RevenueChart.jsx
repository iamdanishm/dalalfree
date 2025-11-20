"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueChart() {
  const chartRef = useRef(null);

  // Mock data - replace with real data from API
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueData = [4200, 3800, 5100, 4800, 6200, 5800];

  const data = {
    labels: months,
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueData,
        borderColor: "#e50914",
        backgroundColor: "rgba(229, 9, 20, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#e50914",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#e50914",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
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
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#e50914",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function (context) {
            return `${context[0].label} 2024`;
          },
          label: function (context) {
            return `Revenue: $${context.parsed.y.toLocaleString()}`;
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
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b6b6b",
          font: {
            size: 12,
            weight: "500",
          },
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: false,
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

  const currentMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const changePercent = (
    ((currentMonth - previousMonth) / previousMonth) *
    100
  ).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-heading flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-primary" />
              Revenue Trends
            </h2>
            <p className="text-sm text-muted mt-1">
              Monthly revenue performance
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-heading">
              ${currentMonth.toLocaleString()}
            </div>
            <div
              className={`text-sm font-medium flex items-center ${
                changePercent > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <FiTrendingUp
                className={`w-4 h-4 mr-1 ${
                  changePercent < 0 ? "rotate-180" : ""
                }`}
              />
              {changePercent}% from last month
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-64 w-full">
          <Line ref={chartRef} data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
