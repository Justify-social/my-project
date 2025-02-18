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
    // ... rest of the questions array (exactly as in your original file)
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

// ... All your component definitions (SurveyHeader, SurveyQuestionCard, etc.) exactly as they were

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export default function SurveyApprovalContent() {
  return (
    <div>
      <h1>Survey Approval Content</h1>
      {/* Full content will be added later */}
    </div>
  );
} 