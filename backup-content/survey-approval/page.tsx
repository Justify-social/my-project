"use client";

import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  ChangeEvent,
  FC
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

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

/* ============================================================================
   TYPE DEFINITIONS
   ============================================================================ */

interface ReviewerComment {
  id: number;
  name: string;
  comment: string;
  suggestion: "Implement Suggestions" | "No Changes Needed";
}

interface SurveyAnswer {
  id: string;
  label: string;
  imageUrl?: string;
}

interface SurveyQuestion {
  id: string;
  prompt: string;
  type: "radio" | "text" | "multiple";
  kpi: string;
  answers?: SurveyAnswer[];
  placeholder?: string;
  selectedAnswer?: string;
  typedResponse?: string;
}

interface SurveyData {
  id: number;
  title: string;
  subTitle: string;
  questions: SurveyQuestion[];
}

/**
 * Maps a KPI key to its display title.
 */
function getKpiTitle(key: string): string {
  const kpiMap: Record<string, string> = {
    adRecall: "Ad Recall",
    brandAwareness: "Brand Awareness",
    consideration: "Consideration",
    messageAssociation: "Message Association",
    brandPreference: "Brand Preference",
    purchaseIntent: "Purchase Intent",
    actionIntent: "Action Intent",
    recommendationIntent: "Recommendation Intent",
    advocacy: "Advocacy",
    overall: "Overall Brand Lift"
  };
  return kpiMap[key] || key;
}

/* ============================================================================
   DEFAULT DATA (Fallback)
   ============================================================================ */

const catImages = [
  "https://placekitten.com/100/100",
  "https://placekitten.com/101/100",
  "https://placekitten.com/102/100",
  "https://placekitten.com/103/100"
];

const defaultSurvey: SurveyData = {
  id: 1,
  title: "Collaborative Approval & Sign-Off",
  subTitle:
    "A process to ensure team consensus and final sign-off before completion",
  questions: [
    {
      id: "q1",
      prompt: "How familiar are you with the brand shown in the clip?",
      type: "radio",
      kpi: "adRecall",
      answers: [
        { id: "q1a1", label: "very familiar", imageUrl: catImages[0] },
        { id: "q1a2", label: "somewhat familiar", imageUrl: catImages[1] },
        { id: "q1a3", label: "not familiar at all", imageUrl: catImages[2] },
        { id: "q1a4", label: "no/other", imageUrl: catImages[3] }
      ]
    },
    {
      id: "q2",
      prompt: "What do you remember most from the ad?",
      type: "text",
      kpi: "overall",
      placeholder: "Type your response here..."
    },
    {
      id: "q3",
      prompt: "How likely are you to talk about the brand?",
      type: "radio",
      kpi: "consideration",
      answers: [
        { id: "q3a1", label: "very likely" },
        { id: "q3a2", label: "maybe" },
        { id: "q3a3", label: "unlikely" }
      ]
    },
    {
      id: "q4",
      prompt: "How strongly do you associate our key messages with our brand?",
      type: "multiple",
      kpi: "messageAssociation",
      answers: [
        { id: "q4a1", label: "strong association" },
        { id: "q4a2", label: "moderate association" },
        { id: "q4a3", label: "weak association" },
        { id: "q4a4", label: "no association" }
      ]
    },
    {
      id: "q5",
      prompt: "Which brand do you prefer among competitors?",
      type: "radio",
      kpi: "brandPreference",
      answers: [
        { id: "q5a1", label: "our brand" },
        { id: "q5a2", label: "competitor a" },
        { id: "q5a3", label: "competitor b" },
        { id: "q5a4", label: "no preference" }
      ]
    },
    {
      id: "q6",
      prompt: "How likely are you to buy our product?",
      type: "radio",
      kpi: "purchaseIntent",
      answers: [
        { id: "q6a1", label: "definitely will buy" },
        { id: "q6a2", label: "might buy" },
        { id: "q6a3", label: "won't buy" }
      ]
    },
    {
      id: "q7",
      prompt: "How likely are you to visit our website after seeing our ad?",
      type: "radio",
      kpi: "actionIntent",
      answers: [
        { id: "q7a1", label: "very likely" },
        { id: "q7a2", label: "somewhat likely" },
        { id: "q7a3", label: "not likely" }
      ]
    },
    {
      id: "q8",
      prompt: "How likely are you to recommend our brand to others?",
      type: "radio",
      kpi: "recommendationIntent",
      answers: [
        { id: "q8a1", label: "very likely" },
        { id: "q8a2", label: "somewhat likely" },
        { id: "q8a3", label: "not likely" }
      ]
    },
    {
      id: "q9",
      prompt: "How willing are you to promote our brand on social media?",
      type: "multiple",
      kpi: "advocacy",
      answers: [
        { id: "q9a1", label: "extremely willing" },
        { id: "q9a2", label: "somewhat willing" },
        { id: "q9a3", label: "not willing" }
      ]
    },
    {
      id: "q10",
      prompt: "Overall, how has your perception of our brand changed?",
      type: "radio",
      kpi: "overall",
      answers: [
        { id: "q10a1", label: "much more positive" },
        { id: "q10a2", label: "somewhat more positive" },
        { id: "q10a3", label: "unchanged" },
        { id: "q10a4", label: "worse" }
      ]
    }
  ]
};

const defaultComments: ReviewerComment[] = [
  {
    id: 1,
    name: "Lucas Atkins",
    comment: "Could we add a short intro or a note at the beginning for clarity?",
    suggestion: "Implement Suggestions"
  },
  {
    id: 2,
    name: "Ethan Clay",
    comment: "Maybe we shorten the question about brand talk? It's a bit long.",
    suggestion: "Implement Suggestions"
  },
  {
    id: 3,
    name: "Marta Escobar",
    comment: "I think the images are fun! No real changes needed.",
    suggestion: "No Changes Needed"
  },
  {
    id: 4,
    name: "Asra Patel",
    comment: "All good from my side!",
    suggestion: "No Changes Needed"
  }
];

/* ============================================================================
   STATE MANAGEMENT WITH useReducer
   ============================================================================ */

type SurveyAction =
  | { type: "SET_SURVEY"; survey: SurveyData }
  | { type: "SELECT_ANSWER"; questionId: string; answerId: string }
  | { type: "TYPE_RESPONSE"; questionId: string; response: string };

function surveyReducer(
  state: SurveyData,
  action: SurveyAction
): SurveyData {
  switch (action.type) {
    case "SET_SURVEY":
      return action.survey;
    case "SELECT_ANSWER":
      return {
        ...state,
        questions: state.questions.map(q =>
          q.id === action.questionId && q.answers
            ? { ...q, selectedAnswer: action.answerId }
            : q
        )
      };
    case "TYPE_RESPONSE":
      return {
        ...state,
        questions: state.questions.map(q =>
          q.id === action.questionId && q.type === "text"
            ? { ...q, typedResponse: action.response }
            : q
        )
      };
    default:
      return state;
  }
}

/* ============================================================================
   COMPONENTS
   ============================================================================ */

/**
 * SurveyHeader: Displays the page title and survey details.
 */
const SurveyHeader: FC<{
  campaignId: string;
  survey: SurveyData;
  onRequestSignOff: () => void;
}> = ({ campaignId, survey, onRequestSignOff }) => (
  <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-divider-color pb-4 mb-6">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold text-primary-color">Survey Approval</h1>
      <p className="text-sm text-secondary-color">
        {survey.title} &mdash; {survey.subTitle}
      </p>
    </div>
    <div className="mt-4 md:mt-0">
      <button
        onClick={onRequestSignOff}
        aria-label="Request Formal Sign-Off"
        className="px-4 py-2 bg-gray-200 text-primary-color rounded hover:bg-gray-300 text-sm"
      >
        Request Formal Sign-Off
      </button>
    </div>
  </header>
);

/**
 * SurveyQuestionCard: Renders a survey question.
 */
const SurveyQuestionCard: FC<{
  question: SurveyQuestion;
  onSelectAnswer: (qId: string, answerId: string) => void;
  onTypeResponse: (qId: string, response: string) => void;
}> = ({ question, onSelectAnswer, onTypeResponse }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 className="font-semibold text-primary-color text-base">
        {question.prompt}
      </h2>
      {question.type === "radio" && question.answers && (
        <div className="flex flex-wrap gap-4">
          {question.answers.length === 0 ? (
            <p className="text-sm text-secondary-color">
              No answer choices provided.
            </p>
          ) : (
            question.answers.map((ans) => {
              const selected = question.selectedAnswer === ans.id;
              return (
                <label
                  key={ans.id}
                  className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition duration-150 ${
                    selected
                      ? "bg-blue-50 border-blue-600"
                      : "bg-white border-divider-color hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={selected}
                    onChange={() => onSelectAnswer(question.id, ans.id)}
                    className="hidden"
                  />
                  {ans.imageUrl && (
                    <img
                      src={ans.imageUrl}
                      alt={ans.label}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <span className="text-sm text-primary-color lowercase">
                    {ans.label}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
      {question.type === "text" && (
        <textarea
          className="w-full border border-divider-color rounded p-2 text-sm text-primary-color"
          rows={3}
          placeholder={question.placeholder}
          value={question.typedResponse || ""}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onTypeResponse(question.id, e.target.value)
          }
          aria-label="Text Response"
        />
      )}
      {question.type !== "radio" && question.type !== "text" && (
        <p className="text-red-500">
          Unknown question type: <strong>{question.type}</strong>
        </p>
      )}
    </div>
  );
};

/**
 * ReviewerCommentCard: Renders a reviewer comment with reply functionality.
 */
const ReviewerCommentCard: FC<{
  comment: ReviewerComment;
  onSuggestion: (id: number, suggestion: string) => void;
}> = ({ comment, onSuggestion }) => {
  const [replyOpen, setReplyOpen] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");

  const toggleReply = useCallback(() => {
    setReplyOpen((prev) => !prev);
  }, []);

  const handleSendReply = useCallback(() => {
    alert(`Reply sent for comment ID ${comment.id}: ${replyText}`);
    setReplyText("");
    setReplyOpen(false);
  }, [comment.id, replyText]);

  return (
    <div className="border border-divider-color bg-white rounded-lg shadow p-3 space-y-2">
      <p className="text-sm font-semibold text-primary-color">{comment.name}</p>
      <p className="text-sm text-secondary-color">{comment.comment}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onSuggestion(comment.id, comment.suggestion)}
          aria-label={`Suggestion: ${comment.suggestion}`}
          className={`px-3 py-1 text-sm rounded transition duration-150 ${
            comment.suggestion === "Implement Suggestions"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {comment.suggestion}
        </button>
        <button
          onClick={toggleReply}
          aria-label="Reply to comment"
          className="px-3 py-1 text-sm rounded bg-gray-100 text-primary-color hover:bg-gray-200 transition duration-150"
        >
          Reply
        </button>
      </div>
      {replyOpen && (
        <div className="space-y-2">
          <textarea
            className="w-full border border-divider-color rounded p-2 text-sm text-primary-color"
            rows={2}
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setReplyText(e.target.value)
            }
          />
          <button
            onClick={handleSendReply}
            aria-label="Send Reply"
            className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ReviewerCommentsPanel: Renders the panel of reviewer comments.
 */
const ReviewerCommentsPanel: FC<{
  comments: ReviewerComment[];
  onSuggestion: (id: number, suggestion: string) => void;
}> = ({ comments, onSuggestion }) => (
  <aside className="w-full lg:w-80 space-y-6">
    <h2 className="text-lg font-semibold text-primary-color">
      Comments from Reviewers
    </h2>
    {comments.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-3">
        <p className="text-sm text-secondary-color">No comments available.</p>
      </div>
    ) : (
      comments.map((rev) => (
        <ReviewerCommentCard
          key={rev.id}
          comment={rev}
          onSuggestion={onSuggestion}
        />
      ))
    )}
  </aside>
);

/**
 * ActionRow: Renders the bottom row of action buttons.
 */
const ActionRow: FC<{ onReturn: () => void; onSubmit: () => void }> = ({
  onReturn,
  onSubmit
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
    <button
      onClick={onReturn}
      aria-label="Return for Edits"
      className="px-4 py-2 bg-gray-100 text-primary-color rounded hover:bg-gray-200 text-sm"
    >
      Return for Edits
    </button>
    <button
      onClick={onSubmit}
      aria-label="Submit for Data Collection"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
    >
      Submit for Data Collection
    </button>
  </div>
);

/* ============================================================================
   MAIN COMPONENT: SurveyApprovalPage
   ============================================================================ */

export default function SurveyApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaignId") || "";
  const [campaignId, setCampaignId] = useState<string>(initialCampaignId);

  // Ensure hooks are always called.
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Load saved survey and campaignId from sessionStorage.
  const [survey, dispatch] = useReducer(surveyReducer, defaultSurvey);
  useEffect(() => {
    if (hasMounted) {
      const savedSurvey = sessionStorage.getItem("surveyData");
      if (savedSurvey) {
        dispatch({ type: "SET_SURVEY", survey: JSON.parse(savedSurvey) });
      }
      const savedCampaign = sessionStorage.getItem("campaignId");
      if (savedCampaign) {
        setCampaignId(savedCampaign);
      }
    }
  }, [hasMounted]);

  const [comments] = useState<ReviewerComment[]>(defaultComments);

  // Drag-and-drop handler for reordering survey questions.
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(survey.questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    dispatch({ type: "SET_SURVEY", survey: { ...survey, questions: reordered } });
  };

  // Event handlers.
  const handleSelectAnswer = useCallback(
    (qId: string, answerId: string) => {
      dispatch({ type: "SELECT_ANSWER", questionId: qId, answerId });
    },
    []
  );

  const handleTypeResponse = useCallback(
    (qId: string, response: string) => {
      dispatch({ type: "TYPE_RESPONSE", questionId: qId, response });
    },
    []
  );

  const handleRequestSignOff = useCallback(() => {
    alert("Request for formal sign-off sent!");
  }, []);

  const handleSubmitForDataCollection = useCallback(() => {
    alert("Survey submitted for data collection!");
    // Optionally, navigate after submission:
    // router.push(`/brand-lift/progress?campaignId=${campaignId}`);
  }, [campaignId]);

  const handleReturnForEdits = useCallback(() => {
    router.push(`/brand-lift/survey-design?campaignId=${campaignId}`);
  }, [router, campaignId]);

  const handleSuggestionAction = useCallback(
    (commentId: number, suggestion: string) => {
      alert(`Handling suggestion "${suggestion}" for comment ID: ${commentId}`);
    },
    []
  );

  return !hasMounted ? (
    <div className="p-6">
      <p className="text-gray-600">Loading Survey Approval Screen...</p>
    </div>
  ) : (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
      <SurveyHeader
        campaignId={campaignId}
        survey={survey}
        onRequestSignOff={handleRequestSignOff}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Drag & Drop Survey Questions */}
        <section className="flex-1 space-y-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="surveyQuestions" isDropDisabled={false}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {survey.questions.map((q, index) => (
                    <Draggable key={q.id} draggableId={q.id} index={index}>
                      {(draggableProvided) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className="bg-white rounded-lg shadow p-4"
                        >
                          <div className="flex justify-between items-center">
                            <div
                              {...draggableProvided.dragHandleProps}
                              className="cursor-move p-1"
                            >
                              <span className="text-gray-400 text-xl">≡</span>
                            </div>
                            <div className="flex-grow ml-2">
                              <h3 className="text-lg font-semibold lowercase">
                                {index + 1}. {q.prompt}
                              </h3>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <span>
                                  <strong>KPI:</strong> {getKpiTitle(q.kpi)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <SurveyQuestionCard
                            question={q}
                            onSelectAnswer={handleSelectAnswer}
                            onTypeResponse={handleTypeResponse}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>
        {/* Right Column: Reviewer Comments */}
        <ReviewerCommentsPanel
          comments={comments}
          onSuggestion={handleSuggestionAction}
        />
      </div>
      <ActionRow
        onReturn={handleReturnForEdits}
        onSubmit={handleSubmitForDataCollection}
      />
    </div>
  );
}
