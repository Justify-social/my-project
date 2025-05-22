import React from 'react';
import { SurveyQuestionData } from '@/types/brand-lift';
import { Icon } from '@/components/ui/icon/icon';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface SurveyQuestionPreviewListProps {
  questions: SurveyQuestionData[];
  // Add any other props needed for styling or context, e.g., platform: 'generic' | 'desktop'
}

const SurveyQuestionPreviewList: React.FC<SurveyQuestionPreviewListProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return <p className="text-muted-foreground">No survey questions available for preview.</p>;
  }

  const questionTypeIconMap: Record<string, string> = {
    SINGLE_CHOICE: 'faListRadioLight',
    MULTIPLE_CHOICE: 'faListCheckLight',
  };

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const iconId = questionTypeIconMap[question.questionType];
        return (
          <div key={question.id || `q-prev-${index}`} className="p-4 border rounded-lg shadow">
            <div className="flex items-start mb-1">
              {iconId && (
                <div className="mr-2 w-4 h-[1.5rem] flex items-center flex-shrink-0">
                  <Icon iconId={iconId} className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <h3 className="text-md font-semibold leading-[1.5rem]">
                Question {index + 1}: {question.text}
              </h3>
            </div>
            {question.questionType && (
              <p className="text-xs text-muted-foreground capitalize">
                Type: {question.questionType.toLowerCase().replace('_', ' ')}
              </p>
            )}
            {question.options && question.options.length > 0 && (
              <div className="mt-3 space-y-2 pl-4">
                <p className="text-sm font-medium">Options:</p>
                {question.options
                  .sort((a, b) => a.order - b.order)
                  .map(opt => (
                    <div
                      key={opt.id || `opt-prev-${opt.tempId}`}
                      className="flex items-center space-x-2 p-2 border rounded bg-gray-50 dark:bg-gray-700"
                    >
                      {/* Image/GIF first, then text */}
                      {opt.imageUrl && (
                        <img
                          src={opt.imageUrl}
                          alt={opt.text}
                          className="mr-2 h-10 w-10 object-contain inline-block rounded"
                        />
                      )}
                      <span className="text-sm">{opt.text}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

SurveyQuestionPreviewList.displayName = 'SurveyQuestionPreviewList';

export { SurveyQuestionPreviewList };
