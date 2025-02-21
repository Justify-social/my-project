"use client";

"use client";

import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, Variants, AnimatePresence } from "framer-motion";
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
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";

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

// Dynamically import chart components (client-side only)
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

// ---------------------------------------------------------------------------
// Global Animation Variants
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ---------------------------------------------------------------------------
// Simple Word Cloud Component (using basic span layout)
const SimpleWordCloud: React.FC = () => {
  const words = [
    { text: "Innovative", value: 30 },
    { text: "Creative", value: 25 },
    { text: "Effective", value: 20 },
    { text: "Trustworthy", value: 15 },
    { text: "Reliable", value: 18 },
    { text: "Impactful", value: 22 },
    { text: "Dynamic", value: 16 },
    { text: "Modern", value: 14 },
    { text: "Bold", value: 12 },
    { text: "Unique", value: 17 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg h-full overflow-auto">
      <div className="flex flex-wrap justify-center gap-4">
        {words.map((word, index) => {
          const fontSize = 14 + (word.value / 30) * 20; // Scale between 14-34px
          return (
            <span
              key={index}
              className="transition-all duration-200 hover:opacity-80"
              style={{
                fontSize: `${fontSize}px`,
                color: `hsl(${(index * 45) % 360}, 70%, 50%)`,
                fontWeight: word.value > 20 ? "bold" : "normal",
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

// ---------------------------------------------------------------------------
// Dashboard Filters Component
interface DashboardFiltersProps {
  startDate: string;
  endDate: string;
  segmentation: string;
  onFilterChange: (startDate: string, endDate: string, segmentation: string) => void;
}
const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  startDate,
  endDate,
  segmentation,
  onFilterChange,
}) => {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localSeg, setLocalSeg] = useState(segmentation);

  const handleApply = () => {
    onFilterChange(localStart, localEnd, localSeg);
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-primary-color">Start Date</label>
        <input
          type="date"
          value={localStart}
          onChange={(e) => setLocalStart(e.target.value)}
          className="border rounded p-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-primary-color">End Date</label>
        <input
          type="date"
          value={localEnd}
          onChange={(e) => setLocalEnd(e.target.value)}
          className="border rounded p-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-primary-color">Segmentation</label>
        <select
          value={localSeg}
          onChange={(e) => setLocalSeg(e.target.value)}
          className="border rounded p-1"
        >
          <option value="All">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <button
        onClick={handleApply}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
      >
        Apply Filters
      </button>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-6">
      <div
        className="flex justify-between items-center bg-primary-color text-white rounded-t-lg px-4 py-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-white border border-t-0 rounded-b-lg p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Detailed Analysis Modal Component
interface DetailedAnalysisModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}
const DetailedAnalysisModal: React.FC<DetailedAnalysisModalProps> = ({ visible, title, content, onClose }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-primary-color">{title}</h3>
            <p className="text-sm text-secondary-color whitespace-pre-line">{content}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------------------------------------------------------------------------
// Types for Key Metrics and Chart Props
interface KeyMetric {
  label: string;
  points: number;
  description?: string;
}

// Key Metrics Component
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
        <div key={metric.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <p className="text-sm text-secondary-color">{metric.label}</p>
          <h3 className="text-2xl font-bold text-primary-color">+{metric.points}pts</h3>
          {metric.description && <p className="text-xs text-gray-500 mt-1">{metric.description}</p>}
        </div>
      ))}
    </motion.div>
  );
};

// Bar Chart Component
interface BarChartProps {
  title: string;
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  onChartClick?: () => void;
}
const BarChartSection: React.FC<BarChartProps> = ({ title, data, options, onChartClick }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4 cursor-pointer"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onClick={onChartClick}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">{title}</h2>
      <div className="relative w-full h-64">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
};

// Line Chart Component
interface LineChartProps {
  title: string;
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
  onChartClick?: () => void;
}
const LineChartSection: React.FC<LineChartProps> = ({ title, data, options, onChartClick }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4 cursor-pointer"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onClick={onChartClick}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">{title}</h2>
      <div className="relative w-full h-64">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

// Word Cloud Section Component
const WordCloudSection: React.FC = () => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow p-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-base font-semibold text-primary-color mb-4">Messaging Themes</h2>
      <div className="w-full h-64">
        <SimpleWordCloud />
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT: BrandLiftStudyReportPage
export default function BrandLiftReportContent() {
  return (
    <div>
      <h1>Brand Lift Report Content</h1>
      {/* We'll add the full content back once this works */}
    </div>
  );
}

// Just change the component name from BrandLiftStudyReportPage to BrandLiftReportContent 