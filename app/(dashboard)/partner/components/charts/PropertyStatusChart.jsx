"use client";

import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FiPieChart } from "react-icons/fi";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function PropertyStatusChart({ stats }) {
    const chartRef = useRef(null);

    const data = {
        labels: ["Total", "Approved", "Pending", "Rejected"],
        datasets: [
            {
                label: "Properties",
                data: [
                    stats.totalProperties,
                    stats.approvedProperties,
                    stats.totalProperties - stats.approvedProperties - stats.rejectedProperties, // Pending
                    stats.rejectedProperties,
                ],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.2)", // Blue for Total
                    "rgba(16, 185, 129, 0.2)", // Emerald for Approved
                    "rgba(245, 158, 11, 0.2)", // Amber for Pending
                    "rgba(239, 68, 68, 0.2)",  // Red for Rejected
                ],
                borderColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                ],
                borderWidth: 2,
                borderRadius: 12,
                hoverBackgroundColor: [
                    "rgba(59, 130, 246, 0.3)",
                    "rgba(16, 185, 129, 0.3)",
                    "rgba(245, 158, 11, 0.3)",
                    "rgba(239, 68, 68, 0.3)",
                ],
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
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return ` ${context.parsed.y} Properties`;
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
                    color: "#6b7280",
                    font: {
                        size: 12,
                        weight: "600",
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "#f3f4f6",
                    drawBorder: false,
                },
                ticks: {
                    color: "#9ca3af",
                    font: {
                        size: 11,
                    },
                    stepSize: 1,
                },
            },
        },
        animation: {
            duration: 1500,
            easing: "easeOutQuart",
        },
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-heading flex items-center gap-3">
                        <FiPieChart className="text-primary" />
                        Inventory Status
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">Distribution of your property listings</p>
                </div>
            </div>

            <div className="flex-1 min-h-[240px]">
                <Bar ref={chartRef} data={data} options={options} />
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2">
                {data.labels.map((label, i) => (
                    <div key={label} className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-lg font-black text-heading">{data.datasets[0].data[i]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
