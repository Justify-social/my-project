'use client';

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  UserIcon,
  CogIcon,
  CodeBracketIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) => (
  <div className="flex items-center mb-6">
    <div className="bg-blue-50 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div className="ml-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  </div>
);

const Accordion = ({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="border rounded-lg mb-2">
    <button
      className="w-full px-4 py-3 flex items-center justify-between text-left"
      onClick={onToggle}
    >
      <span className="font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDownIcon className="w-5 h-5" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-3 border-t"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Main Component
const HelpPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample Data
  const faqs: FAQItem[] = [
    {
      question: "What are the system requirements for optimal performance?",
      answer: "Our platform requires a modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+) and a stable internet connection (minimum 5Mbps). For computational tasks, we recommend a multi-core processor and at least 8GB RAM.",
      category: "Technical",
    },
    {
      question: "How does the AI-powered recommendation system work?",
      answer: "Our recommendation system uses a combination of collaborative filtering and content-based approaches. It employs a deep learning model trained on user interactions and content features, utilizing techniques like matrix factorization and neural collaborative filtering.",
      category: "AI & ML",
    },
    // Add more FAQs...
  ];

  const tutorials: TutorialVideo[] = [
    {
      id: "tut1",
      title: "Advanced Data Analysis Techniques",
      duration: "15:30",
      thumbnail: "/thumbnails/data-analysis.jpg",
      difficulty: "Advanced",
      tags: ["Data Science", "Analytics", "Python"],
    },
    {
      id: "tut2",
      title: "Implementing OAuth2 Authentication",
      duration: "12:45",
      thumbnail: "/thumbnails/oauth.jpg",
      difficulty: "Intermediate",
      tags: ["Security", "API", "Authentication"],
    },
    // Add more tutorials...
  ];

  const glossaryTerms: GlossaryTerm[] = [
    {
      term: "Neural Network",
      definition: "A computational model inspired by biological neural networks, consisting of interconnected nodes (neurons) that process and transmit information.",
      category: "Machine Learning",
      relatedTerms: ["Deep Learning", "Artificial Intelligence", "Backpropagation"],
      examples: [
        "Convolutional Neural Networks (CNN) for image processing",
        "Recurrent Neural Networks (RNN) for sequential data",
      ],
    },
    // Add more terms...
  ];

  // Effects
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        // Implement actual search logic here
        setSearchResults([
          {
            id: "1",
            title: "Getting Started Guide",
            content: "Complete guide to getting started with our platform...",
            section: "getting-started",
            relevance: 0.95,
          },
          // Add more results...
        ]);
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

  // Memoized filtered content
  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqs;
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to the Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive documentation, tutorials, and support resources to help you succeed
            </p>
          </motion.div>
      </div>

        {/* Search Section */}
        <Card className="mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation, FAQs, and tutorials..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-gray-600"
              >
                Searching...
              </motion.div>
            )}
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 space-y-2"
              >
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <h3 className="font-medium text-blue-600">{result.title}</h3>
                    <p className="text-sm text-gray-600">{result.content}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: RocketLaunchIcon, title: "Quick Start", link: "#getting-started" },
            { icon: QuestionMarkCircleIcon, title: "FAQs", link: "#faqs" },
            { icon: BookOpenIcon, title: "Documentation", link: "#documentation" },
            { icon: ChatBubbleLeftRightIcon, title: "Community", link: "#community" },
          ].map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <item.icon className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium">{item.title}</span>
            </motion.a>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <SectionHeader
              icon={BookOpenIcon}
              title="Documentation"
              description="Browse by topic"
            />
            <nav className="space-y-1">
              {[
                { id: "getting-started", icon: RocketLaunchIcon, title: "Getting Started" },
                { id: "technical-guides", icon: CommandLineIcon, title: "Technical Guides" },
                { id: "api-reference", icon: CpuChipIcon, title: "API Reference" },
                { id: "best-practices", icon: AcademicCapIcon, title: "Best Practices" },
                { id: "tutorials", icon: BeakerIcon, title: "Tutorials" },
                { id: "troubleshooting", icon: WrenchScrewdriverIcon, title: "Troubleshooting" },
              ].map(item => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-2 rounded-lg text-left ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.title}</span>
                  <ChevronRightIcon className="w-4 h-4 ml-auto" />
                </motion.button>
              ))}
            </nav>
          </Card>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Getting Started Section */}
            <Card>
              <SectionHeader
                icon={RocketLaunchIcon}
                title="Getting Started"
                description="Everything you need to begin your journey"
              />
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Platform Overview</h3>
                  <p className="text-gray-600">
                    Our platform combines cutting-edge technology with intuitive design to provide
                    a comprehensive solution for your needs. Here's what you need to know:
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start">
                      <CloudArrowUpIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-1" />
                      <span>Cloud-native architecture ensuring 99.9% uptime</span>
                    </li>
                    <li className="flex items-start">
                      <CpuChipIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-1" />
                      <span>AI-powered analytics and recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <BeakerIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-1" />
                      <span>Advanced data processing capabilities</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Start Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "1. Account Setup",
                        description: "Create and configure your account",
                        icon: UserIcon,
                      },
                      {
                        title: "2. Project Configuration",
                        description: "Set up your first project",
                        icon: CogIcon,
                      },
                      {
                        title: "3. API Integration",
                        description: "Integrate our APIs into your workflow",
                        icon: CodeBracketIcon,
                      },
                      {
                        title: "4. Data Migration",
                        description: "Import your existing data",
                        icon: ArrowPathIcon,
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <step.icon className="w-6 h-6 text-blue-600 mb-2" />
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Technical Documentation */}
            <Card>
              <SectionHeader
                icon={CommandLineIcon}
                title="Technical Documentation"
                description="Detailed technical specifications and guides"
              />
              <div className="space-y-6">
                {/* API Documentation */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">API Reference</h3>
                  <div className="bg-gray-900 rounded-lg p-4 text-white font-mono text-sm">
                    <pre>{`
// Example API Request
const response = await fetch('https://api.justify.social/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    data: yourData,
    options: {
      model: 'advanced',
      threshold: 0.85
    }
  })
});
                    `}</pre>
                  </div>
                </div>

                {/* Implementation Guides */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Implementation Guides</h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Authentication",
                        description: "Learn about our OAuth2 implementation and security best practices",
                        difficulty: "Intermediate",
                      },
                      {
                        title: "Data Processing",
                        description: "Understanding data pipelines and processing workflows",
                        difficulty: "Advanced",
                      },
                      {
                        title: "Error Handling",
                        description: "Comprehensive guide to error codes and handling",
                        difficulty: "Intermediate",
                      },
                    ].map((guide, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{guide.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            guide.difficulty === 'Advanced'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guide.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Interactive Tutorials */}
            <Card>
              <SectionHeader
                icon={AcademicCapIcon}
                title="Interactive Tutorials"
                description="Learn by doing with our hands-on tutorials"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tutorial, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="object-cover w-full h-full"
                      />
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        {tutorial.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-2">{tutorial.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tutorial.difficulty === 'Advanced'
                            ? 'bg-red-100 text-red-800'
                            : tutorial.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {tutorial.difficulty}
                        </span>
                        <div className="flex space-x-2">
                          {tutorial.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-xs text-gray-500"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* FAQ Section */}
            <Card>
              <SectionHeader
                icon={QuestionMarkCircleIcon}
                title="Frequently Asked Questions"
                description="Common questions and detailed answers"
              />
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Accordion
                    key={index}
                    title={faq.question}
                    isOpen={openAccordions.includes(`faq-${index}`)}
                    onToggle={() => toggleAccordion(`faq-${index}`)}
                  >
                    <div className="prose max-w-none">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </Accordion>
                ))}
              </div>
            </Card>

            {/* Glossary */}
            <Card>
              <SectionHeader
                icon={BookOpenIcon}
                title="Technical Glossary"
                description="Comprehensive definitions of technical terms"
              />
              <div className="space-y-6">
                {glossaryTerms.map((term, index) => (
                  <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                    <h4 className="font-medium text-lg mb-2">{term.term}</h4>
                    <p className="text-gray-600 mb-4">{term.definition}</p>
                    {term.examples && (
                      <div className="mb-4">
                        <h5 className="font-medium text-sm text-gray-500 mb-2">Examples:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {term.examples.map((example, exIndex) => (
                            <li key={exIndex}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.map((relatedTerm, rtIndex) => (
                        <span
                          key={rtIndex}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                        >
                          {relatedTerm}
                        </span>
                      ))}
                    </div>
          </div>
                ))}
          </div>
            </Card>

            {/* Support Options */}
            <Card>
              <SectionHeader
                icon={ChatBubbleLeftRightIcon}
                title="Support Options"
                description="Get help when you need it"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Community Support</h3>
                  <p className="text-gray-600">
                    Join our community of developers and experts to get help,
                    share knowledge, and collaborate.
                  </p>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Join Community
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </motion.a>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Premium Support</h3>
                  <p className="text-gray-600">
                    Get priority support from our dedicated team of experts
                    with guaranteed response times.
                  </p>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Contact Support
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                  </motion.a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
