'use client';

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';

// Types
interface SearchResult {
  id: string;
  title: string;
  content: string;
  section: string;
  relevance: number;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  examples?: string[];
}

// Reusable Components
const Accordion = ({
  title,
  children,
  isOpen,
  onToggle,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
    <button
      className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
      onClick={onToggle}
    >
      <span className="font-medium text-sm sm:text-base">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0"
      >
        {isOpen ? (
          <Icon name="close" className="w-5 h-5 text-gray-500" />
        ) : (
          <Icon name="plus" className="w-5 h-5 text-gray-500" />
        )}
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-3 border-t border-gray-200 bg-white"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Badge = ({ children, color = "blue" }: { children: React.ReactNode; color?: string }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  }[color] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
      {children}
    </span>
  );
};

// Main Component
const HelpPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("glossary");
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(true);

  // Justify-specific FAQ Data
  const faqs: FAQItem[] = [
    {
      question: "What is Justify and how does it help my brand?",
      answer: "Justify is an influencer marketing analytics platform that helps brands measure, understand, and optimize their influencer campaigns. Our platform combines advanced AI with comprehensive analytics to provide actionable insights about your influencer marketing efforts, helping you improve ROI and make data-driven decisions.",
      category: "General",
    },
    {
      question: "How do I set up my first campaign study?",
      answer: "To set up your first campaign study, navigate to the 'Studies' section in your dashboard and click 'Create New Study'. Follow the guided workflow to define your campaign parameters, upload your creative assets, and set your measurement goals. Our system will then analyze the performance and provide detailed insights within 24-48 hours depending on your plan tier.",
      category: "Getting Started",
    },
    {
      question: "What social media platforms does Justify support?",
      answer: "Justify supports comprehensive analytics for Instagram, TikTok, YouTube, Facebook, and LinkedIn. Our platform can analyze content, audience engagement, and campaign performance across all these platforms, providing unified insights regardless of where your influencer marketing campaigns are running.",
      category: "Platform Features",
    },
    {
      question: "How accurate is Justify's Brand Lift measurement?",
      answer: "Our Brand Lift measurement has been validated to be 95% accurate compared to traditional survey methods. We use a combination of control group analysis, AI-powered sentiment analysis, and engagement metrics to measure real changes in brand perception. Our methodology has been verified by independent marketing research firms and consistently provides reliable results across industries.",
      category: "Analytics",
    },
    {
      question: "What's the difference between Creative Testing and Brand Lift studies?",
      answer: "Creative Testing focuses on analyzing which content elements (visuals, messaging, calls-to-action) perform best with your audience, helping you optimize future content. Brand Lift studies measure changes in brand awareness, perception, and consideration before and after campaigns, demonstrating the actual impact on your brand metrics. While Creative Testing helps optimize content, Brand Lift shows the broader business impact of your campaigns.",
      category: "Studies",
    },
    {
      question: "How does the Influencer Safety feature protect my brand?",
      answer: "Influencer Safety provides comprehensive risk assessment for creators you're considering working with. It analyzes historical content, audience authenticity, potential controversial topics, and alignment with brand values. The system flags potential issues before you commit to partnerships, protecting your brand from association with inappropriate content or fake followers, and ensuring your partnerships align with your brand safety requirements.",
      category: "Safety",
    },
    {
      question: "Can I integrate Justify with my existing marketing tools?",
      answer: "Yes, Justify offers robust API integrations with major marketing platforms including Google Analytics, Adobe Analytics, Salesforce, HubSpot, and most major social media management tools. We also support custom data imports from CSV files and direct database connections for enterprise customers. Our Developer Hub provides detailed documentation for implementing custom integrations.",
      category: "Technical",
    },
    {
      question: "What reports can I generate with Justify?",
      answer: "Justify offers a wide range of customizable reports including Campaign Performance, ROI Analysis, Audience Insights, Content Effectiveness, Brand Sentiment, Competitive Benchmarking, and Cross-Platform Comparison reports. All reports can be customized, scheduled for automatic delivery, and exported in multiple formats (PDF, Excel, Google Sheets, PowerPoint) to seamlessly fit into your reporting workflow.",
      category: "Reports",
    },
  ];

  // Justify-specific Tutorial Data
  const tutorials: TutorialVideo[] = [
    {
      id: "tut1",
      title: "Setting Up Your First Brand Lift Study",
      duration: "08:45",
      thumbnail: "/thumbnails/brand-lift-study.jpg",
      difficulty: "Beginner",
      tags: ["Brand Lift", "Analytics", "Getting Started"],
    },
    {
      id: "tut2",
      title: "Advanced Creative Testing Strategies",
      duration: "12:30",
      thumbnail: "/thumbnails/creative-testing.jpg",
      difficulty: "Intermediate",
      tags: ["Creative Testing", "Optimization", "Content Strategy"],
    },
    {
      id: "tut3",
      title: "Measuring Cross-Platform Campaign Performance",
      duration: "15:20",
      thumbnail: "/thumbnails/cross-platform.jpg",
      difficulty: "Intermediate",
      tags: ["Analytics", "Multi-platform", "Reporting"],
    },
    {
      id: "tut4",
      title: "Interpreting Your MMM Analysis Results",
      duration: "18:15",
      thumbnail: "/thumbnails/mmm-analysis.jpg",
      difficulty: "Advanced",
      tags: ["MMM", "ROI", "Budget Allocation"],
    },
  ];

  // Justify-specific Glossary Terms
  const glossaryTerms: GlossaryTerm[] = [
    {
      term: "Brand Lift",
      definition: "The measurable increase in brand awareness, perception, or consideration that results from marketing campaigns. Justify measures this through comparative analysis of control and exposed audience groups.",
      category: "Analytics",
      relatedTerms: ["Brand Awareness", "Brand Consideration", "Attribution"],
      examples: [
        "25% increase in brand awareness among users exposed to influencer content",
        "12% lift in purchase consideration after TikTok campaign"
      ],
    },
    {
      term: "Creative Testing",
      definition: "The process of analyzing multiple creative approaches to determine which elements and strategies perform best with target audiences. Justify's creative testing provides detailed breakdowns of content performance factors.",
      category: "Content Strategy",
      relatedTerms: ["A/B Testing", "Content Performance", "Creative Optimization"],
      examples: [
        "Testing different visual styles across influencer partnerships",
        "Analyzing which call-to-action generates highest engagement"
      ],
    },
    {
      term: "MMM (Marketing Mix Modeling)",
      definition: "An advanced statistical analysis technique that quantifies the impact of various marketing activities on sales or conversions. Justify's MMM Analysis helps determine optimal budget allocation across channels and campaigns.",
      category: "Advanced Analytics",
      relatedTerms: ["Attribution Modeling", "ROI Measurement", "Budget Optimization"],
      examples: [
        "Determining that influencer marketing drives 35% more conversions than paid social",
        "Identifying optimal spending ratio between different campaign types"
      ],
    },
    {
      term: "Influencer Safety",
      definition: "A comprehensive risk assessment process for evaluating creators before partnership. Includes content analysis, audience authenticity verification, and alignment with brand values.",
      category: "Brand Protection",
      relatedTerms: ["Brand Safety", "Risk Assessment", "Audience Authentication"],
      examples: [
        "Flagging creators with significant fake followers before campaign launch",
        "Identifying potential controversial content in creator's history"
      ],
    },
  ];

  // Effects
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        // Search logic implementation
        const results: SearchResult[] = [
          ...faqs.filter(faq => 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((faq, index) => ({
            id: `faq-${index}`,
            title: faq.question,
            content: faq.answer.substring(0, 100) + "...",
            section: "faqs",
            relevance: 0.95,
          })),
          ...glossaryTerms.filter(term => 
            term.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
            term.definition.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((term, index) => ({
            id: `glossary-${index}`,
            title: term.term,
            content: term.definition.substring(0, 100) + "...",
            section: "glossary",
            relevance: 0.90,
          })),
          ...tutorials.filter(tutorial => 
            tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          ).map((tutorial, index) => ({
            id: `tutorial-${index}`,
            title: tutorial.title,
            content: `${tutorial.difficulty} level tutorial (${tutorial.duration})`,
            section: "tutorials",
            relevance: 0.85,
          })),
        ];
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Handlers
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Filtered content based on search
  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqs;
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, faqs]);

  // Content rendering based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "faq":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            {filteredFAQs.map((faq, index) => (
              <Accordion
                key={`faq-${index}`}
                title={faq.question}
                isOpen={openAccordions.includes(`faq-${index}`)}
                onToggle={() => toggleAccordion(`faq-${index}`)}
              >
                <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
              </Accordion>
            ))}
          </div>
        );
      case "tutorials":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial, index) => (
                <div key={`tutorial-${index}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={tutorial.thumbnail || "https://via.placeholder.com/640x360/f3f4f6/94a3b8?text=Justify+Tutorial"}
                      alt={tutorial.title}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs">
                      {tutorial.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2 text-sm sm:text-base line-clamp-2">{tutorial.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge color={
                        tutorial.difficulty === 'Advanced' ? 'red' :
                        tutorial.difficulty === 'Intermediate' ? 'yellow' : 'green'
                      }>
                        {tutorial.difficulty}
                      </Badge>
                      <button className="text-sm text-[var(--accent-color)] hover:underline">Watch</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "glossary":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Influencer Marketing Glossary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {glossaryTerms.map((term, index) => (
                <div key={`glossary-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-[var(--accent-color)] text-sm sm:text-base">{term.term}</h3>
                  <p className="text-gray-600 mb-3 text-xs sm:text-sm">{term.definition}</p>
                  <div className="flex flex-wrap gap-2">
                    {term.relatedTerms.slice(0, 2).map((relatedTerm, rtIndex) => (
                      <Badge key={rtIndex} color="blue">{relatedTerm}</Badge>
                    ))}
                    {term.relatedTerms.length > 2 && (
                      <Badge color="blue">+{term.relatedTerms.length - 2} more</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "contact":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Icon name="info" className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <h3 className="font-medium mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-4">Available Mon-Fri, 9am-6pm ET</p>
                <a href="tel:+18005551234" className="text-[var(--accent-color)] font-medium hover:underline">+1 (800) 555-1234</a>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Icon name="mail" className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <h3 className="font-medium mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm mb-4">We'll respond within 24 hours</p>
                <a href="mailto:support@justify.com" className="text-[var(--accent-color)] font-medium hover:underline">support@justify.com</a>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Icon name="chatBubble" className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-4">Chat with our support team</p>
                <button className="text-[var(--accent-color)] font-medium hover:underline">Start Chat</button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            {filteredFAQs.slice(0, 5).map((faq, index) => (
              <Accordion
                key={`faq-${index}`}
                title={faq.question}
                isOpen={openAccordions.includes(`faq-${index}`)}
                onToggle={() => toggleAccordion(`faq-${index}`)}
              >
                <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
              </Accordion>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Matching the screenshot */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                activeTab === "faq" 
                  ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]" 
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <Icon name="info" className="w-5 h-5 mr-2" />
              <span className="text-sm">FAQs</span>
            </button>
            <button
              onClick={() => setActiveTab("tutorials")}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                activeTab === "tutorials" 
                  ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]" 
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <Icon name="info" className="w-5 h-5 mr-2" />
              <span className="text-sm">Tutorials</span>
            </button>
            <button
              onClick={() => setActiveTab("glossary")}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                activeTab === "glossary" 
                  ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]" 
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <Icon name="bookmark" className="w-5 h-5 mr-2" />
              <span className="text-sm">Glossary</span>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center justify-center p-3 rounded-lg border ${
                activeTab === "contact" 
                  ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)]" 
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <Icon name="chatBubble" className="w-5 h-5 mr-2" />
              <span className="text-sm">Contact</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header for Both Mobile and Desktop */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2 font-sora">
            How can we help?
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Icon name="close" className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto mb-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-gray-900">
                  {searchResults.length} results for "{searchQuery}"
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {result.section === "faqs" && (
                          <Icon name="info" className="w-5 h-5 text-[var(--accent-color)]" />
                        )}
                        {result.section === "glossary" && (
                          <Icon name="bookmark" className="w-5 h-5 text-[var(--accent-color)]" />
                        )}
                        {result.section === "tutorials" && (
                          <Icon name="info" className="w-5 h-5 text-[var(--accent-color)]" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900 text-sm">{result.title}</h3>
                        <p className="text-gray-600 text-xs mt-1">{result.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Help Topics</h2>
              </div>
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`w-full flex items-center px-4 py-2 rounded-md mb-1 text-left ${
                    activeTab === "faq"
                      ? "bg-blue-50 text-[var(--accent-color)]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name="info" className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">FAQs</span>
                </button>
                <button
                  onClick={() => setActiveTab("tutorials")}
                  className={`w-full flex items-center px-4 py-2 rounded-md mb-1 text-left ${
                    activeTab === "tutorials"
                      ? "bg-blue-50 text-[var(--accent-color)]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name="info" className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">Video Tutorials</span>
                </button>
                <button
                  onClick={() => setActiveTab("glossary")}
                  className={`w-full flex items-center px-4 py-2 rounded-md mb-1 text-left ${
                    activeTab === "glossary"
                      ? "bg-blue-50 text-[var(--accent-color)]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name="bookmark" className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">Glossary</span>
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`w-full flex items-center px-4 py-2 rounded-md mb-1 text-left ${
                    activeTab === "contact"
                      ? "bg-blue-50 text-[var(--accent-color)]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name="chatBubble" className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">Contact Support</span>
                </button>
              </nav>
              
              <div className="p-4 mt-4 bg-blue-50 mx-4 mb-4 rounded-lg">
                <h3 className="font-medium text-[var(--accent-color)] text-sm mb-2">Need more help?</h3>
                <p className="text-gray-600 text-xs mb-3">Our support team is ready to assist you with any questions.</p>
                <a 
                  href="/support" 
                  className="text-xs font-medium text-[var(--accent-color)] hover:underline flex items-center"
                >
                  Contact us
                  <Icon name="share" className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderContent()}
            </div>
            
            {/* Quick Links Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/getting-started">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="star" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">Getting Started</h3>
                    <p className="text-gray-600 text-xs">Set up your account and first campaign</p>
                  </div>
                </Link>
                <Link href="/analytics-guide">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="view" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">Analytics Guide</h3>
                    <p className="text-gray-600 text-xs">Understand your campaign performance</p>
                  </div>
                </Link>
                <Link href="/creators">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="user" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">Creator Management</h3>
                    <p className="text-gray-600 text-xs">Find and manage your influencer partnerships</p>
                  </div>
                </Link>
                <Link href="/reports">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="info" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">Report Templates</h3>
                    <p className="text-gray-600 text-xs">Ready-to-use report templates for stakeholders</p>
                  </div>
                </Link>
                <Link href="/brand-safety">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="check" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">Brand Safety</h3>
                    <p className="text-gray-600 text-xs">Protect your brand with creator verification</p>
                  </div>
                </Link>
                <Link href="/platform-updates">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <Icon name="star" className="w-6 h-6 text-[var(--accent-color)] mb-2" />
                    <h3 className="font-medium text-sm mb-1">What's New</h3>
                    <p className="text-gray-600 text-xs">Latest platform features and updates</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 py-3 border-t border-gray-200 bg-white max-h-[65px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Can't find what you're looking for? <a href="/contact" className="text-[var(--accent-color)] font-medium hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
