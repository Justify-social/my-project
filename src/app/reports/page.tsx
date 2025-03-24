"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  // Local state for report configuration
  const [reportFormat, setReportFormat] = useState("PDF");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeAIInsights, setIncludeAIInsights] = useState(false);
  const [reportPreview, setReportPreview] = useState("");

  // Toggle a metric in the selected metrics array
  const handleMetricChange = (metric: string) => {
    setMetrics((prevMetrics) =>
    prevMetrics.includes(metric) ?
    prevMetrics.filter((m) => m !== metric) :
    [...prevMetrics, metric]
    );
  };

  // Generate a preview string based on current form values
  const generateReportPreview = () => {
    const preview = `
Report Format: ${reportFormat}
Date Range: ${startDate || "N/A"} to ${endDate || "N/A"}
Metrics: ${metrics.length > 0 ? metrics.join(", ") : "None selected"}
AI Insights: ${includeAIInsights ? "Included" : "Not included"}
    `;
    setReportPreview(preview);
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    generateReportPreview();
  };

  return (
    <div className="container mx-auto p-4 font-work-sans">
      {/* Header Navigation */}
      <div className="mb-6 border-b border-gray-300 font-work-sans">
        <nav className="flex space-x-4 font-work-sans">
          <button
            onClick={() => router.push('/reports')}
            className="py-2 px-4 font-bold border-b-2 border-blue-500 font-work-sans"
            aria-current="page">

            Dashboard
          </button>
          <button
            onClick={() => router.push('/reports/historical')}
            className="py-2 px-4 text-blue-500 hover:underline font-work-sans">

            Historical Reports
          </button>
          <button
            onClick={() => router.push('/reports/custom')}
            className="py-2 px-4 text-blue-500 hover:underline font-work-sans">

            Custom Reports
          </button>
        </nav>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4 font-sora">Report Generation Interface</h1>

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        {/* Report Format */}
        <div className="font-work-sans">
          <label className="block font-medium mb-1 font-work-sans" htmlFor="reportFormat">
            Report Format
          </label>
          <select
            name="reportFormat"
            id="reportFormat"
            value={reportFormat}
            onChange={(e) => setReportFormat(e.target.value)}
            className="border p-2 rounded w-full font-work-sans">

            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
          </select>
        </div>

        {/* Metrics Selection */}
        <div className="font-work-sans">
          <label className="block font-medium mb-1 font-work-sans">Select Metrics</label>
          <div className="flex space-x-4 font-work-sans">
            {["Sales", "Campaign Reach", "Engagement", "ROI"].map((metric) =>
            <label key={metric} className="inline-flex items-center font-work-sans">
                <input
                type="checkbox"
                name="metrics"
                checked={metrics.includes(metric)}
                onChange={() => handleMetricChange(metric)}
                className="mr-1 font-work-sans" />

                {metric}
              </label>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="font-work-sans">
          <label className="block font-medium mb-1 font-work-sans">Date Range</label>
          <div className="flex space-x-2 font-work-sans">
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded font-work-sans" />

            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded font-work-sans" />

          </div>
        </div>

        {/* AI Insights Toggle */}
        <div className="font-work-sans">
          <label className="inline-flex items-center font-work-sans">
            <input
              type="checkbox"
              name="aiInsights"
              id="aiInsights"
              checked={includeAIInsights}
              onChange={(e) => setIncludeAIInsights(e.target.checked)}
              className="mr-2 font-work-sans" />

            Include AI Insights
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-work-sans">

          Generate Report Preview
        </button>
      </form>

      {/* Report Preview Section */}
      {reportPreview &&
      <div className="border p-4 rounded font-work-sans">
          <h2 className="text-xl font-semibold mb-2 font-sora">Report Preview</h2>
          <pre className="whitespace-pre-wrap">{reportPreview}</pre>
          <div className="mt-4 space-x-2 font-work-sans">
            <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-work-sans"
            onClick={() => alert("Exporting as PDF...")}>

              Export as PDF
            </button>
            <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-work-sans"
            onClick={() => alert("Exporting as Excel...")}>

              Export as Excel
            </button>
          </div>
        </div>
      }
    </div>);

}