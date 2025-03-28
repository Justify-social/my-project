"use client";

import React, { useState, useEffect, useCallback } from "react";
import Bar from '../../src/components/ui/icons/core/icon-data';
import Line from '../../src/components/ui/icons/core/icon-data';
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dynamically import chart components
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false
});
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false
});

// Simple Word Cloud Component
const SimpleWordCloud: React.FC = () => {
  const words = [
    { text: "Brand", value: 25 },
    { text: "Awareness", value: 18 },
    { text: "Marketing", value: 20 },
    { text: "Creative", value: 15 },
    { text: "Audience", value: 12 },
    // ... rest of your words array
  ];

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex flex-wrap justify-center gap-4">
        {words.map((word, index) => {
          const fontSize = 14 + (word.value / 25) * 20; // Scale between 14-34px
          return (
            <span
              key={index}
              className="transition-all duration-200 hover:opacity-80"
              style={{
                fontSize: `${fontSize}px`,
                color: `hsl(${index * 40}, 70%, 50%)`,
                fontWeight: word.value > 20 ? 'bold' : 'normal',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   TYPE DEFINITIONS
   ============================================================================ */
interface KeyMetric {
  label: string;
  points: number;
  description?: string;
}

interface BarChartProps {
  title: string;
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
}

interface LineChartProps {
  title: string;
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
}

/* ============================================================================
   ANIMATION VARIANTS
   ============================================================================ */
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

/* ============================================================================
   COMPONENTS
   ============================================================================ */

/**
 * KeyMetricsAtAGlance
 * Renders a row of key metric cards, each showing a "points" lift.
 */
const KeyMetricsAtAGlance: React.FC<{ metrics: KeyMetric[] }> = ({ metrics }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white rounded-lg shadow p-4 flex flex-col items-start"
        >
          <p className="text-sm text-secondary-color">{metric.label}</p>
          <h3 className="text-2xl font-bold text-primary-color">
            +{metric.points}pts
          </h3>
          {metric.description && (
            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
          )}
        </div>
      ))}
    </motion.div>
  );
};

/**
 * BarChartSection
 * Displays a bar chart with a title.
 */
const BarChartSection: React.FC<BarChartProps> = ({ title, data, options }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">
        {title}
      </h2>
      <div className="relative w-full h-64">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
};

/**
 * LineChartSection
 * Displays a line chart with a title.
 */
const LineChartSection: React.FC<LineChartProps> = ({ title, data, options }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">
        {title}
      </h2>
      <div className="relative w-full h-64">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

/**
 * WordCloudSection
 * Displays a word cloud for "Messaging Themes" or other textual data.
 */
const WordCloudSection: React.FC = () => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">
        Messaging Themes
      </h2>
      <div className="w-full h-64">
        <SimpleWordCloud />
      </div>
    </motion.div>
  );
};

/* ============================================================================
   MAIN COMPONENT: BrandLiftResultsPage
   ============================================================================ */

export default function BrandLiftResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Example campaign ID from URL or session
  const [campaignId, setCampaignId] = useState<string>("");

  // Key metrics
  const [keyMetrics] = useState<KeyMetric[]>([
    {
      label: "Brand Awareness",
      points: 20,
      description: "Measured uplift in brand recognition"
    },
    {
      label: "Ad Recall",
      points: 15,
      description: "Ability to remember our advertisement"
    },
    {
      label: "Brand Perception",
      points: 12,
      description: "Overall positivity toward the brand"
    },
    {
      label: "Purchase Intent",
      points: 8,
      description: "Likelihood of making a purchase"
    }
  ]);

  // Example bar chart data: "Overall Visualization"
  const overallBarData: ChartData<"bar"> = {
    labels: [
      "Ad Recall",
      "Brand Awareness",
      "Brand Perception",
      "Action Intent",
      "Recommendation Intent",
      "Advocacy"
    ],
    datasets: [
      {
        label: "Lift (Percentage Points)",
        data: [15, 20, 12, 10, 9, 5],
        backgroundColor: "#3B82F6",
        borderRadius: 4
      }
    ]
  };
  const overallBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          color: "#4B5563"
        },
        grid: {
          color: "#E5E7EB"
        }
      },
      x: {
        ticks: {
          color: "#4B5563"
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: ""
      }
    }
  };

  // Example bar chart data for "Audience Breakdown"
  const audienceBarData: ChartData<"bar"> = {
    labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
    datasets: [
      {
        label: "Male",
        data: [10, 15, 20, 8, 5],
        backgroundColor: "#60A5FA"
      },
      {
        label: "Female",
        data: [12, 18, 17, 10, 6],
        backgroundColor: "#93C5FD"
      }
    ]
  };
  const audienceBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          color: "#4B5563"
        },
        grid: {
          color: "#E5E7EB"
        }
      },
      x: {
        ticks: {
          color: "#4B5563"
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: true },
      title: {
        display: false,
        text: ""
      }
    }
  };

  // Example line chart data for "Brand Over Time"
  const brandOverTimeData: ChartData<"line"> = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Brand Awareness",
        data: [10, 14, 16, 18, 20],
        fill: true,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4
      }
    ]
  };
  const brandOverTimeOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          color: "#4B5563"
        },
        grid: {
          color: "#E5E7EB"
        }
      },
      x: {
        ticks: {
          color: "#4B5563"
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: ""
      }
    }
  };

  /**
   * On mount, load campaignId from sessionStorage or query params
   */
  useEffect(() => {
    const savedCampaignId = sessionStorage.getItem("campaignId");
    if (savedCampaignId) {
      setCampaignId(savedCampaignId);
    } else {
      const paramId = searchParams.get("campaignId");
      if (paramId) {
        setCampaignId(paramId);
      }
    }
  }, [searchParams]);

  /**
   * handleExportVisualization
   * Simulate exporting charts or data as a file.
   */
  const handleExportVisualization = useCallback(() => {
    alert("Visualization Exported (simulated)!");
    // In real usage, you could export an image or CSV data
    // e.g., generate a PDF, call an API, or use chart.js methods
  }, []);

  /**
   * handleBackToDashboard
   * Navigates user back to a hypothetical dashboard
   */
  const handleBackToDashboard = useCallback(() => {
    router.push(`/dashboard?campaignId=${campaignId}`);
  }, [router, campaignId]);

  return (
    <main className="min-h-screen w-full bg-gray-50 p-4 md:p-8 lg:p-12">
      {/* Page Title and Actions */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-primary-color">
            Brand Lift Results
          </h1>
          <p className="text-sm text-secondary-color">
            Detailed insights into campaign performance and audience response.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportVisualization}
            className="px-4 py-2 bg-gray-100 text-primary-color rounded hover:bg-gray-200 text-sm"
          >
            Export Visualization
          </button>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Key Metrics Section */}
        <section>
          <h2 className="text-lg font-semibold text-primary-color mb-3">
            Key Metrics at a Glance
          </h2>
          <KeyMetricsAtAGlance metrics={keyMetrics} />
        </section>

        {/* Overall Visualization */}
        <section>
          <h2 className="text-lg font-semibold text-primary-color mb-3">
            Overall Visualization
          </h2>
          <BarChartSection
            title="Overall Brand Lift by Metric"
            data={overallBarData}
            options={overallBarOptions}
          />
        </section>

        {/* Audience Breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-primary-color mb-3">
            Audience Breakdown
          </h2>
          <BarChartSection
            title="Demographic Insights"
            data={audienceBarData}
            options={audienceBarOptions}
          />
        </section>

        {/* Brand Over Time */}
        <section>
          <h2 className="text-lg font-semibold text-primary-color mb-3">
            Brand Over Time
          </h2>
          <LineChartSection
            title="Tracking Awareness Growth"
            data={brandOverTimeData}
            options={brandOverTimeOptions}
          />
        </section>

        {/* Messaging Themes */}
        <section>
          <WordCloudSection />
        </section>
      </div>
    </main>
  );
}
