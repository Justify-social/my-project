"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import SurveyQuestion from '../../src/types/brand-lift';
import HTMLInputElement from '../../src/components/ui/radio/types/index';
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FaMagic } from "react-icons/fa";

// Dynamically import react-beautiful-dnd components (client-only)
const DragDropContext = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS & CONSTANTS
// -----------------------------------------------------------------------------

// Allowed KPI keys
const ALLOWED_KPI_KEYS = [
  "adRecall",
  "brandAwareness",
  "consideration",
  "messageAssociation",
  "brandPreference",
  "purchaseIntent",
  "actionIntent",
  "recommendationIntent",
  "advocacy",
  "overall",
];

// Detailed KPI definitions (titles are in Title Case for display)
const kpis = [
  {
    key: "adRecall",
    title: "Ad Recall",
    definition: "The percentage of people who remember seeing your ad.",
    example: "After a week, 60% of viewers recall your ad's main message.",
  },
  {
    key: "brandAwareness",
    title: "Brand Awareness",
    definition: "How many people recognize or know of your brand.",
    example: "Brand name is recognized by 30% more people after the campaign.",
  },
  {
    key: "consideration",
    title: "Consideration",
    definition: "The percentage of people considering purchasing from your brand.",
    example: "25% of your audience would buy your product after seeing your campaign.",
  },
  {
    key: "messageAssociation",
    title: "Message Association",
    definition: "How strongly your key messages are linked to your brand.",
    example: "70% of viewers match your slogan to your brand.",
  },
  {
    key: "brandPreference",
    title: "Brand Preference",
    definition: "Preference for your brand over competitors.",
    example: "40% prefer your brand when offered similar products.",
  },
  {
    key: "purchaseIntent",
    title: "Purchase Intent",
    definition: "Likelihood of purchasing your product or service.",
    example: "50% plan to buy your product after seeing the ad.",
  },
  {
    key: "actionIntent",
    title: "Action Intent",
    definition: "Likelihood of taking a specific action (e.g., visiting your site).",
    example: "35% are motivated to visit your website after the campaign.",
  },
  {
    key: "recommendationIntent",
    title: "Recommendation Intent",
    definition: "Likelihood of recommending your brand to others.",
    example: "45% are willing to recommend your brand to friends and family.",
  },
  {
    key: "advocacy",
    title: "Advocacy",
    definition: "Willingness to actively promote your brand.",
    example: "20% share your brand on social media or write positive reviews.",
  },
  {
    key: "overall",
    title: "Overall Brand Lift",
    definition: "Overall brand perception change after the campaign.",
    example: "Respondents indicate whether their brand perception improved or worsened.",
  },
];

// Helper function to get the full KPI title from a key
const getKpiTitle = (key: string): string => {
  const found = kpis.find((kpi) => kpi.key === key);
  return found ? found.title : key;
};

// For answer options
interface AnswerOption {
  id: string;
  text: string; // Stored in lower-case
  imageOrGif?: string;
}

// For survey questions
interface SurveyQuestion {
  id: string;
  questionText: string; // Stored in lower-case
  questionType: "single" | "multiple";
  kpi: string;
  answers: AnswerOption[];
}

// Simple ID generator
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Auto-suggest question text based on KPI (returns lower-case)
function suggestQuestionText(kpiKey: string): string {
  switch (kpiKey) {
    case "adRecall":
      return "how memorable was our ad?";
    case "brandAwareness":
      return "how aware are you of our brand?";
    case "consideration":
      return "how likely are you to consider purchasing from us?";
    case "messageAssociation":
      return "how strongly do you associate our key messages with our brand?";
    case "brandPreference":
      return "which brand do you prefer among competitors?";
    case "purchaseIntent":
      return "how likely are you to buy our product?";
    case "actionIntent":
      return "how likely are you to visit our website after seeing our ad?";
    case "recommendationIntent":
      return "how likely are you to recommend our brand to others?";
    case "advocacy":
      return "how willing are you to promote our brand on social media?";
    case "overall":
      return "overall, how has your perception of our brand changed?";
    default:
      return "enter your question text here...";
  }
}

// Pre-populated questions with fixed IDs for stable hydration
const initialQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    questionText: "how memorable was our ad?",
    questionType: "single",
    kpi: "adRecall",
    answers: [
      { id: "q1a1", text: "very memorable", imageOrGif: "https://media.giphy.com/media/3o7aD4f3WhLEvxKa12/giphy.gif" },
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
// MAIN COMPONENT: SurveyDesignPage
// -----------------------------------------------------------------------------

export default function SurveyDesignPage() {
  const router = useRouter();
  // Flag to indicate client mount to avoid SSR mismatches
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // State for survey questions
  const [questions, setQuestions] = useState<SurveyQuestion[]>(initialQuestions);
  // State for collapsed cards (by question id)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // QUESTION BUILDER STATE
  const [builderQuestionText, setBuilderQuestionText] = useState("");
  const [builderQuestionType, setBuilderQuestionType] = useState<"single" | "multiple">("single");
  const [builderKpi, setBuilderKpi] = useState<string>("adRecall");
  const [builderAnswers, setBuilderAnswers] = useState<AnswerOption[]>([
    { id: generateId(), text: "option a" },
    { id: generateId(), text: "option b" },
  ]);
  // Editing state for question builder
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  // GIF modal state
  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [gifModalAnswer, setGifModalAnswer] = useState<{ qId: string; aId: string } | null>(null);

  // Sample GIF URLs
  const sampleGifs = [
    "https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif",
    "https://media.giphy.com/media/3o7aD4f3WhLEvxKa12/giphy.gif",
    "https://media.giphy.com/media/xT4uQqbbfYpu6bblNK/giphy.gif",
    "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  ];

  // DRAG & DROP HANDLER
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setQuestions(reordered);
  };

  // QUESTION BUILDER FUNCTIONS
  const addBuilderAnswer = () => {
    setBuilderAnswers((prev) => [
      ...prev,
      { id: generateId(), text: `option ${String.fromCharCode(97 + prev.length)}` },
    ]);
  };

  const removeBuilderAnswer = (id: string) => {
    setBuilderAnswers((prev) => prev.filter((ans) => ans.id !== id));
  };

  const applyMagicWandBuilder = () => {
    const suggestion = suggestQuestionText(builderKpi);
    setBuilderQuestionText(suggestion);
  };

  const addNewQuestion = () => {
    if (!builderQuestionText.trim()) {
      alert("Please enter a question text for the new question.");
      return;
    }
    if (builderAnswers.length < 2) {
      alert("Please have at least two answer options.");
      return;
    }
    const newQ: SurveyQuestion = {
      id: generateId(),
      questionText: builderQuestionText.trim().toLowerCase(),
      questionType: builderQuestionType,
      kpi: builderKpi,
      answers: builderAnswers.map((a) => ({
        ...a,
        text: a.text.trim().toLowerCase(),
      })),
    };
    setQuestions([...questions, newQ]);
    // Reset builder
    setBuilderQuestionText("");
    setBuilderQuestionType("single");
    setBuilderKpi("adRecall");
    setBuilderAnswers([
      { id: generateId(), text: "option a" },
      { id: generateId(), text: "option b" },
    ]);
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // GIF modal functions
  const openGifModal = (qId: string, aId: string) => {
    setGifModalAnswer({ qId, aId });
    setGifModalOpen(true);
  };

  const closeGifModal = () => {
    setGifModalOpen(false);
    setGifModalAnswer(null);
  };

  const handleSelectGif = (gifUrl: string) => {
    if (!gifModalAnswer) return;
    const { qId, aId } = gifModalAnswer;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const updatedAnswers = q.answers.map((ans) =>
            ans.id === aId ? { ...ans, imageOrGif: gifUrl } : ans
          );
          return { ...q, answers: updatedAnswers };
        }
        return q;
      })
    );
    closeGifModal();
  };

  const handlePreviewAndSubmit = () => {
    if (questions.length === 0) {
      alert("No questions in the survey. Please add at least one question.");
      return;
    }
    alert("Survey saved! Proceeding to preview...");
    router.push("/brand-lift/preview");
  };

  // Ensure we render only after mounting (to avoid SSR mismatches)
  if (!hasMounted) {
    return <div className="max-w-5xl mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* PAGE HEADER */}
      <header className="text-center">
        <h1 className="text-3xl font-bold">Survey Design</h1>
      </header>

      {/* QUESTION BUILDER SECTION */}
      <section className="border p-4 rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Question Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Select KPI</label>
            <select
              value={builderKpi}
              onChange={(e) => setBuilderKpi(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {kpis.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Question Type</label>
            <select
              value={builderQuestionType}
              onChange={(e) =>
                setBuilderQuestionType(e.target.value as "single" | "multiple")
              }
              className="w-full p-2 border rounded"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Question Text</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={builderQuestionText}
              onChange={(e) =>
                setBuilderQuestionText(e.target.value.toLowerCase())
              }
              className="w-full p-2 border rounded"
              placeholder="enter question text..."
            />
            <button
              onClick={applyMagicWandBuilder}
              className="px-3 py-2 border rounded text-yellow-600"
              title="Auto-suggest question text based on KPI"
            >
              <FaMagic />
            </button>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2">Answer Options</label>
          {builderAnswers.map((ans, idx) => (
            <div key={ans.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={ans.text}
                onChange={(e) =>
                  setBuilderAnswers((prev) =>
                    prev.map((a) =>
                      a.id === ans.id ? { ...a, text: e.target.value.toLowerCase() } : a
                    )
                  )
                }
                className="flex-grow p-2 border rounded"
                placeholder={`option ${idx + 1}`}
              />
              <button
                onClick={() => removeBuilderAnswer(ans.id)}
                className="px-2 py-1 border rounded text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addBuilderAnswer}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            + Add Option
          </button>
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={addNewQuestion}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Add Question
          </button>
        </div>
      </section>

      {/* DRAG & DROP: SURVEY QUESTIONS */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="surveyQuestions" isDropDisabled={false} isCombineEnabled={false}>
          {(provided) => (
            <section
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((q, index) => (
                <Draggable key={q.id} draggableId={q.id} index={index}>
                  {(draggableProvided) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className="border p-4 rounded bg-white shadow-sm"
                    >
                      {/* HEADER: Drag handle, question text, KPI, and actions */}
                      <div className="flex justify-between items-center">
                        <div
                          {...draggableProvided.dragHandleProps}
                          className="cursor-move p-1"
                        >
                          <span className="text-gray-400 text-xl">≡</span>
                        </div>
                        <div className="flex-grow ml-2">
                          <h3 className="text-lg font-semibold lowercase">
                            {index + 1}. {q.questionText}
                          </h3>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>
                              <strong>KPI:</strong> {getKpiTitle(q.kpi)}
                            </span>
                            {ALLOWED_KPI_KEYS.includes(q.kpi) ? (
                              <button
                                className="text-yellow-500"
                                onClick={() => {
                                  const suggested = suggestQuestionText(q.kpi);
                                  const updatedQ = {
                                    ...q,
                                    questionText: suggested.toLowerCase(),
                                  };
                                  setQuestions((prev) =>
                                    prev.map((x) => (x.id === q.id ? updatedQ : x))
                                  );
                                }}
                                title="Auto-suggest question text"
                              >
                                <FaMagic />
                              </button>
                            ) : (
                              <span className="text-red-600" title="Invalid KPI">
                                ⚠️
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingQuestion(q)}
                            className="px-3 py-1 border rounded text-blue-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setQuestions((prev) => prev.filter((qq) => qq.id !== q.id))
                            }
                            className="px-3 py-1 border rounded text-red-600 text-sm"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => toggleCollapse(q.id)}
                            className="px-3 py-1 border rounded text-sm"
                          >
                            {collapsed[q.id] ? "Expand" : "Collapse"}
                          </button>
                        </div>
                      </div>
                      {/* COLLAPSIBLE BODY */}
                      {!collapsed[q.id] && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-700">
                            Question type:{" "}
                            {q.questionType === "single" ? "Single Choice" : "Multiple Choice"}
                          </p>
                          {/* Answer Options */}
                          <div className="flex flex-wrap gap-4">
                            {q.answers.map((ans) => (
                              <div key={ans.id} className="flex flex-col items-center">
                                {ans.imageOrGif ? (
                                  <img
                                    src={ans.imageOrGif}
                                    alt="gif"
                                    className="w-36 h-36 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-36 h-36 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-500">
                                    no gif
                                  </div>
                                )}
                                <div className="mt-1 text-center text-sm lowercase">
                                  {ans.text}
                                </div>
                                <button
                                  onClick={() => openGifModal(q.id, ans.id)}
                                  className="mt-2 px-2 py-1 border rounded text-blue-600 text-sm"
                                >
                                  {ans.imageOrGif ? "Change GIF" : "Add GIF"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {draggableProvided.placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </section>
          )}
        </Droppable>
      </DragDropContext>

      {/* PREVIEW & SUBMIT BUTTON */}
      <div className="text-center mt-6">
        <button
          onClick={handlePreviewAndSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Preview & Submit
        </button>
      </div>

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(updated) =>
            setQuestions((prev) =>
              prev.map((q) => (q.id === updated.id ? updated : q))
            )
          }
        />
      )}

      {/* GIF MODAL */}
      {gifModalOpen && gifModalAnswer && (
        <GifModal
          onClose={closeGifModal}
          onSelectGif={handleSelectGif}
          sampleGifs={sampleGifs}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// EDIT QUESTION MODAL COMPONENT
// -----------------------------------------------------------------------------

interface EditQuestionModalProps {
  question: SurveyQuestion;
  onClose: () => void;
  onSave: (updated: SurveyQuestion) => void;
}

function EditQuestionModal({ question, onClose, onSave }: EditQuestionModalProps) {
  const [localQ, setLocalQ] = useState<SurveyQuestion>({ ...question });

  const updateAnswerText = (aId: string, text: string) => {
    setLocalQ((prev) => ({
      ...prev,
      answers: prev.answers.map((ans) =>
        ans.id === aId ? { ...ans, text: text.toLowerCase() } : ans
      ),
    }));
  };

  const addAnswerOption = () => {
    setLocalQ((prev) => ({
      ...prev,
      answers: [...prev.answers, { id: generateId(), text: "new option", imageOrGif: "" }],
    }));
  };

  const removeAnswerOption = (aId: string) => {
    setLocalQ((prev) => ({
      ...prev,
      answers: prev.answers.filter((ans) => ans.id !== aId),
    }));
  };

  const handleSave = () => {
    if (!localQ.questionText.trim()) {
      alert("Question text cannot be empty.");
      return;
    }
    if (localQ.answers.length < 2) {
      alert("At least 2 answer options are required.");
      return;
    }
    const finalQ = {
      ...localQ,
      questionText: localQ.questionText.trim().toLowerCase(),
      answers: localQ.answers.map((ans) => ({
        ...ans,
        text: ans.text.trim().toLowerCase(),
      })),
    };
    onSave(finalQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Question</h2>
        {/* Question Text */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Question Text</label>
          <input
            type="text"
            value={localQ.questionText}
            onChange={(e) => setLocalQ({ ...localQ, questionText: e.target.value })}
            className="w-full p-2 border rounded lowercase"
          />
        </div>
        {/* Question Type */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Question Type</label>
          <select
            value={localQ.questionType}
            onChange={(e) =>
              setLocalQ({ ...localQ, questionType: e.target.value as "single" | "multiple" })
            }
            className="w-full p-2 border rounded"
          >
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
          </select>
        </div>
        {/* KPI Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-1">KPI</label>
          <select
            value={localQ.kpi}
            onChange={(e) => setLocalQ({ ...localQ, kpi: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {kpis.map((k) => (
              <option key={k.key} value={k.key}>
                {k.title}
              </option>
            ))}
          </select>
        </div>
        {/* Answer Options */}
        <div>
          <h3 className="font-semibold mb-2">Answer Options</h3>
          {localQ.answers.map((ans) => (
            <div key={ans.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={ans.text}
                onChange={(e) => updateAnswerText(ans.id, e.target.value)}
                className="flex-grow p-2 border rounded lowercase"
                placeholder="answer text..."
              />
              <button
                onClick={() => removeAnswerOption(ans.id)}
                className="px-2 py-1 border rounded text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addAnswerOption}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            + Add Option
          </button>
        </div>
        {/* Footer: Cancel & Save */}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// GIF MODAL COMPONENT
// -----------------------------------------------------------------------------

interface GifModalProps {
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
  sampleGifs: string[];
}

function GifModal({ onClose, onSelectGif, sampleGifs }: GifModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">Select a GIF</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {sampleGifs.map((gifUrl) => (
            <img
              key={gifUrl}
              src={gifUrl}
              alt="gif"
              className="cursor-pointer border border-gray-200 rounded w-32 h-32 object-cover"
              onClick={() => onSelectGif(gifUrl)}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
            Upload GIF
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  const fileUrl = URL.createObjectURL(e.target.files[0]);
                  onSelectGif(fileUrl);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
