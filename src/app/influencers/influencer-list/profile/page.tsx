"use client";

import React, { useState, ChangeEvent, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar } from
"recharts";

interface InfluencerProfile {
  fullName: string;
  handle: string;
  about: string;
  email: string;
  phone: string;
}

// --- Dummy Data for Charts ---
const ageDistributionData = [
{ ageRange: "18-24", value: 35 },
{ ageRange: "25-34", value: 40 },
{ ageRange: "35-44", value: 15 },
{ ageRange: "45-54", value: 7 },
{ ageRange: "55+", value: 3 }];


const genderData = [
{ name: "Female", value: 60 },
{ name: "Male", value: 35 },
{ name: "Other", value: 5 }];


const locationData = [
{ country: "USA", value: 40 },
{ country: "UK", value: 20 },
{ country: "Canada", value: 15 },
{ country: "Australia", value: 10 },
{ country: "Germany", value: 5 }];


const engagementOverTimeData = [
{ date: "2023-01-01", likes: 100, comments: 10, shares: 5 },
{ date: "2023-02-01", likes: 150, comments: 20, shares: 10 },
{ date: "2023-03-01", likes: 200, comments: 25, shares: 15 },
{ date: "2023-04-01", likes: 250, comments: 30, shares: 20 },
{ date: "2023-05-01", likes: 300, comments: 35, shares: 25 }];


const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

// --- Chart Components ---
// Age Distribution as a Bar Chart
const AgeDistributionChart: React.FC = () =>
<div className="w-full h-64 border p-4 rounded font-work-sans" aria-label="Age distribution bar chart">
    <h4 className="font-medium text-center mb-2 font-sora">Age Distribution</h4>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ageDistributionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ageRange" />
        <YAxis />
        <RechartsTooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </div>;


// Gender Breakdown as a Pie Chart
const GenderPieChart: React.FC = () =>
<div className="w-full h-64 border p-4 rounded font-work-sans" aria-label="Gender breakdown pie chart">
    <h4 className="font-medium text-center mb-2 font-sora">Gender Breakdown</h4>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
          {genderData.map((entry, index) =>
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} aria-label={`${entry.name}: ${entry.value}%`} />
        )}
        </Pie>
        <RechartsTooltip />
        <RechartsLegend />
      </PieChart>
    </ResponsiveContainer>
  </div>;


// Audience Location as a Bar Chart
const LocationBarChart: React.FC = () =>
<div className="w-full h-64 border p-4 rounded font-work-sans" aria-label="Audience location bar chart">
    <h4 className="font-medium text-center mb-2 font-sora">Audience Location</h4>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={locationData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="country" />
        <YAxis />
        <RechartsTooltip />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  </div>;


// Engagement Over Time as a Line Chart
const EngagementLineChart: React.FC = () =>
<div className="w-full h-80 border p-4 rounded font-work-sans" aria-label="Engagement over time line chart">
    <h4 className="font-medium text-center mb-2 font-sora">Engagement Over Time</h4>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={engagementOverTimeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <RechartsTooltip />
        <RechartsLegend />
        <Line type="monotone" dataKey="likes" stroke="#8884d8" />
        <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
        <Line type="monotone" dataKey="shares" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  </div>;


// -------------------------------------------------------------------
// Main Influencer Profile Page Component
// -------------------------------------------------------------------
const ProfileContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const influencerId = searchParams.get("id");

  // Static influencer data; in a real app, fetch using influencerId.
  const [profile, setProfile] = useState<InfluencerProfile>({
    fullName: "Emily Carter",
    handle: "@emilyCarter",
    about:
    "Lifestyle & wellness influencer sharing tips on healthy living, travel, and fashion. Partnered with brands like GlowSkincare and FitActive. Inspiring my 50K+ followers to live their best lives!",
    email: "sophia.collabs@influencermail.com",
    phone: "+1 (123) 456-7890"
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [aboutError, setAboutError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  // Dummy flag to simulate missing insurance
  const [insuranceMissing] = useState<boolean>(true);

  // For contract upload feature
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractError, setContractError] = useState<string>("");
  const [contractUploaded, setContractUploaded] = useState<boolean>(false);

  const handleFieldChange = useCallback(
    (field: keyof InfluencerProfile, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
      if (field === "about") {
        if (value.length > 500) {
          setAboutError("Error: Bio cannot exceed 500 characters.");
        } else {
          setAboutError("");
        }
      }
      if (field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setEmailError("Error: Please enter a valid email address.");
        } else {
          setEmailError("");
        }
      }
      if (field === "phone") {
        const phoneRegex = /^\+?[0-9\s()-]{7,}$/;
        if (!phoneRegex.test(value)) {
          setPhoneError("Error: Invalid phone number format.");
        } else {
          setPhoneError("");
        }
      }
    },
    []
  );

  return (
    <div className="p-6 font-work-sans">
      {/* Back to List Button */}
      <div className="mb-4 font-work-sans">
        <button
          onClick={() => router.push("/influencers/influencer-list")}
          className="bg-gray-500 text-white px-4 py-2 rounded font-work-sans"
          aria-label="Back to Influencer List">

          Back to List
        </button>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#333333] mb-4 font-sora">Influencer Safety</h1>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end mb-6 font-work-sans">
        <button
          onClick={() => alert("Influencer removed from records.")}
          className="w-[150px] h-[45px] bg-red-500 text-white rounded font-work-sans"
          aria-label="Remove Influencer">

          Remove Influencer
        </button>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label={isEditing ? "Save Profile" : "Edit Profile"}>

          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
        <button
          onClick={() => alert("Generating PDF report...")}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label="Download Report">

          Download Report
        </button>
        <button
          onClick={() => alert("Add to Campaign modal would open")}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label="Add to Campaign">

          Add to Campaign
        </button>
      </div>

      {/* Influencer Profile Header */}
      <div className="mb-6 font-work-sans">
        <h2 className="text-[22px] font-bold text-[#333333] font-sora">
          {profile.fullName} <span className="text-base text-gray-600 font-work-sans">{profile.handle}</span>
        </h2>
      </div>

      {/* About Me Section */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">About Me</h3>
        {isEditing ?
        <textarea
          value={profile.about}
          onChange={(e) => handleFieldChange("about", e.target.value)}
          className="w-full p-2 border rounded font-work-sans"
          maxLength={500}
          aria-label="Edit About Me section" /> :


        <p className="text-base text-gray-700 font-work-sans">{profile.about}</p>
        }
        {aboutError && <p className="text-red-500 font-work-sans">{aboutError}</p>}
      </div>

      {/* Contact Information */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">Contact Information</h3>
        <div className="space-y-4 font-work-sans">
          <div className="font-work-sans">
            <label className="block font-medium mb-1 font-work-sans">Email:</label>
            {isEditing ?
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="border p-2 rounded w-full font-work-sans"
              aria-label="Edit email address" /> :


            <p className="font-work-sans">{profile.email}</p>
            }
            {emailError && <p className="text-red-500 font-work-sans">{emailError}</p>}
          </div>
          <div className="font-work-sans">
            <label className="block font-medium mb-1 font-work-sans">Phone Number:</label>
            {isEditing ?
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="border p-2 rounded w-full font-work-sans"
              aria-label="Edit phone number" /> :


            <p className="font-work-sans">{profile.phone}</p>
            }
            {phoneError && <p className="text-red-500 font-work-sans">{phoneError}</p>}
          </div>
        </div>
      </div>

      {/* Audience Demographics with Responsive Charts */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">Audience Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-work-sans">
          <AgeDistributionChart />
          <GenderPieChart />
          <LocationBarChart />
        </div>
      </div>

      {/* Performance Metrics with Engagement Chart */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">Performance Metrics</h3>
        <div className="mb-4 font-work-sans">
          <p className="font-medium font-work-sans">Engagement Tracking:</p>
          <ul className="list-disc ml-6 font-work-sans">
            <li className="font-work-sans">Avg. Likes: 561</li>
            <li className="font-work-sans">Avg. Comments: 12</li>
            <li className="font-work-sans">Avg. Shares/Post: 3K</li>
          </ul>
        </div>
        <EngagementLineChart />
      </div>

      {/* Risk Factors & Security Checks */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">Risk Factors & Security Checks</h3>
        <ul className="list-disc ml-6 font-work-sans">
          <li className="font-work-sans">2-Factor Authentication: Enabled ✅</li>
          <li className="font-work-sans">Strong Password: Meets Standards ✅</li>
          <li className="font-work-sans">
            Protected by Insurance: Not Covered ❌{" "}
            {insuranceMissing &&
            <span className="ml-1 text-red-500 text-sm font-work-sans">
                Warning: Influencer is not covered by insurance.
              </span>
            }
          </li>
          <li className="font-work-sans">Next Risk Check Due: 7 Days</li>
        </ul>
      </div>

      {/* Campaign Associations */}
      <div className="mb-6 font-work-sans">
        <h3 className="text-xl font-semibold mb-2 font-sora">Campaign Associations</h3>
        <div className="mb-4 font-work-sans">
          <p className="font-medium font-work-sans">Active Campaigns:</p>
          <table className="min-w-full border mt-2">
            <thead>
              <tr>
                <th className="p-2 text-left font-bold border font-work-sans">Campaign Name</th>
                <th className="p-2 text-left font-bold border font-work-sans">Type</th>
                <th className="p-2 text-left font-bold border font-work-sans">Start Date</th>
                <th className="p-2 text-left font-bold border font-work-sans">End Date</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy campaign data */}
              <tr>
                <td className="p-2 border">Campaign 1</td>
                <td className="p-2 border">Social</td>
                <td className="p-2 border">2023-01-15</td>
                <td className="p-2 border">2023-02-15</td>
              </tr>
              <tr>
                <td className="p-2 border">Campaign 2</td>
                <td className="p-2 border">Digital</td>
                <td className="p-2 border">2023-03-01</td>
                <td className="p-2 border">2023-04-01</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Upload Contract Feature */}
        <div className="font-work-sans">
          <label className="block font-medium mb-1 font-work-sans">Upload Contract (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file) {
                if (file.type !== "application/pdf") {
                  setContractError("Error: Only PDF files are supported.");
                  setContractFile(null);
                  setContractUploaded(false);
                } else {
                  setContractError("");
                  setContractFile(file);
                  setContractUploaded(true);
                }
              }
            }}
            className="border p-2 rounded font-work-sans"
            aria-label="Upload contract file" />

          {contractError && <p className="text-red-500 mt-1 font-work-sans">{contractError}</p>}
          {contractUploaded &&
          <p className="text-green-500 mt-1 font-work-sans">
              {contractFile ? contractFile.name : "Contract uploaded!"}
            </p>
          }
        </div>
      </div>

      {/* Primary Action Buttons at Bottom */}
      <div className="flex flex-wrap gap-4 justify-end mb-6 font-work-sans">
        <button
          onClick={() => alert("Influencer removed from records.")}
          className="w-[150px] h-[45px] bg-red-500 text-white rounded font-work-sans"
          aria-label="Remove Influencer">

          Remove Influencer
        </button>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label={isEditing ? "Save Profile" : "Edit Profile"}>

          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
        <button
          onClick={() => alert("Generating PDF report...")}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label="Download Report">

          Download Report
        </button>
        <button
          onClick={() => alert("Add to Campaign modal would open")}
          className="w-[150px] h-[45px] bg-blue-500 text-white rounded font-work-sans"
          aria-label="Add to Campaign">

          Add to Campaign
        </button>
      </div>
    </div>);

};

// Main page component with Suspense boundary
export default function InfluencerProfilePage() {
  return (
    <Suspense fallback={<div className="font-work-sans">Loading...</div>}>
      <ProfileContent />
    </Suspense>);

}