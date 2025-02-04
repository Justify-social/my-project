// src/app/brand-lift/survey-design/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface SurveyQuestion {
  id: number;
  question: string;
  type: string;
}

export default function SurveyDesignPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const router = useRouter();

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

  useEffect(() => {
    // Generate a default survey of 10 questions for the MVP.
    const defaultQuestions: SurveyQuestion[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: `Default question ${i + 1}?`,
      type: "single",
    }));
    setQuestions(defaultQuestions);
  }, []);

  const handleSaveSurvey = () => {
    // For MVP, simply navigate to the approval page.
    router.push(`/brand-lift/survey-approval?campaignId=${campaignId}`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Survey Design for Brand Lift</h1>
      <p>Campaign ID: {campaignId}</p>
      <div>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "1rem" }}>
            <label>
              Question {q.id}:
              <input
                type="text"
                value={q.question}
                onChange={(e) => {
                  const updated = questions.map((question) =>
                    question.id === q.id ? { ...question, question: e.target.value } : question
                  );
                  setQuestions(updated);
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleSaveSurvey}>Save and Continue</button>
    </div>
  );
}
