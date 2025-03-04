"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
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
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { toast } from "react-hot-toast";

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

  // Brand colors with various opacities
  const brandColors = [
    'var(--accent-color)',
    'rgba(0, 191, 255, 0.9)',
    'rgba(0, 191, 255, 0.8)',
    'rgba(0, 191, 255, 0.7)',
    'rgba(0, 191, 255, 0.6)',
    'var(--primary-color)',
    'rgba(51, 51, 51, 0.9)',
    'rgba(51, 51, 51, 0.8)',
    'rgba(51, 51, 51, 0.7)',
    'rgba(51, 51, 51, 0.6)',
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
                color: brandColors[index % brandColors.length],
                fontWeight: word.value > 15 ? 'bold' : 'normal'
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
  // Helper function to get appropriate KPI class based on metric label
  const getKpiClass = (label: string) => {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('awareness')) return 'kpi-brand-awareness';
    if (labelLower.includes('recall')) return 'kpi-ad-recall';
    if (labelLower.includes('perception')) return 'kpi-message-association';
    if (labelLower.includes('purchase intent')) return 'kpi-purchase-intent';
    if (labelLower.includes('consideration')) return 'kpi-consideration';
    if (labelLower.includes('preference')) return 'kpi-brand-preference';
    
    // Default fallback
    return 'kpi-brand-awareness';
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-gray-100 rounded-lg p-5 flex flex-col items-start"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center">
              <span className={`kpi-icon ${getKpiClass(metric.label)}`}></span>
              <p className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>{metric.label}</p>
            </div>
            {/* Info icon with tooltip */}
            <div className="relative group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 w-48 right-0 top-6">
                Additional details about {metric.label.toLowerCase()} measurement and what it means for your brand.
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold" style={{ color: 'var(--accent-color)' }}>
            +{metric.points}pts
          </h3>
          {metric.description && (
            <p className="text-xs mt-2" style={{ color: 'var(--secondary-color)', opacity: 0.8 }}>{metric.description}</p>
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
const BarChartSection = ({ title, data, options }: { title: string; data: ChartData<'bar'>; options: ChartOptions<'bar'> }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-6">
    <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--primary-color)' }}>{title}</h3>
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  </div>
);

/**
 * LineChartSection
 * Displays a line chart with a title.
 */
const LineChartSection = ({ title, data, options }: { title: string; data: ChartData<'line'>; options: ChartOptions<'line'> }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--primary-color)' }}>{title}</h3>
    <div className="h-[300px]">
      <Line data={data} options={options} />
    </div>
  </div>
);

/**
 * WordCloudSection
 * Displays a word cloud for "Messaging Themes" or other textual data.
 */
const WordCloudSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="kpi-icon kpi-message-association"></span>
          <h3 className="text-lg font-medium" style={{ color: 'var(--primary-color)' }}>
            Messaging Themes
          </h3>
        </div>
        <div className="relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 w-48 right-0 top-6">
            This word cloud shows the most common themes and associations from your brand lift study.
          </div>
        </div>
      </div>
      
      <p className="text-sm mb-6" style={{ color: 'var(--secondary-color)' }}>
        Key themes and associations from your brand lift study responses.
      </p>
      
      <div className="w-full h-64">
        <SimpleWordCloud />
      </div>
    </div>
  );
};

// Add this new component for the Funnel Visualisation section
const FunnelVisualisation: React.FC = () => {
  // Helper function to get appropriate KPI class based on metric name
  const getKpiClass = (name: string) => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('awareness')) return 'kpi-brand-awareness';
    if (nameLower.includes('recall')) return 'kpi-ad-recall';
    if (nameLower.includes('consideration')) return 'kpi-consideration';
    
    // Default fallback
    return 'kpi-brand-awareness';
  };

  const metrics = [
    { 
      name: 'Brand Awareness', 
      control: 50, 
      exposed: 80 
    },
    { 
      name: 'Ad Recall', 
      control: 60, 
      exposed: 90 
    },
    { 
      name: 'Consideration', 
      control: 40, 
      exposed: 70 
    }
  ];

  // Prepare chart data
  const chartData = {
    labels: metrics.map(m => m.name),
    datasets: [
      {
        label: 'Control',
        data: metrics.map(m => m.control),
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.5,
      },
      {
        label: 'Exposed',
        data: metrics.map(m => m.exposed),
        backgroundColor: 'var(--accent-color)',
        borderColor: 'var(--accent-color)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.5,
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.raw + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--primary-color)' }}>
          Funnel Visualisation
        </h3>
        <div className="relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 w-48 right-0 top-6">
            Compare the performance metrics between control and exposed groups across your marketing funnel.
          </div>
        </div>
      </div>
      
      <p className="text-sm mb-6" style={{ color: 'var(--secondary-color)' }}>
        Track how different KPIs progress through your marketing funnel, comparing control vs exposed groups.
      </p>
      
      {/* Vertical bar chart */}
      <div className="h-[400px] mt-6">
        <Bar data={chartData} options={chartOptions as any} />
      </div>
      
      {/* Lift indicators below the chart */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className={`kpi-icon ${getKpiClass(metric.name)}`}></span>
              <span className="text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
                {metric.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                Lift:
              </span>
              <span className="text-lg font-bold" style={{ color: 'green' }}>
                +{metric.exposed - metric.control}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Demographic breakdown component
const DemographicBreakdown: React.FC = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('40-45');
  const [selectedGenders, setSelectedGenders] = useState(['Male', 'Female']);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram, TikTok');
  const [activeMetric, setActiveMetric] = useState('Brand Awareness');
  
  // This would be dynamic data in a real implementation
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  
  // Helper function to get appropriate KPI class
  const getKpiClass = (name: string) => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('awareness')) return 'kpi-brand-awareness';
    if (nameLower.includes('recall')) return 'kpi-ad-recall';
    if (nameLower.includes('consideration')) return 'kpi-consideration';
    
    // Default fallback
    return 'kpi-brand-awareness';
  };
  
  const toggleGender = (gender: string) => {
    if (selectedGenders.includes(gender)) {
      setSelectedGenders(selectedGenders.filter(g => g !== gender));
    } else {
      setSelectedGenders([...selectedGenders, gender]);
    }
  };

  // Sample data for the demographic breakdown chart
  const demographicData = {
    labels: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    datasets: [
      {
        label: 'Control',
        data: [32, 43, 50, 47, 36, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        barPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: 'Exposed',
        data: [55, 65, 72, 65, 58, 47],
        backgroundColor: 'var(--accent-color)',
        borderColor: 'var(--accent-color)',
        borderWidth: 1,
        barPercentage: 0.7,
        borderRadius: 4,
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.raw + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--primary-color)' }}>
          Audience Breakdown
        </h3>
        <div className="relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 w-48 right-0 top-6">
            See how your brand lift metrics vary across different audience demographics.
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--secondary-color)' }}>
            Age Group
          </label>
          <select 
            className="w-full p-2 border border-gray-200 rounded-md"
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            aria-label="Select age group"
          >
            {ageGroups.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--secondary-color)' }}>
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectedGenders.includes('Male')} 
                onChange={() => toggleGender('Male')}
                className="mr-2"
                aria-label="Select male gender"
              />
              <span className="text-sm" style={{ color: 'var(--primary-color)' }}>Male</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectedGenders.includes('Female')} 
                onChange={() => toggleGender('Female')}
                className="mr-2"
                aria-label="Select female gender"
              />
              <span className="text-sm" style={{ color: 'var(--primary-color)' }}>Female</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--secondary-color)' }}>
            Platform
          </label>
          <select 
            className="w-full p-2 border border-gray-200 rounded-md"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            aria-label="Select platform"
          >
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Instagram, TikTok">Instagram, TikTok</option>
            <option value="Facebook">Facebook</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>
      </div>
      
      {/* Metric Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['Brand Awareness', 'Ad Recall', 'Consideration'].map(metric => (
          <button
            key={metric}
            className={`flex items-center py-2 px-4 border-b-2 ${
              activeMetric === metric 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent hover:border-gray-300'
            } transition-colors`}
            onClick={() => setActiveMetric(metric)}
            aria-label={`View ${metric} metrics`}
          >
            <span className={`kpi-icon ${getKpiClass(metric)}`}></span>
            <span className="text-sm font-medium">{metric}</span>
          </button>
        ))}
      </div>
      
      {/* Chart with vertical bars */}
      <div className="h-[300px]">
        <Bar data={demographicData} options={chartOptions as any} />
      </div>
      
      <div className="mt-4 text-xs text-center" style={{ color: 'var(--secondary-color)' }}>
        Age Distribution for {selectedGenders.join(' & ')} on {selectedPlatform}
      </div>
    </div>
  );
};

// Survey questions component
const SurveyQuestions: React.FC = () => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  
  const questions = [
    {
      id: 'q1',
      text: 'How familiar are you with our brand?',
      type: 'Single Choice',
      category: 'Brand Awareness'
    },
    {
      id: 'q2',
      text: 'Which of the following messages do you associate with our brand?',
      type: 'Multiple Choice',
      category: 'Message Association'
    },
    {
      id: 'q3',
      text: 'How likely are you to consider our product for your next purchase?',
      type: 'Single Choice',
      category: 'Consideration'
    }
  ];
  
  const toggleQuestion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
    }
  };
  
  // Helper function to get appropriate KPI class
  const getKpiClass = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('awareness')) return 'kpi-brand-awareness';
    if (categoryLower.includes('association')) return 'kpi-message-association';
    if (categoryLower.includes('consideration')) return 'kpi-consideration';
    
    // Default fallback
    return 'kpi-brand-awareness';
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <h3 className="text-lg font-medium mb-6" style={{ color: 'var(--primary-color)' }}>
        Survey Questions
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--secondary-color)' }}>
        Review the questions asked in your brand lift study and their response options.
      </p>
      
      <div className="space-y-4">
        {questions.map(question => (
          <div key={question.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleQuestion(question.id)}
            >
              <div className="flex items-center">
                <span className={`kpi-icon ${getKpiClass(question.category)}`}></span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
                    {question.text}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full mr-2" 
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)' }}>
                      {question.category}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                      {question.type}
                    </span>
                  </div>
                </div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-400 transition-transform ${expandedQuestion === question.id ? 'transform rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-label={expandedQuestion === question.id ? "Collapse question" : "Expand question"}
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {expandedQuestion === question.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <h5 className="text-xs font-medium mb-2" style={{ color: 'var(--secondary-color)' }}>Response Options:</h5>
                <ul className="space-y-1">
                  {question.category === 'Brand Awareness' && (
                    <>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Very familiar</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Somewhat familiar</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Not very familiar</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Not at all familiar</li>
                    </>
                  )}
                  {question.category === 'Message Association' && (
                    <>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• High quality</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Innovative</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Trustworthy</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Good value</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Environmentally friendly</li>
                    </>
                  )}
                  {question.category === 'Consideration' && (
                    <>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Very likely</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Somewhat likely</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Neither likely nor unlikely</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Somewhat unlikely</li>
                      <li className="text-xs" style={{ color: 'var(--primary-color)' }}>• Very unlikely</li>
                    </>
                  )}
                  {question.type === 'Multiple Choice' && (
                    <li className="text-xs mt-2 italic" style={{ color: 'var(--secondary-color)' }}>
                      Respondents can select multiple options
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// TimeChart component for tracking awareness over time
const TimeChart: React.FC = () => {
  // Sample data for the line chart
  const data = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    datasets: [
      {
        label: 'Brand Awareness',
        data: [8, 12, 16, 23, 18, 20, 22],
        fill: true,
        borderColor: 'var(--accent-color)',
        backgroundColor: 'rgba(0, 191, 255, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'var(--accent-color)',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.raw + '% awareness';
          }
        }
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className="kpi-icon kpi-brand-awareness"></span>
          <h3 className="text-lg font-medium" style={{ color: 'var(--primary-color)' }}>
            Trend Over Time
          </h3>
        </div>
        <div className="relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded p-2 w-48 right-0 top-6">
            This chart shows how brand awareness changed throughout your campaign period.
          </div>
        </div>
      </div>
      
      <p className="text-sm mb-6" style={{ color: 'var(--secondary-color)' }}>
        Brand awareness steadily improved across the 4-week campaign.
      </p>
      
      <div className="h-[300px]">
        <Line data={data} options={options as any} />
      </div>
    </div>
  );
};

// Recommendations component
const Recommendations: React.FC = () => {
  const [recommendations] = useState([
    {
      id: 'rec1',
      text: 'Keep brand logo visible in first 3 seconds for maximum recall',
      completed: false,
      category: 'Creative'
    },
    {
      id: 'rec2',
      text: 'Consider highlighting a unique product feature to boost consideration',
      completed: true,
      category: 'Messaging'
    },
    {
      id: 'rec3',
      text: 'Increase frequency on Instagram to improve awareness amongst 25-34 age group',
      completed: false,
      category: 'Media'
    }
  ]);
  
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
      <div className="flex items-start mb-6">
        <div className="bg-blue-100 rounded-full p-2 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: 'var(--accent-color)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--primary-color)' }}>
            Recommendations
          </h3>
          <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
            Based on your campaign performance analysis
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="flex items-start p-3 bg-white rounded-lg border border-gray-100">
            <div className="mt-0.5 mr-3">
              <input 
                type="checkbox" 
                checked={rec.completed} 
                className="rounded text-blue-500 focus:ring-blue-500"
                readOnly
                aria-label={`Mark recommendation as completed: ${rec.text}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
                {rec.text}
              </p>
              <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded-full" 
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)' }}>
                {rec.category}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="mt-6 w-full py-2 text-sm font-medium rounded-md text-white"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Apply Recommendations
      </button>
    </div>
  );
};

/* ============================================================================
   MAIN COMPONENT: BrandLiftResultsPage
   ============================================================================ */

function BrandLiftReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Example campaign ID from URL or session
  const [campaignId, setCampaignId] = useState<string>("");

  // Key metrics
  const [keyMetrics] = useState<KeyMetric[]>([
    {
      label: "Brand Awareness",
      points: 20,
      description: "Measured uplift in brand recognition amongst your target audience"
    },
    {
      label: "Ad Recall",
      points: 15,
      description: "Improvement in audience's ability to remember your advertisement"
    },
    {
      label: "Brand Perception",
      points: 12,
      description: "Enhanced positive sentiment towards your brand"
    },
    {
      label: "Purchase Intent",
      points: 8,
      description: "Increased likelihood of consumers making a purchase"
    }
  ]);

  /**
   * useEffect - Fetch the campaign ID from URL or session storage
   */
  useEffect(() => {
    const savedCampaignId = sessionStorage.getItem("campaignId");
    if (savedCampaignId) {
      setCampaignId(savedCampaignId);
    } else {
      const paramId = searchParams.get("id");
      if (paramId) {
        setCampaignId(paramId);
      }
    }
  }, [searchParams]);

  /**
   * Handle export of visualisation for a campaign
   */
  const handleExportVisualisation = () => {
    alert("Visualisation Exported (simulated)!");
    // In real usage, you could export an image or CSV data
  };

  /**
   * Handle navigation back to dashboard
   */
  const handleBackToDashboard = () => {
    router.push("/brand-lift");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
              Brand Lift Report
            </h1>
            <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
              Campaign ID: {campaignId || "BL-2023-0789"}
            </p>
          </div>
          
          <div className="flex mt-4 sm:mt-0 space-x-3">
            <button
              onClick={handleExportVisualisation}
              className="px-4 py-2 bg-gray-100 rounded text-sm font-medium transition-colors hover:bg-gray-200"
              style={{ color: 'var(--primary-color)' }}
              aria-label="Export visualisation data"
            >
              Export Visualisation
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent-color)' }}
              aria-label="Return to dashboard"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content sections */}
      <div className="space-y-8">
        {/* Key Metrics Section */}
        <section aria-labelledby="key-metrics-heading">
          <h2 id="key-metrics-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Key Metrics at a Glance
          </h2>
          <KeyMetricsAtAGlance metrics={keyMetrics} />
        </section>
        
        {/* Funnel Visualisation */}
        <section aria-labelledby="funnel-visualisation-heading">
          <h2 id="funnel-visualisation-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Funnel Performance
          </h2>
          <FunnelVisualisation />
        </section>
        
        {/* Demographic Breakdown */}
        <section aria-labelledby="demographic-breakdown-heading">
          <h2 id="demographic-breakdown-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Audience Insights
          </h2>
          <DemographicBreakdown />
        </section>
        
        {/* Survey Questions */}
        <section aria-labelledby="survey-questions-heading">
          <h2 id="survey-questions-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Survey Details
          </h2>
          <SurveyQuestions />
        </section>
        
        {/* Time Chart */}
        <section aria-labelledby="time-chart-heading">
          <h2 id="time-chart-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Performance Over Time
          </h2>
          <TimeChart />
        </section>
        
        {/* Word Cloud */}
        <section aria-labelledby="word-cloud-heading">
          <h2 id="word-cloud-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Brand Associations
          </h2>
          <WordCloudSection />
        </section>
        
        {/* Recommendations */}
        <section aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading" className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-color)' }}>
            Actionable Insights
          </h2>
          <Recommendations />
        </section>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrandLiftReportContent />
    </Suspense>
  );
}
