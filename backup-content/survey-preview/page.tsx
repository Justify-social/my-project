"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaMagic } from "react-icons/fa";

// Import the GifModal from the shared components folder
import GifModal from "@/components/features/assets/gif/GifModal";

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

interface AnswerOption {
  id: string;
  text: string;       // stored in lower-case
  imageOrGif?: string;
}

interface SurveyQuestion {
  id: string;
  questionText: string;   // stored in lower-case
  questionType: "single" | "multiple";
  kpi: string;            // e.g. "adRecall"
  answers: AnswerOption[];
}

// -----------------------------------------------------------------------------
// HELPER: getKpiTitle - maps a KPI key to a display title
// -----------------------------------------------------------------------------

function getKpiTitle(k: string): string {
  switch (k) {
    case "adRecall": return "Ad Recall";
    case "brandAwareness": return "Brand Awareness";
    case "consideration": return "Consideration";
    case "messageAssociation": return "Message Association";
    case "brandPreference": return "Brand Preference";
    case "purchaseIntent": return "Purchase Intent";
    case "actionIntent": return "Action Intent";
    case "recommendationIntent": return "Recommendation Intent";
    case "advocacy": return "Advocacy";
    case "overall": return "Overall Brand Lift";
    default: return k;
  }
}

// -----------------------------------------------------------------------------
// PRE-POPULATED SURVEY QUESTIONS (10 total)
// -----------------------------------------------------------------------------

const initialQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    questionText: "how memorable was our ad?",
    questionType: "single",
    kpi: "adRecall",
    answers: [
      {
        id: "q1a1",
        text: "very memorable",
        imageOrGif: "https://media.giphy.com/media/3o7aD4f3WhLEvxKa12/giphy.gif",
      },
      { id: "q1a2", text: "somewhat memorable" },
      { id: "q1a3", text: "not memorable" },
    ],
  },
  {
    id: "q2",
    questionText: "how aware are you of our brand?",
    questionType: "single",
    kpi: "brandAwareness",
    answers: [
      { id: "q2a1", text: "very aware" },
      { id: "q2a2", text: "somewhat aware" },
      { id: "q2a3", text: "not aware at all" },
    ],
  },
  {
    id: "q3",
    questionText: "how likely are you to consider purchasing from us?",
    questionType: "single",
    kpi: "consideration",
    answers: [
      { id: "q3a1", text: "very likely" },
      { id: "q3a2", text: "maybe" },
      { id: "q3a3", text: "unlikely" },
    ],
  },
  {
    id: "q4",
    questionText: "how strongly do you associate our key messages with our brand?",
    questionType: "multiple",
    kpi: "messageAssociation",
    answers: [
      { id: "q4a1", text: "strong association" },
      { id: "q4a2", text: "moderate association" },
      { id: "q4a3", text: "weak association" },
      { id: "q4a4", text: "no association" },
    ],
  },
  {
    id: "q5",
    questionText: "which brand do you prefer among competitors?",
    questionType: "single",
    kpi: "brandPreference",
    answers: [
      { id: "q5a1", text: "our brand" },
      { id: "q5a2", text: "competitor a" },
      { id: "q5a3", text: "competitor b" },
      { id: "q5a4", text: "no preference" },
    ],
  },
  {
    id: "q6",
    questionText: "how likely are you to buy our product?",
    questionType: "single",
    kpi: "purchaseIntent",
    answers: [
      { id: "q6a1", text: "definitely will buy" },
      { id: "q6a2", text: "might buy" },
      { id: "q6a3", text: "won't buy" },
    ],
  },
  {
    id: "q7",
    questionText: "how likely are you to visit our website after seeing our ad?",
    questionType: "single",
    kpi: "actionIntent",
    answers: [
      { id: "q7a1", text: "very likely" },
      { id: "q7a2", text: "somewhat likely" },
      { id: "q7a3", text: "not likely" },
    ],
  },
  {
    id: "q8",
    questionText: "how likely are you to recommend our brand to others?",
    questionType: "single",
    kpi: "recommendationIntent",
    answers: [
      { id: "q8a1", text: "very likely" },
      { id: "q8a2", text: "somewhat likely" },
      { id: "q8a3", text: "not likely" },
    ],
  },
  {
    id: "q9",
    questionText: "how willing are you to promote our brand on social media?",
    questionType: "multiple",
    kpi: "advocacy",
    answers: [
      { id: "q9a1", text: "extremely willing" },
      { id: "q9a2", text: "somewhat willing" },
      { id: "q9a3", text: "not willing" },
    ],
  },
  {
    id: "q10",
    questionText: "overall, how has your perception of our brand changed?",
    questionType: "single",
    kpi: "overall",
    answers: [
      { id: "q10a1", text: "much more positive" },
      { id: "q10a2", text: "somewhat more positive" },
      { id: "q10a3", text: "unchanged" },
      { id: "q10a4", text: "worse" },
    ],
  },
];

// -----------------------------------------------------------------------------
// TIKTOK & INSTAGRAM PREVIEW COMPONENTS
// -----------------------------------------------------------------------------

function TikTokPreview() {
  return (
    <div className="relative bg-black rounded-2xl overflow-hidden" style={{ width: "300px", height: "600px" }}>
      <video
        src="https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-sm font-bold">@influencer</p>
        <p className="text-xs">Check out this awesome product!</p>
      </div>
    </div>
  );
}

function InstagramPreview() {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border" style={{ width: "300px", height: "600px" }}>
      <div className="absolute top-0 left-0 w-full h-10 bg-white flex items-center px-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
        <span className="text-sm font-bold">@influencer</span>
      </div>
      <img
        src="https://placekitten.com/300/360"
        alt="Instagram post"
        className="absolute top-10 w-full h-72 object-cover border-b"
      />
      <div className="absolute top-[340px] left-0 w-full p-3">
        <p className="text-sm font-bold">@influencer</p>
        <p className="text-sm">Loving this new launch!</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-12 bg-white border-t flex items-center justify-around">
        <button className="text-xl text-gray-700">🏠</button>
        <button className="text-xl text-gray-700">🔍</button>
        <button className="text-xl text-gray-700">➕</button>
        <button className="text-xl text-gray-700">❤️</button>
        <button className="text-xl text-gray-700">👤</button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT: SurveyPreviewPage
// -----------------------------------------------------------------------------

export default function SurveyPreviewPage() {
  const router = useRouter();

  // Avoid SSR mismatch by waiting until mounting
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Which platform is selected for the left preview
  const [selectedPlatform, setSelectedPlatform] = useState<"tiktok" | "instagram">("tiktok");

  // Survey questions & current question index
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Store selected answers (questionId -> answerId)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // GIF Modal state
  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [gifModalTarget, setGifModalTarget] = useState<{ questionId: string; answerId: string } | null>(null);

  // If not mounted, show a loading indicator
  if (!hasMounted) {
    return <div className="max-w-5xl mx-auto p-4">Loading survey preview...</div>;
  }

  // Get the current question
  const currentQ = questions[currentIndex];

  // Handler: select an answer for the current question
  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReturnEdits = () => {
    router.push("/brand-lift/survey-design");
  };

  const handleSubmitSurvey = () => {
    alert("Survey submitted for final review!");
    router.push("/brand-lift/thank-you");
  };

  // Open GIF modal for a specific answer
  const openGifModal = (questionId: string, answerId: string) => {
    setGifModalTarget({ questionId, answerId });
    setGifModalOpen(true);
  };

  const closeGifModal = () => {
    setGifModalOpen(false);
    setGifModalTarget(null);
  };

  const handleSelectGif = (gifUrl: string) => {
    if (!gifModalTarget) return;
    const { questionId, answerId } = gifModalTarget;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const updatedAnswers = q.answers.map((ans) =>
            ans.id === answerId ? { ...ans, imageOrGif: gifUrl } : ans
          );
          return { ...q, answers: updatedAnswers };
        }
        return q;
      })
    );
    closeGifModal();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 min-h-screen">
      {/* LEFT COLUMN: Platform Preview */}
      <div className="md:w-1/2 w-full flex flex-col items-center gap-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setSelectedPlatform("tiktok")}
            className={`px-4 py-2 rounded border text-sm ${
              selectedPlatform === "tiktok" ? "bg-black text-white border-black" : "hover:bg-gray-100 border-gray-300"
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setSelectedPlatform("instagram")}
            className={`px-4 py-2 rounded border text-sm ${
              selectedPlatform === "instagram" ? "bg-pink-500 text-white border-pink-500" : "hover:bg-gray-100 border-gray-300"
            }`}
          >
            Instagram
          </button>
        </div>
        {selectedPlatform === "tiktok" ? <TikTokPreview /> : <InstagramPreview />}
      </div>

      {/* RIGHT COLUMN: Survey Question Preview */}
      <div className="md:w-1/2 w-full bg-white rounded shadow-sm p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-2">Survey Preview & Submit</h1>

        {/* Time & Cost Info */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded mb-4 text-sm">
          <div>
            <strong>Estimated Time:</strong> ~2 minutes
          </div>
          <div>
            <strong>Credits Cost:</strong> 15 credits
          </div>
        </div>

        {/* Current Question */}
        <div className="flex-1 border p-4 rounded mb-4">
          <p className="text-xs text-gray-500 uppercase mb-1">
            question {currentIndex + 1} of {questions.length}
          </p>
          <h2 className="text-lg font-semibold lowercase mb-2">{currentQ.questionText}</h2>
          <p className="text-sm text-gray-700 mb-4">
            <strong>KPI:</strong> {getKpiTitle(currentQ.kpi)}
          </p>
          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentQ.answers.map((ans) => {
              const isSelected = selectedAnswers[currentQ.id] === ans.id;
              return (
                <div
                  key={ans.id}
                  className={`flex flex-col items-center p-2 border rounded transition ${
                    isSelected
                      ? "bg-blue-50 border-blue-600"
                      : "bg-white border-gray-300 hover:border-gray-500"
                  }`}
                  onClick={() => handleSelectAnswer(currentQ.id, ans.id)}
                >
                  {ans.imageOrGif ? (
                    <img
                      src={ans.imageOrGif}
                      alt="gif"
                      className="w-20 h-20 object-cover rounded mb-1"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-500 mb-1">
                      no gif
                    </div>
                  )}
                  <span className="lowercase text-sm text-gray-700">{ans.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGifModal(currentQ.id, ans.id);
                    }}
                    className="mt-2 px-2 py-1 border rounded text-blue-600 text-xs"
                  >
                    {ans.imageOrGif ? "change gif" : "add gif"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation: Prev/Next */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleReturnEdits}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Return for Edits
          </button>
          <button
            onClick={handleSubmitSurvey}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit Survey
          </button>
        </div>
      </div>

      {/* GIF Modal */}
      {gifModalOpen && gifModalTarget && (
        <GifModal onClose={closeGifModal} onSelectGif={handleSelectGif} />
      )}
    </div>
  );
}
