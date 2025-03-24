"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon';
interface Question {
  id: string;
  title: string;
  type: 'Multiple Choice' | 'Single Choice';
  kpi: string;
  options: Array<{
    id: string;
    text: string;
    image?: string | null;
  }>;
  isRandomized?: boolean;
  isMandatory?: boolean;
}
interface QuestionOption {
  id: string;
  text: string;
  image?: string | null;
}
interface GiphyResult {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
    };
  };
}

// Add the DragItem interface
interface DragItem {
  index: number;
  id: string;
  type: string;
  questionId?: string; // Added for option dragging
}

// Add KPI tooltip information based on Step-2 file
interface KpiInfo {
  key: string;
  title: string;
  definition: string;
  example: string;
  icon: string;
}

// Define the KPI information similar to Step-2
const kpiDefinitions: KpiInfo[] = [{
  key: "adRecall",
  title: "Ad Recall",
  definition: "The percentage of people who remember seeing your advertisement.",
  example: "After a week, 60% of viewers can recall your ad's main message.",
  icon: "/KPIs/Ad_Recall.svg"
}, {
  key: "brandAwareness",
  title: "Brand Awareness",
  definition: "The increase in recognition of your brand.",
  example: "Your brand name is recognised by 30% more people after the campaign.",
  icon: "/KPIs/Brand_Awareness.svg"
}, {
  key: "consideration",
  title: "Consideration",
  definition: "The percentage of people considering purchasing from your brand.",
  example: "25% of your audience considers buying your product after seeing your campaign.",
  icon: "/KPIs/Consideration.svg"
}, {
  key: "messageAssociation",
  title: "Message Association",
  definition: "How well people link your key messages to your brand.",
  example: "When hearing your slogan, 70% of people associate it directly with your brand.",
  icon: "/KPIs/Message_Association.svg"
}, {
  key: "brandPreference",
  title: "Brand Preference",
  definition: "Preference for your brand over competitors.",
  example: "40% of customers prefer your brand when choosing between similar products.",
  icon: "/KPIs/Brand_Preference.svg"
}, {
  key: "purchaseIntent",
  title: "Purchase Intent",
  definition: "Likelihood of purchasing your product or service.",
  example: "50% of viewers intend to buy your product after seeing the ad.",
  icon: "/KPIs/Purchase_Intent.svg"
}, {
  key: "actionIntent",
  title: "Action Intent",
  definition: "Likelihood of taking a specific action related to your brand.",
  example: "35% of people are motivated to visit your website after the campaign.",
  icon: "/KPIs/Action_Intent.svg"
}, {
  key: "recommendationIntent",
  title: "Recommendation Intent",
  definition: "Likelihood of recommending your brand to others.",
  example: "45% of customers are willing to recommend your brand to friends and family.",
  icon: "/KPIs/Brand_Preference.svg"
}, {
  key: "advocacy",
  title: "Advocacy",
  definition: "Willingness to actively promote your brand.",
  example: "20% of your customers regularly share your brand on social media or write positive reviews.",
  icon: "/KPIs/Advocacy.svg"
}];
export default function SurveyDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  // Sample questions based on Figma design
  const [questions, setQuestions] = useState<Question[]>([{
    id: '1',
    title: 'how would you rate our brand awareness campaign?',
    type: 'Multiple Choice',
    kpi: 'Brand Awareness',
    options: [{
      id: '1-1',
      text: 'very effective',
      image: 'https://media1.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif'
    }, {
      id: '1-2',
      text: 'somewhat effective',
      image: 'https://media2.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif'
    }, {
      id: '1-3',
      text: 'not effective',
      image: 'https://media3.giphy.com/media/3oAt21Fnr4i54uK8vK/giphy.gif'
    }]
  }, {
    id: '2',
    title: 'which of our advertisements do you recall seeing?',
    type: 'Multiple Choice',
    kpi: 'Ad Recall',
    options: [{
      id: '2-1',
      text: 'product billboard',
      image: 'https://media1.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif'
    }, {
      id: '2-2',
      text: 'social media ad',
      image: 'https://media2.giphy.com/media/l0K4n42JVSqqUvAQg/giphy.gif'
    }, {
      id: '2-3',
      text: 'TV commercial',
      image: 'https://media0.giphy.com/media/3o7rc0qU6m5hneMsuc/giphy.gif'
    }, {
      id: '2-4',
      text: 'none of the above',
      image: 'https://media3.giphy.com/media/l4pLY0zySvluEvr0c/giphy.gif'
    }]
  }, {
    id: '3',
    title: 'how did the ad make you feel about the brand?',
    type: 'Single Choice',
    kpi: 'Brand Awareness',
    options: [{
      id: '3-1',
      text: 'very positive',
      image: 'https://media1.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
    }, {
      id: '3-2',
      text: 'somewhat positive',
      image: 'https://media2.giphy.com/media/l0MYyDa8S9ghzNebm/giphy.gif'
    }, {
      id: '3-3',
      text: 'neutral',
      image: 'https://media3.giphy.com/media/9G1wY9Ipd8o7u/giphy.gif'
    }, {
      id: '3-4',
      text: 'somewhat negative',
      image: 'https://media1.giphy.com/media/l2JhpjWPccQhsAMfu/giphy.gif'
    }, {
      id: '3-5',
      text: 'very negative',
      image: 'https://media4.giphy.com/media/l1KVaj5UcbHwrBMqI/giphy.gif'
    }]
  }, {
    id: '4',
    title: 'how likely are you to choose this brand over others based on the ad?',
    type: 'Single Choice',
    kpi: 'Brand Preference',
    options: [{
      id: '4-1',
      text: 'very likely',
      image: 'https://media2.giphy.com/media/3oriO13KTkzPwTykp2/giphy.gif'
    }, {
      id: '4-2',
      text: 'somewhat likely',
      image: 'https://media3.giphy.com/media/l0HlQXkq1fhBYJ7Gg/giphy.gif'
    }, {
      id: '4-3',
      text: 'neutral',
      image: 'https://media0.giphy.com/media/xT1XGVp95GDPgFYmUE/giphy.gif'
    }, {
      id: '4-4',
      text: 'somewhat unlikely',
      image: 'https://media1.giphy.com/media/l0HlR8p1q4oRKUSA0/giphy.gif'
    }, {
      id: '4-5',
      text: 'very unlikely',
      image: 'https://media4.giphy.com/media/l0HlMZrXA2H7nbJm0/giphy.gif'
    }]
  }, {
    id: '5',
    title: 'what would be your next step after seeing this ad?',
    type: 'Single Choice',
    kpi: 'Action Intent',
    options: [{
      id: '5-1',
      text: 'look up more information about the product',
      image: 'https://media2.giphy.com/media/l0HlOBZcl7sbV6LnO/giphy.gif'
    }, {
      id: '5-2',
      text: 'visit the brand website',
      image: 'https://media0.giphy.com/media/3oKIPzLXQYb2Bn5PLG/giphy.gif'
    }, {
      id: '5-3',
      text: 'follow the brand on social media',
      image: 'https://media3.giphy.com/media/l0HlPwMAzh13pcZ20/giphy.gif'
    }, {
      id: '5-4',
      text: 'consider purchasing the product',
      image: 'https://media1.giphy.com/media/l0MYyoYPFfVqNEhPO/giphy.gif'
    }, {
      id: '5-5',
      text: 'nothing/continue browsing',
      image: 'https://media4.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif'
    }]
  }, {
    id: '6',
    title: 'which message from our campaign resonated most with you?',
    type: 'Single Choice',
    kpi: 'Message Association',
    options: [{
      id: '6-1',
      text: 'product quality',
      image: 'https://media2.giphy.com/media/l2SpYDOZm4T0ZvHmU/giphy.gif'
    }, {
      id: '6-2',
      text: 'price value',
      image: 'https://media3.giphy.com/media/d3mlXPjoK1ROfqOA/giphy.gif'
    }, {
      id: '6-3',
      text: 'brand story',
      image: 'https://media1.giphy.com/media/l2SpZulF0wIqUwj5K/giphy.gif'
    }, {
      id: '6-4',
      text: 'social responsibility',
      image: 'https://media4.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
    }, {
      id: '6-5',
      text: 'innovation',
      image: 'https://media0.giphy.com/media/3o7TKSha51ATTx9TSU/giphy.gif'
    }]
  }, {
    id: '7',
    title: 'how would you describe our brand to someone else after seeing the ad?',
    type: 'Multiple Choice',
    kpi: 'Brand Awareness',
    options: [{
      id: '7-1',
      text: 'innovative',
      image: 'https://media1.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif'
    }, {
      id: '7-2',
      text: 'trustworthy',
      image: 'https://media2.giphy.com/media/3o7TKT5Vnr62wFCXxS/giphy.gif'
    }, {
      id: '7-3',
      text: 'premium',
      image: 'https://media3.giphy.com/media/3o7TKN9IUHHFXWyZi0/giphy.gif'
    }, {
      id: '7-4',
      text: 'value-focused',
      image: 'https://media4.giphy.com/media/3o7TKSjpQfVgjgLlwk/giphy.gif'
    }, {
      id: '7-5',
      text: 'sustainable',
      image: 'https://media0.giphy.com/media/3o7TKP9ln2Dr6ze6f6/giphy.gif'
    }]
  }, {
    id: '8',
    title: 'how likely are you to recommend our brand to friends or family?',
    type: 'Single Choice',
    kpi: 'Recommendation Intent',
    options: [{
      id: '8-1',
      text: 'extremely likely',
      image: 'https://media1.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif'
    }, {
      id: '8-2',
      text: 'very likely',
      image: 'https://media2.giphy.com/media/3o7TKurSpGfaXjxPAA/giphy.gif'
    }, {
      id: '8-3',
      text: 'somewhat likely',
      image: 'https://media3.giphy.com/media/3o7TKzIrYZ0YQfRTBm/giphy.gif'
    }, {
      id: '8-4',
      text: 'not very likely',
      image: 'https://media4.giphy.com/media/l1KcPvDsU6Sje5se4/giphy.gif'
    }, {
      id: '8-5',
      text: 'not at all likely',
      image: 'https://media0.giphy.com/media/26xBI0gFPcbHa4p8c/giphy.gif'
    }]
  }, {
    id: '9',
    title: 'what aspect of our brand most influences your purchase decision?',
    type: 'Single Choice',
    kpi: 'Purchase Intent',
    options: [{
      id: '9-1',
      text: 'product features',
      image: 'https://media1.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif'
    }, {
      id: '9-2',
      text: 'brand reputation',
      image: 'https://media2.giphy.com/media/l0ExncehJzexFpRHq/giphy.gif'
    }, {
      id: '9-3',
      text: 'price',
      image: 'https://media3.giphy.com/media/xT39D2A6TB8Y05RlHW/giphy.gif'
    }, {
      id: '9-4',
      text: 'customer reviews',
      image: 'https://media4.giphy.com/media/3o7TKMt1HEOdTufTUc/giphy.gif'
    }, {
      id: '9-5',
      text: 'friend recommendations',
      image: 'https://media0.giphy.com/media/l0HlQSwsHpBJ7V5RK/giphy.gif'
    }]
  }, {
    id: '10',
    title: 'how does our brand compare to competitors you\'ve used?',
    type: 'Single Choice',
    kpi: 'Brand Preference',
    options: [{
      id: '10-1',
      text: 'much better',
      image: 'https://media1.giphy.com/media/l46CimW38a7TFxLVe/giphy.gif'
    }, {
      id: '10-2',
      text: 'somewhat better',
      image: 'https://media2.giphy.com/media/3oKIPsx2VAYAgEHC12/giphy.gif'
    }, {
      id: '10-3',
      text: 'about the same',
      image: 'https://media3.giphy.com/media/xT1XGEyW6Ra9TMA1Fe/giphy.gif'
    }, {
      id: '10-4',
      text: 'somewhat worse',
      image: 'https://media4.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif'
    }, {
      id: '10-5',
      text: 'much worse',
      image: 'https://media0.giphy.com/media/l46CiWmS9N5TJsm5O/giphy.gif'
    }]
  }]);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    type: 'Multiple Choice' as 'Multiple Choice' | 'Single Choice',
    options: [{
      id: '1',
      text: '',
      image: null as string | null
    }]
  });
  const [questionKpi, setQuestionKpi] = useState('Brand Awareness');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [giphySearchTerm, setGiphySearchTerm] = useState('');
  const [giphyResults, setGiphyResults] = useState<GiphyResult[]>([]);
  const [showGiphyModal, setShowGiphyModal] = useState(false);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    '1': true
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const dragItem = useRef<DragItem | null>(null);
  const dragOverItem = useRef<DragItem | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [showKpiTooltip, setShowKpiTooltip] = useState<string | null>(null);
  const [isRandomized, setIsRandomized] = useState(false);
  const [isMandatory, setIsMandatory] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const dragItemOption = useRef<DragItem | null>(null);
  const dragOverItemOption = useRef<DragItem | null>(null);
  const [selectedKpi, setSelectedKpi] = useState('');

  // Function to toggle question expansion
  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Function to handle drag start
  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragItem.current = {
      index,
      id,
      type: 'question'
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    // Add opacity and scale effect for visual feedback
    e.currentTarget.classList.add('opacity-70', 'transition-all', 'duration-200');

    // Add a ghost image that better represents the dragged item
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);

    // Remove the clone after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Function to handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-70', 'transition-all', 'duration-200');
    e.currentTarget.classList.add('transition-all', 'duration-300');
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Function to handle drag over
  const handleDragOver = (e: React.DragEvent, index: number, id: string) => {
    e.preventDefault();

    // Highlight the drop target
    if (dragOverItem.current?.id !== id) {
      e.currentTarget.classList.add('bg-gray-50', 'transition-all', 'duration-200');
    }
    dragOverItem.current = {
      index,
      id,
      type: 'question'
    };
  };

  // Add a new function for drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-50', 'transition-all', 'duration-200');
  };

  // Function to handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current && dragOverItem.current) {
      const dragItemIndex = dragItem.current.index;
      const dragOverItemIndex = dragOverItem.current.index;
      if (dragItemIndex === dragOverItemIndex) return;
      const updatedQuestions = [...questions];
      const draggedItem = updatedQuestions[dragItemIndex];

      // Remove the dragged item
      updatedQuestions.splice(dragItemIndex, 1);
      // Insert it at the new position
      updatedQuestions.splice(dragOverItemIndex, 0, draggedItem);
      setQuestions(updatedQuestions);
    }
  };

  // Function to handle edit question
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);

    // Load the question data into the form
    setNewQuestion({
      title: question.title,
      type: question.type,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        image: option.image || null
      }))
    });
    setQuestionKpi(question.kpi);

    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Function to handle delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Effect to clear editing state when form is submitted
  useEffect(() => {
    if (editingQuestion) {
      // Add a class to highlight the form
      const formElement = document.querySelector('.question-builder-form');
      if (formElement) {
        formElement.classList.add('editing-mode');
      }
    }
    return () => {
      const formElement = document.querySelector('.question-builder-form');
      if (formElement) {
        formElement.classList.remove('editing-mode');
      }
    };
  }, [editingQuestion]);

  // Add a new option to the question
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, {
        id: (newQuestion.options.length + 1).toString(),
        text: '',
        image: null as string | null
      }]
    });
  };

  // Remove an option from the question
  const removeOption = (id: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((option) => option.id !== id)
    });
  };

  // Update option text
  const updateOptionText = (id: string, text: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map((option) => option.id === id ? {
        ...option,
        text
      } : option)
    });
  };

  // Open Giphy modal for an option
  const openGiphyModal = (index: number) => {
    setCurrentOptionIndex(index);
    setShowGiphyModal(true);
    if (giphyResults.length === 0) {
      searchGiphy('happy'); // Default search to show some initial results
    }
  };

  // Search Giphy API
  const searchGiphy = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(term)}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch GIFs');
      }
      const data = await response.json();
      setGiphyResults(data.data);
    } catch (error) {
      console.error('Error searching Giphy:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a GIF for the current option
  const selectGif = (gifUrl: string) => {
    // If we're editing an existing question (from the questions list)
    if (currentQuestion) {
      const updatedQuestions = questions.map((q) => {
        if (q.id === currentQuestion.id) {
          const updatedOptions = [...q.options];
          if (updatedOptions[currentOptionIndex]) {
            updatedOptions[currentOptionIndex] = {
              ...updatedOptions[currentOptionIndex],
              image: gifUrl
            };
          }
          return {
            ...q,
            options: updatedOptions
          };
        }
        return q;
      });
      setQuestions(updatedQuestions);
      setCurrentQuestion(null); // Reset after selection
    } else {
      // If we're creating/editing a question in the form
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.map((option, index) => index === currentOptionIndex ? {
          ...option,
          image: gifUrl
        } : option)
      });
    }

    // Close the modal in both cases
    setShowGiphyModal(false);
  };

  // Remove image from option
  const removeImage = (id: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map((option) => option.id === id ? {
        ...option,
        image: null
      } : option)
    });
  };
  const handlePreview = () => {
    router.push(`/brand-lift/survey-preview?id=${campaignId}`);
  };

  // Update handleAddQuestion to support editing mode
  const handleAddQuestion = () => {
    if (!newQuestion.title) {
      alert('Please add a question title');
      return;
    }
    if (newQuestion.options.length < 2) {
      alert('Please add at least two answer options');
      return;
    }

    // If we're editing a question, update it instead of adding a new one
    if (editingQuestion) {
      const updatedQuestions = questions.map((q) => q.id === editingQuestion.id ? {
        ...q,
        title: newQuestion.title,
        type: newQuestion.type,
        kpi: questionKpi,
        options: newQuestion.options.map((option) => ({
          id: option.id,
          text: option.text || 'Option',
          image: option.image
        })),
        isRandomized: isRandomized,
        isMandatory: isMandatory
      } : q);
      setQuestions(updatedQuestions);
      setEditingQuestion(null);
    } else {
      // Add a new question
      const newQuestionWithId = {
        id: (questions.length + 1).toString(),
        title: newQuestion.title,
        type: newQuestion.type,
        kpi: questionKpi,
        options: newQuestion.options.map((option) => ({
          id: option.id,
          text: option.text || 'Option',
          image: option.image
        })),
        isRandomized: isRandomized,
        isMandatory: isMandatory
      };
      setQuestions([...questions, newQuestionWithId]);
    }

    // Reset form
    handleClearForm();
  };

  // Clear the form
  const handleClearForm = () => {
    setNewQuestion({
      title: '',
      type: 'Multiple Choice' as 'Multiple Choice' | 'Single Choice',
      options: [{
        id: '1',
        text: '',
        image: null as string | null
      }]
    });
    setQuestionKpi('Brand Awareness');
    setEditingQuestion(null);
  };

  // Function to toggle options menu
  const toggleOptionsMenu = (questionId: string | null) => {
    setShowOptionsMenu(questionId === showOptionsMenu ? null : questionId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Function to handle answer selection
  const toggleAnswerSelection = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => {
      const questionType = questions.find((q) => q.id === questionId)?.type;

      // If single choice, replace the selection
      if (questionType === 'Single Choice') {
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }

      // If multiple choice, toggle the selection
      const currentSelections = prev[questionId] || [];
      const newSelections = currentSelections.includes(optionId) ? currentSelections.filter((id) => id !== optionId) : [...currentSelections, optionId];
      return {
        ...prev,
        [questionId]: newSelections
      };
    });
  };

  // Function to check if an option is selected
  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const selections = selectedAnswers[questionId] || [];
    return selections.includes(optionId);
  };

  // Function to toggle KPI tooltip
  const toggleKpiTooltip = (kpi: string | null) => {
    setShowKpiTooltip(kpi === showKpiTooltip ? null : kpi);
  };

  // Add tooltip position state
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0
  });

  // Function to update tooltip position
  const updateTooltipPosition = (e: React.MouseEvent) => {
    setTooltipPosition({
      x: e.clientX + 10,
      // Offset from cursor
      y: e.clientY + 10
    });
  };

  // Function to get KPI information by name
  const getKpiInfo = (kpiName: string): KpiInfo | undefined => {
    // Convert the displayed KPI name to a key format (e.g., "Brand Awareness" -> "brandAwareness")
    const formattedKey = kpiName.toLowerCase().replace(/\s+/g, ' ').split(' ').map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('');
    return kpiDefinitions.find((kpi) => kpi.key.toLowerCase() === formattedKey || kpi.title.toLowerCase() === kpiName.toLowerCase());
  };

  // Make sure to update the function used to change a GIF for an existing option
  const changeOptionGif = (questionId: string, optionId: string) => {
    // Find the question
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) return;

    // Find the option index
    const optionIndex = questions[questionIndex].options.findIndex((o) => o.id === optionId);
    if (optionIndex === -1) return;

    // Set current question and option index for Giphy modal
    setCurrentQuestion(questions[questionIndex]);
    setCurrentOptionIndex(optionIndex);

    // Open the Giphy modal
    setGiphySearchTerm('');
    setGiphyResults([]);
    setShowGiphyModal(true);
  };

  // Function to handle drag start for options
  const handleOptionDragStart = (e: React.DragEvent, questionId: string, index: number, id: string) => {
    dragItemOption.current = {
      index,
      id,
      type: 'option',
      questionId
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    // Add opacity and scale effect for visual feedback
    e.currentTarget.classList.add('opacity-70', 'transition-all', 'duration-200');

    // Add a ghost image that better represents the dragged item
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);

    // Remove the clone after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Function to handle drag end for options
  const handleOptionDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-70', 'transition-all', 'duration-200');
    e.currentTarget.classList.add('transition-all', 'duration-300');
    dragItemOption.current = null;
    dragOverItemOption.current = null;
  };

  // Function to handle drag over for options
  const handleOptionDragOver = (e: React.DragEvent, questionId: string, index: number, id: string) => {
    e.preventDefault();

    // Highlight the drop target
    if (dragOverItemOption.current?.id !== id) {
      e.currentTarget.classList.add('bg-gray-50', 'transition-all', 'duration-200');
    }
    dragOverItemOption.current = {
      index,
      id,
      type: 'option',
      questionId
    };
  };

  // Function to handle drag leave for options
  const handleOptionDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-50', 'transition-all', 'duration-200');
  };

  // Function to handle drop for options
  const handleOptionDrop = (e: React.DragEvent, questionId: string) => {
    e.preventDefault();
    if (dragItemOption.current && dragOverItemOption.current && dragItemOption.current.questionId === questionId && dragOverItemOption.current.questionId === questionId) {
      const dragItemIndex = dragItemOption.current.index;
      const dragOverItemIndex = dragOverItemOption.current.index;
      if (dragItemIndex === dragOverItemIndex) return;
      const updatedQuestions = [...questions];
      const questionIndex = updatedQuestions.findIndex((q) => q.id === questionId);
      if (questionIndex !== -1) {
        const updatedOptions = [...updatedQuestions[questionIndex].options];
        const draggedItem = updatedOptions[dragItemIndex];

        // Remove the dragged item
        updatedOptions.splice(dragItemIndex, 1);
        // Insert it at the new position
        updatedOptions.splice(dragOverItemIndex, 0, draggedItem);
        updatedQuestions[questionIndex].options = updatedOptions;
        setQuestions(updatedQuestions);
      }
    }
  };

  // Function to toggle randomize for a specific question
  const toggleQuestionRandomize = (questionId: string) => {
    setQuestions(questions.map((q) => q.id === questionId ? {
      ...q,
      isRandomized: !q.isRandomized
    } : q));
  };

  // Function to toggle mandatory for a specific question
  const toggleQuestionMandatory = (questionId: string) => {
    setQuestions(questions.map((q) => q.id === questionId ? {
      ...q,
      isMandatory: !q.isMandatory
    } : q));
  };
  return <div className="container mx-auto px-4 py-8 bg-[var(--background-color)] mobile-optimize font-work-sans">
      <div className="mb-8 font-work-sans">
        <h1 className="text-3xl font-bold font-['Sora'] text-[var(--primary-color)] font-sora">Brand Lift</h1>
        <p className="mt-2 text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">
          Design your survey questions to measure brand lift metrics
        </p>
      </div>

      {/* Question Builder */}
      <div className="mb-8 font-work-sans">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)] font-sora">
          {editingQuestion ? 'Edit Question' : 'Question Builder'}
        </h2>
        <div className={`bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 question-builder-form ${editingQuestion ? 'border-[var(--accent-color)] shadow-md' : ''} font-work-sans`}>
          {/* Search Bar */}
          <div className="mb-6 relative font-work-sans">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-work-sans">
              <svg className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input type="text" className="w-full pl-10 p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" placeholder="Search a design question" aria-label="Search design questions" />

          </div>
          
          {/* Question Title */}
          <div className="mb-4 font-work-sans">
            <div className="flex justify-between font-work-sans">
              <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Question Title</label>
              <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Question type</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-work-sans">
              <div className="md:col-span-3 font-work-sans">
                <input type="text" className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" placeholder="Type the question title here" value={newQuestion.title} onChange={(e) => setNewQuestion({
                ...newQuestion,
                title: e.target.value
              })} />

              </div>
              <div className="font-work-sans">
                <div className="relative font-work-sans">
                  <select className="w-full p-2 border border-[var(--divider-color)] rounded-md appearance-none font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" value={newQuestion.type} onChange={(e) => setNewQuestion({
                  ...newQuestion,
                  type: e.target.value as 'Multiple Choice' | 'Single Choice'
                })}>

                    <option>Multiple Choice</option>
                    <option>Single Choice</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none font-work-sans">
                    <svg className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="mb-4 font-work-sans">
            <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Answer Options</label>
            {newQuestion.options.map((option, index) => <div key={option.id} className="mb-3 font-work-sans">
                <div className="flex mb-2 font-work-sans">
                  <div className="relative flex-grow font-work-sans">
                    <input type="text" className="w-full p-2 border border-[var(--divider-color)] rounded-l-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" placeholder="Type your answer" value={option.text} onChange={(e) => updateOptionText(option.id, e.target.value)} />

                    {option.text && <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--accent-color)] text-white rounded-full p-1.5 hover:opacity-90 transition-opacity font-work-sans" onClick={() => openGiphyModal(index)} title="Add GIF" aria-label="Add GIF">

                        <svg className="h-4 w-4 font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" className="font-work-sans" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" className="font-work-sans" />
                        </svg>
            </button>}
                  </div>
            <button className="bg-red-100 text-red-600 px-4 py-2 rounded-r-md hover:bg-red-200 flex items-center justify-center border-t border-r border-b border-[var(--divider-color)] font-work-sans" onClick={() => removeOption(option.id)}>

                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
            </button>
          </div>
                {option.image ? <div className="aspect-square relative w-full h-32 sm:h-40 font-work-sans">
                    <Image src={option.image} alt={option.text || 'Answer option'} fill unoptimized={true} className="object-cover" loading="lazy" />

                    <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 font-work-sans" onClick={() => removeImage(option.id)}>

                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div> : <div className="relative aspect-square flex items-center justify-center w-full h-32 sm:h-40 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-md border border-dashed border-gray-300 font-work-sans">
                    <button onClick={() => openGiphyModal(index)} className="flex flex-col items-center justify-center text-[var(--secondary-color)] w-full h-full font-work-sans">

                      <svg className="h-8 w-8 mb-2 text-gray-400 font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-work-sans">Add GIF</span>
                    </button>
                  </div>}
              </div>)}
            <button className="px-4 py-2 border border-[var(--divider-color)] rounded-md text-[var(--primary-color)] font-medium font-['Work_Sans'] hover:bg-gray-50 mt-2 flex items-center font-work-sans" onClick={addOption}>

              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Option
            </button>
        </div>

          {/* Predicted KPI */}
          <div className="mb-4 font-work-sans">
            <label className="block text-sm font-medium mb-1 font-['Work_Sans'] text-[var(--primary-color)] flex items-center font-work-sans">
              Predicted KPI
              <span className="inline-block ml-1 relative font-work-sans">
                <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onMouseEnter={(e) => {
                updateTooltipPosition(e);
                toggleKpiTooltip('kpi-builder-tooltip');
              }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showKpiTooltip === 'kpi-builder-tooltip' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                position: 'fixed'
              }}>

                    <div className="font-semibold mb-1 font-work-sans">Key Performance Indicators</div>
                    <div className="mb-1 font-work-sans">Metrics used to measure the effectiveness of your brand lift campaign.</div>
                    <div className="text-[var(--secondary-color)] font-work-sans">Select the most relevant KPI for this question to help measure the campaign's impact.</div>
                  </div>}
              </span>
            </label>
            <select className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" value={questionKpi} onChange={(e) => setQuestionKpi(e.target.value)}>

              <option>Brand Awareness</option>
              <option>Ad Recall</option>
              <option>Consideration</option>
              <option>Message Association</option>
              <option>Brand Preference</option>
              <option>Purchase Intent</option>
              <option>Action Intent</option>
              <option>Recommendation Intent</option>
              <option>Advocacy</option>
            </select>
          </div>

          {/* Settings */}
          <div className="mb-4 font-work-sans">
            <label className="block text-sm font-medium mb-2 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Settings</label>
            <div className="flex space-x-6 font-work-sans">
              <label className="flex items-center relative font-work-sans">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)] font-work-sans" checked={isRandomized} onChange={(e) => setIsRandomized(e.target.checked)} />

                <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans'] group cursor-help font-work-sans">
                  Randomise
                  <span className="inline-block ml-1 relative font-work-sans">
                    <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onMouseEnter={(e) => {
                    updateTooltipPosition(e);
                    toggleKpiTooltip('randomise-tooltip');
                  }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </span>
                {showKpiTooltip === 'randomise-tooltip' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                position: 'fixed'
              }}>

                    <div className="font-semibold mb-1 font-work-sans">Randomise Options</div>
                    <div className="mb-1 font-work-sans">Presents answer options in a random order for each respondent to prevent bias.</div>
                    <div className="text-[var(--secondary-color)] font-work-sans">This helps ensure more accurate results by eliminating order bias.</div>
                  </div>}
              </label>
              <label className="flex items-center relative font-work-sans">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)] font-work-sans" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)} />

                <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans'] group cursor-help font-work-sans">
                  Non-forced choice
                  <span className="inline-block ml-1 relative font-work-sans">
                    <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onMouseEnter={(e) => {
                    updateTooltipPosition(e);
                    toggleKpiTooltip('mandatory-tooltip');
                  }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </span>
                {showKpiTooltip === 'mandatory-tooltip' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                position: 'fixed'
              }}>

                    <div className="font-semibold mb-1 font-work-sans">Non-forced Choice</div>
                    <div className="mb-1 font-work-sans">Allows respondents to skip questions without providing an answer.</div>
                    <div className="text-[var(--secondary-color)] font-work-sans">Useful for sensitive questions or when "None of the above" is a valid response.</div>
                  </div>}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6 font-work-sans">
            <button onClick={handleClearForm} className="flex-1 py-2 bg-red-500 text-white rounded-md font-medium font-['Work_Sans'] hover:bg-red-600 transition-colors flex items-center justify-center font-work-sans">

              <Icon name="faTrash" className="mr-2 h-5 w-5" solid={false} />
              Clear Form
            </button>
            <button onClick={handleAddQuestion} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity flex items-center justify-center font-work-sans">

              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>

      {/* Configure Your Survey */}
      <div className="mb-8 font-work-sans">
        <h2 className="text-xl font-semibold mb-4 font-['Sora'] text-[var(--primary-color)] font-sora">Configure Your Survey</h2>
        <div className="mb-4 font-work-sans">
          <h3 className="text-md font-medium font-['Work_Sans'] text-[var(--primary-color)] font-sora">Recommended survey questions</h3>
          {/* Changed <p> to <div> to avoid hydration issues */}
          <div className="text-sm text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">
            These recommended questions are designed to help you assess the ad's impact on key metrics: 
            <span className="font-medium inline-block ml-1 relative font-work-sans">
              <span className="cursor-help border-b border-dotted border-[var(--accent-color)] font-work-sans" onMouseEnter={(e) => {
              updateTooltipPosition(e);
              toggleKpiTooltip('brand-awareness');
            }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                Brand Awareness
              </span>
              {showKpiTooltip === 'brand-awareness' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              position: 'fixed'
            }}>

                  <div className="font-semibold mb-1 font-work-sans">Brand Awareness</div>
                  <div className="mb-1 font-work-sans">{getKpiInfo('Brand Awareness')?.definition || "The increase in recognition of your brand."}</div>
                  <div className="text-[var(--secondary-color)] font-work-sans">Example: {getKpiInfo('Brand Awareness')?.example || "Your brand name is recognised by 30% more people after the campaign."}</div>
                </div>}
            </span>, 
            <span className="font-medium relative inline-block ml-1 font-work-sans">
              <span className="cursor-help border-b border-dotted border-[var(--accent-color)] font-work-sans" onMouseEnter={(e) => {
              updateTooltipPosition(e);
              toggleKpiTooltip('ad-recall');
            }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                Ad Recall
              </span>
              {showKpiTooltip === 'ad-recall' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              position: 'fixed'
            }}>

                  <div className="font-semibold mb-1 font-work-sans">Ad Recall</div>
                  <div className="mb-1 font-work-sans">{getKpiInfo('Ad Recall')?.definition || "The percentage of people who remember seeing your advertisement."}</div>
                  <div className="text-[var(--secondary-color)] font-work-sans">Example: {getKpiInfo('Ad Recall')?.example || "After a week, 60% of viewers can recall your ad's main message."}</div>
                </div>}
            </span>, 
            <span className="font-medium relative inline-block ml-1 font-work-sans">
              <span className="cursor-help border-b border-dotted border-[var(--accent-color)] font-work-sans" onMouseEnter={(e) => {
              updateTooltipPosition(e);
              toggleKpiTooltip('brand-preference');
            }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                Brand Preference
              </span>
            </span>
            {showKpiTooltip === 'brand-preference' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            position: 'fixed'
          }}>

                <div className="font-semibold mb-1 font-work-sans">Brand Preference</div>
                <div className="mb-1 font-work-sans">{getKpiInfo('Brand Preference')?.definition || "Preference for your brand over competitors."}</div>
                <div className="text-[var(--secondary-color)] font-work-sans">Example: {getKpiInfo('Brand Preference')?.example || "40% of customers prefer your brand when choosing between similar products."}</div>
              </div>}
            , and 
            <span className="font-medium relative inline-block ml-1 font-work-sans">
              <span className="cursor-help border-b border-dotted border-[var(--accent-color)] font-work-sans" onMouseEnter={(e) => {
              updateTooltipPosition(e);
              toggleKpiTooltip('action-intent');
            }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                Drive Action Intent
              </span>
            </span>
            {showKpiTooltip === 'action-intent' && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            position: 'fixed'
          }}>

                <div className="font-semibold mb-1 font-work-sans">Action Intent</div>
                <div className="mb-1 font-work-sans">{getKpiInfo('Action Intent')?.definition || "The likelihood of taking a specific action after seeing your ad."}</div>
                <div className="text-[var(--secondary-color)] font-work-sans">Example: {getKpiInfo('Action Intent')?.example || "25% of viewers intend to visit your website after viewing the ad."}</div>
              </div>}
          </div>
        </div>
        
        {/* Questions List */}
        <div className="space-y-6 font-work-sans">
          {questions.map((question, index) => <div key={question.id} className="border border-[var(--divider-color)] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md font-work-sans" draggable onDragStart={(e) => handleDragStart(e, index, question.id)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, index, question.id)} onDragLeave={handleDragLeave} onDrop={handleDrop}>

              <div className="flex items-center p-4 border-b border-[var(--divider-color)] bg-gray-50 cursor-pointer font-work-sans" onClick={() => toggleQuestionExpansion(question.id)}>

                <div className="flex-1 font-work-sans">
                  <div className="flex items-center font-work-sans">
                    <button className="mr-4 text-[var(--secondary-color)] cursor-move font-work-sans" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>

                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="mr-4 text-[var(--secondary-color)] font-work-sans" onClick={(e) => {
                  e.stopPropagation();
                  toggleQuestionExpansion(question.id);
                }}>

                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedQuestions[question.id] ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />

                      </svg>
                    </button>
                    <div className="relative flex items-center font-work-sans">
                      <div className="text-sm text-[var(--accent-color)] font-['Work_Sans'] flex items-center font-work-sans">
                        {getKpiInfo(question.kpi)?.icon && <Image src={getKpiInfo(question.kpi)?.icon || ""} alt={`${question.kpi} icon`} width={16} height={16} className="mr-1 filter brightness-0 invert opacity-80 blue-icon" />}
                        <span className="mr-1 font-work-sans">{question.kpi}</span>
                        {/* Restructured to avoid nesting issues */}
                        <span className="cursor-help inline-block ml-1 font-work-sans" onMouseEnter={(e) => {
                      updateTooltipPosition(e);
                      toggleKpiTooltip(`kpi-${question.id}`);
                    }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)} onClick={(e) => e.stopPropagation()}>

                          <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                  </span>
                </div>
                      
                      {/* KPI Tooltip with higher z-index - moved outside the parent elements */}
                      {showKpiTooltip === `kpi-${question.id}` && <div className="absolute z-[9999] w-72 p-4 bg-white border border-[var(--divider-color)] rounded-lg shadow-lg font-work-sans" style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    position: 'fixed'
                  }}>

                          <div className="font-medium text-[var(--primary-color)] mb-2 font-work-sans">
                            {question.kpi}
                          </div>
                          <div className="text-sm text-[var(--secondary-color)] mb-2 font-work-sans">
                            {getKpiInfo(question.kpi)?.definition || 'Key Performance Indicator to measure the success of your campaign.'}
                          </div>
                          <div className="text-xs text-[var(--secondary-color)] font-work-sans">
                            Example: {getKpiInfo(question.kpi)?.example || 'This question helps track how your campaign affects this specific metric.'}
                          </div>
                        </div>}
                    </div>
                    
                    <h3 className="text-base font-medium ml-4 text-[var(--primary-color)] font-['Work_Sans'] font-sora">
                      {question.title}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 font-work-sans">
                  <button onClick={() => handleDeleteQuestion(question.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-gray-100 font-work-sans">

                    <Icon name="faTrash" className="h-4 w-4" solid={false} />
                  </button>
                </div>
              </div>

              {expandedQuestions[question.id] && <div className="p-4 bg-white font-work-sans">
                  <div className="mb-4 font-work-sans">
                    <div className="flex justify-between items-center mb-2 font-work-sans">
                      <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] font-work-sans">Question Title</div>
                      <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] font-work-sans">Question type</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-work-sans">
                      <div className="md:col-span-3 font-work-sans">
                      <input type="text" className="w-full p-2 border border-[var(--divider-color)] rounded-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" value={question.title} onChange={(e) => {
                    const updatedQuestions = questions.map((q) => q.id === question.id ? {
                      ...q,
                      title: e.target.value
                    } : q);
                    setQuestions(updatedQuestions);
                  }} aria-label="Edit question title" />

                    </div>
                      <div className="font-work-sans">
                        <div className="relative font-work-sans">
                          <select className="w-full p-2 border border-[var(--divider-color)] rounded-md appearance-none font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" value={question.type} onChange={(e) => {
                      const updatedQuestions = questions.map((q) => q.id === question.id ? {
                        ...q,
                        type: e.target.value as 'Multiple Choice' | 'Single Choice'
                      } : q);
                      setQuestions(updatedQuestions);
                    }} aria-label="Edit question type">

                            <option>Multiple Choice</option>
                            <option>Single Choice</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none font-work-sans">
                            <svg className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview of options with images - now with drag and drop */}
                  <div className="mb-4 font-work-sans">
                    <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] mb-2 flex items-center font-work-sans">
                      Answer Options
                      <span className="ml-2 text-xs text-[var(--secondary-color)] font-work-sans">(Drag to reorder)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-work-sans">
                      {question.options.map((option, optionIndex) => <div key={option.id} className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 rounded-lg overflow-hidden ${isOptionSelected(question.id, option.id) ? 'ring-2 ring-[var(--accent-color)] border-transparent shadow-md' : 'border border-[var(--divider-color)] hover:shadow-md'} font-work-sans`} onClick={() => toggleAnswerSelection(question.id, option.id)} draggable onDragStart={(e) => handleOptionDragStart(e, question.id, optionIndex, option.id)} onDragEnd={handleOptionDragEnd} onDragOver={(e) => handleOptionDragOver(e, question.id, optionIndex, option.id)} onDragLeave={handleOptionDragLeave} onDrop={(e) => handleOptionDrop(e, question.id)}>

                          {/* Drag handle */}
                          <div className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:opacity-100 z-10 cursor-move font-work-sans" onClick={(e) => e.stopPropagation()} title="Drag to reorder">

                            <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </div>

                          {option.image ? <div className="aspect-square relative w-full h-32 sm:h-40 group font-work-sans">
                              <Image src={option.image} alt={option.text || 'Answer option'} fill unoptimized={true} className={`object-cover transition-all duration-300 ${isOptionSelected(question.id, option.id) ? 'brightness-110' : 'hover:brightness-105'}`} loading="lazy" />

                              {isOptionSelected(question.id, option.id) && <div className="absolute top-2 left-2 bg-[var(--accent-color)] rounded-full p-0.5 animate-pulse font-work-sans">
                                  <svg className="h-4 w-4 text-white font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                </div>}

                              {/* Improved GIF change button - moved to bottom corner to avoid overlap */}
                    <button className="absolute bottom-2 right-2 bg-[var(--accent-color)] text-white rounded-full p-1.5 hover:opacity-90 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-md font-work-sans" onClick={(e) => {
                      e.stopPropagation();
                      changeOptionGif(question.id, option.id);
                    }} title="Change GIF" aria-label="Change GIF">

                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                    </button>
                            </div> : <div className="aspect-square flex items-center justify-center w-full h-32 sm:h-40 cursor-pointer hover:bg-gray-100 transition-all duration-300 relative group bg-gray-50 border border-dashed border-gray-300 rounded-md font-work-sans">
                              <button onClick={(e) => {
                      e.stopPropagation();
                      changeOptionGif(question.id, option.id);
                    }} className="flex flex-col items-center justify-center text-[var(--secondary-color)] w-full h-full font-work-sans">

                                <svg className="h-8 w-8 mb-2 text-gray-400 font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-work-sans">Add GIF</span>
                              </button>
                </div>}
                          <div className="p-2 text-sm text-[var(--primary-color)] font-medium overflow-hidden font-work-sans">
                            <input type="text" className="w-full p-1 border-b border-transparent hover:border-[var(--divider-color)] focus:border-[var(--accent-color)] outline-none bg-transparent font-work-sans" value={option.text} onChange={(e) => {
                      const updatedQuestions = questions.map((q) => {
                        if (q.id === question.id) {
                          const updatedOptions = q.options.map((opt) => opt.id === option.id ? {
                            ...opt,
                            text: e.target.value
                          } : opt);
                          return {
                            ...q,
                            options: updatedOptions
                          };
                        }
                        return q;
                      });
                      setQuestions(updatedQuestions);
                    }} onClick={(e) => e.stopPropagation()} placeholder="Option text" aria-label="Edit option text" />

                          </div>
                        </div>)}
                    </div>
                  </div>
                  
                  {/* Question Settings - Moved to bottom of each question */}
                  <div className="mt-6 pt-4 border-t border-[var(--divider-color)] font-work-sans">
                    <div className="text-sm font-medium text-[var(--primary-color)] font-['Work_Sans'] mb-2 font-work-sans">Question Settings</div>
                    <div className="flex flex-wrap gap-6 font-work-sans">
                      <label className="flex items-center relative font-work-sans">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)] font-work-sans" checked={question.isRandomized || false} onChange={() => toggleQuestionRandomize(question.id)} />

                        <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans'] group cursor-help font-work-sans">
                          Randomise
                          <span className="inline-block ml-1 relative font-work-sans">
                            <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onMouseEnter={(e) => {
                        updateTooltipPosition(e);
                        toggleKpiTooltip(`randomise-${question.id}`);
                      }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </span>
                        {showKpiTooltip === `randomise-${question.id}` && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    position: 'fixed'
                  }}>

                            <div className="font-semibold mb-1 font-work-sans">Randomise Options</div>
                            <div className="mb-1 font-work-sans">Presents answer options in a random order for each respondent to prevent bias.</div>
                            <div className="text-[var(--secondary-color)] font-work-sans">This helps ensure more accurate results by eliminating order bias.</div>
                          </div>}
                      </label>
                      <label className="flex items-center relative font-work-sans">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--accent-color)] font-work-sans" checked={question.isMandatory || false} onChange={() => toggleQuestionMandatory(question.id)} />

                        <span className="ml-2 text-sm text-[var(--primary-color)] font-['Work_Sans'] group cursor-help font-work-sans">
                          Non-forced choice
                          <span className="inline-block ml-1 relative font-work-sans">
                            <svg className="h-4 w-4 text-[var(--secondary-color)] font-work-sans" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" onMouseEnter={(e) => {
                        updateTooltipPosition(e);
                        toggleKpiTooltip(`mandatory-${question.id}`);
                      }} onMouseMove={updateTooltipPosition} onMouseLeave={() => toggleKpiTooltip(null)}>

                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </span>
                        {showKpiTooltip === `mandatory-${question.id}` && <div className="absolute z-[9999] w-64 p-3 bg-white rounded-md shadow-lg border border-[var(--divider-color)] text-xs font-work-sans" style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    position: 'fixed'
                  }}>

                            <div className="font-semibold mb-1 font-work-sans">Non-forced Choice</div>
                            <div className="mb-1 font-work-sans">Allows respondents to skip questions without providing an answer.</div>
                            <div className="text-[var(--secondary-color)] font-work-sans">Useful for sensitive questions or when "None of the above" is a valid response.</div>
                          </div>}
                      </label>
                    </div>
                  </div>
                </div>}
            </div>)}
        </div>
        
        {/* Submit Buttons */}
        <div className="mt-8 flex justify-end font-work-sans">
          <button onClick={handlePreview} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity font-work-sans">

            Preview & Submit
          </button>
      </div>
      </div>

      {/* Giphy Search Modal */}
      {showGiphyModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn font-work-sans" aria-modal="true" role="dialog" aria-labelledby="giphy-modal-title">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scaleIn font-work-sans">
            <div className="p-4 border-b border-[var(--divider-color)] font-work-sans">
              <h3 className="text-lg font-semibold font-['Sora'] text-[var(--primary-color)] font-sora" id="giphy-modal-title">Select a GIF</h3>
            </div>
            
            <div className="p-4 border-b border-[var(--divider-color)] font-work-sans">
              <div className="flex font-work-sans">
                <input type="text" className="flex-grow p-2 border border-[var(--divider-color)] rounded-l-md font-['Work_Sans'] text-[var(--primary-color)] font-work-sans" placeholder="Search for GIFs..." value={giphySearchTerm} onChange={(e) => setGiphySearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchGiphy(giphySearchTerm)} aria-label="Search for GIFs" />

                    <button className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-r-md font-medium font-['Work_Sans'] hover:opacity-90 transition-opacity font-work-sans" onClick={() => searchGiphy(giphySearchTerm)} aria-label="Search Giphy">

                  Search
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto font-work-sans" style={{
          maxHeight: '50vh'
        }}>
              {isSearching ? <div className="flex justify-center items-center h-40 font-work-sans">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)] font-work-sans"></div>
                </div> : giphyResults.length === 0 ? <div className="text-center py-10 text-[var(--secondary-color)] font-['Work_Sans'] font-work-sans">
                  {giphySearchTerm ? 'No results found. Try a different search term.' : 'Search for GIFs to display results.'}
                </div> : <div className="grid grid-cols-3 md:grid-cols-4 gap-4 font-work-sans">
                  {giphyResults.map((gif) => <div key={gif.id} className="cursor-pointer border border-[var(--divider-color)] rounded-md overflow-hidden hover:border-[var(--accent-color)] transition-all duration-300 transform hover:scale-105 hover:shadow-md font-work-sans" onClick={() => selectGif(gif.images.original.url)} tabIndex={0} role="button" aria-label={`Select ${gif.title || "GIF"}`} onKeyPress={(e) => e.key === 'Enter' && selectGif(gif.images.original.url)}>

                      <Image src={gif.images.fixed_height.url} alt={gif.title || "GIF"} width={200} height={200} unoptimized={true} className="w-full h-24 object-cover transition-all duration-300 hover:brightness-110 font-work-sans" loading="lazy" />

                    </div>)}
                </div>}
            </div>
            
            <div className="p-4 border-t border-[var(--divider-color)] flex justify-between font-work-sans">
              <button className="px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded font-medium font-['Work_Sans'] text-sm hover:bg-gray-50 transition-colors font-work-sans" onClick={() => setShowGiphyModal(false)} aria-label="Cancel GIF selection">

                Cancel
              </button>
              <div className="text-sm text-[var(--secondary-color)] font-['Work_Sans'] flex items-center font-work-sans">
                Powered by GIPHY
              </div>
            </div>
          </div>
        </div>}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-work-sans">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden font-work-sans">
            <div className="p-6 font-work-sans">
              <div className="flex items-center justify-center mb-4 text-red-500 font-work-sans">
                <svg className="h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 font-['Sora'] text-[var(--primary-color)] font-sora">Delete Question</h3>
              <p className="text-center text-[var(--secondary-color)] font-['Work_Sans'] mb-6 font-work-sans">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4 font-work-sans">
                <button className="px-6 py-2 bg-gray-200 text-[var(--secondary-color)] rounded-md font-medium font-['Work_Sans'] hover:bg-gray-300 transition-colors font-work-sans" onClick={() => setShowDeleteModal(false)}>

                  Cancel
                </button>
                <button className="px-6 py-2 bg-red-500 text-white rounded-md font-medium font-['Work_Sans'] hover:bg-red-600 transition-colors font-work-sans" onClick={() => questionToDelete && handleDeleteQuestion(questionToDelete)}>

                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>}

      <style jsx global>{`
        /* Global styles for tooltips */
        .tooltip, [role="tooltip"] {
          z-index: 9999 !important;
          position: relative;
        }
        
        /* Custom filter for blue icons to match accent color */
        .blue-icon {
          filter: brightness(0) invert(50%) sepia(40%) saturate(1000%) hue-rotate(175deg) brightness(95%) contrast(90%);
        }
        
        /* Question wrapper tooltip styling */
        .kpi-tooltip {
          z-index: 9999 !important;
        }
        
        /* Better transitions for dragging */
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        
        /* Cursor based tooltips */
        .cursor-help {
          cursor: help;
        }
        
        /* Mobile optimization */
        @media (max-width: 768px) {
          .mobile-optimize h1 {
            font-size: 1.5rem;
          }
          .mobile-optimize .question-builder-form {
            padding: 1rem;
          }
          .mobile-optimize input,
          .mobile-optimize select,
          .mobile-optimize textarea {
            font-size: 16px; /* Prevents zoom on mobile */
          }
        }

        /* Ensure tooltips are visible */
        [data-tooltip], .has-tooltip {
          position: relative;
        }

        /* Improved tooltip visibility */
        div[class*="absolute"], div[class*="fixed"] {
          z-index: 9999 !important;
        }

        /* Ensure tooltips don't get hidden */
        div[class*="absolute"][class*="bg-white"][class*="shadow"],
        div[class*="fixed"][class*="bg-white"][class*="shadow"] {
          z-index: 9999 !important;
          pointer-events: none;
        }

        /* Ensure tooltips appear above all other content */
        div[class*="absolute"][class*="rounded-md"][class*="shadow"],
        div[class*="fixed"][class*="bg-white"] {
          z-index: 9999 !important;
          pointer-events: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>;
}