'use client';

import React, { useState, useEffect, useCallback } from 'react';

// TODO: Import actual types from src/types/brand-lift.ts
// Using _Preview suffix to denote these are local component state/prop types
enum SurveyQuestionType_Preview {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}
interface SurveyOptionData_Preview {
  id: string;
  text: string;
  imageUrl?: string | null;
  order: number;
}
interface SurveyQuestionData_Preview {
  id: string;
  studyId: string;
  text: string;
  questionType: SurveyQuestionType_Preview;
  order: number;
  isRandomized?: boolean;
  isMandatory?: boolean;
  options: SurveyOptionData_Preview[];
}

type PlatformType = 'TikTok' | 'Instagram' | 'Generic';

// --- Start of UI component placeholders ---
// These would be actual imports from Shadcn in a real scenario.
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b border-gray-200">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-700">{children}</h3>
);
const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-4 ${className}`}>{children}</div>;

const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'icon' | 'default';
    className?: string;
  }
) => (
  <button
    {...props}
    className={`px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors 
            ${
              props.variant === 'outline'
                ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                : props.variant === 'ghost'
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            } 
            ${props.size === 'sm' ? 'px-3 py-1.5 text-xs' : props.size === 'icon' ? 'p-2' : 'px-4 py-2 text-sm'}
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${props.className || ''}`}
  />
);
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className || 'h-6 w-full mb-2'}`}></div>
);

// Basic RadioGroup & RadioGroupItem placeholders for survey options
const RadioGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div role="radiogroup" className={`space-y-2 ${className}`}>
    {children}
  </div>
);
const RadioGroupItem = ({
  value,
  id,
  children,
  checked,
  disabled,
  className,
}: {
  value: string;
  id: string;
  children: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <input
      type="radio"
      name={id.split('-')[0]}
      id={id}
      value={value}
      checked={checked}
      disabled={disabled}
      className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {children}
    </label>
  </div>
);
const Label = (props: any) => (
  <label {...props} className="block text-sm font-medium text-gray-700 mb-1" />
);
const Checkbox = ({
  id,
  checked,
  disabled,
  children,
}: {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    {children && (
      <Label htmlFor={id} className="ml-2 text-sm text-gray-700 font-normal">
        {children}
      </Label>
    )}
  </div>
);
// --- End of UI component placeholders ---

interface SurveyPreviewProps {
  studyId: string;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ studyId }) => {
  const [questions, setQuestions] = useState<SurveyQuestionData_Preview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<PlatformType>('Generic');

  const fetchSurveyStructure = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyId}/questions`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch survey structure: ${response.statusText} - ${errorData.error || 'Server error'}`
        );
      }
      const data = await response.json();
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message);
      setQuestions([]);
    }
    setIsLoading(false);
  }, [studyId]);

  useEffect(() => {
    if (studyId) {
      fetchSurveyStructure();
    }
  }, [studyId, fetchSurveyStructure]);

  const getPlatformSpecificStyles = () => {
    // Basic conceptual styling - a real implementation would be more complex
    switch (activePlatform) {
      case 'TikTok':
        return {
          containerClass:
            'bg-black text-white p-4 rounded-lg w-[320px] h-[600px] mx-auto shadow-xl font-sans flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black',
          questionClass: 'text-base font-semibold mb-2 px-2',
          optionClass:
            'block w-full text-left p-2.5 my-1.5 border border-gray-700 rounded-md hover:bg-gray-800 text-sm bg-gray-900',
          imageClass: 'max-w-full h-auto rounded-md my-2 border border-gray-600',
          headerClass: 'text-center text-lg font-bold py-3 sticky top-0 bg-black z-10',
          footerClass:
            'text-xs text-center mt-auto pt-3 pb-1 text-gray-500 sticky bottom-0 bg-black z-10',
        };
      case 'Instagram':
        return {
          containerClass:
            'bg-white border-2 border-gray-800 p-1 rounded-2xl w-[320px] h-[600px] mx-auto shadow-2xl flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
          questionClass: 'text-sm font-medium mb-2 px-3 pt-3',
          optionClass:
            'block w-full text-left p-2 mx-3 my-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs',
          imageClass: 'max-w-full h-auto rounded-lg my-1.5',
          headerClass: 'text-center text-md font-semibold py-2 border-b px-3',
          footerClass: 'text-xs text-center mt-auto pt-2 pb-1 text-gray-500 border-t px-3',
        };
      default: // Generic / Web Preview
        return {
          containerClass: 'bg-gray-50 p-6 rounded-lg border border-gray-200',
          questionClass: 'text-lg font-semibold mb-3 text-gray-800',
          optionClass:
            'block w-full text-left p-3 my-2 border border-gray-300 rounded-md hover:bg-gray-100 bg-white text-gray-700 shadow-sm',
          imageClass: 'max-w-xs h-auto rounded-md my-2 border',
          headerClass: 'text-xl font-bold mb-4 text-gray-800',
          footerClass: 'text-sm text-center mt-6 text-gray-500',
        };
    }
  };

  const styles = getPlatformSpecificStyles();

  if (isLoading)
    return (
      <Card className="max-w-xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Loading Survey Preview...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-10">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  if (error)
    return (
      <Card className="max-w-xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent className="text-red-700 py-10">
          <p>Could not load survey preview: {error}</p>
          <Button onClick={fetchSurveyStructure} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  if (questions.length === 0)
    return (
      <Card className="max-w-xl mx-auto mt-6">
        <CardHeader>
          <CardTitle>Survey Empty</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 py-10">
          <p>
            No questions have been added to this survey yet. Please go back to the survey builder.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <div className="mb-6 flex justify-center items-center space-x-2 p-2 bg-gray-100 rounded-lg shadow-sm">
        <Label className="text-sm font-medium text-gray-700">Preview Mode:</Label>
        {(['Generic', 'TikTok', 'Instagram'] as PlatformType[]).map(platform => (
          <Button
            key={platform}
            onClick={() => setActivePlatform(platform)}
            variant={activePlatform === platform ? 'default' : 'outline'}
            size="sm"
            className={
              activePlatform === platform
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }
          >
            {platform}
          </Button>
        ))}
      </div>

      <Card className={styles.containerClass}>
        <div className={styles.headerClass}>
          {activePlatform !== 'Generic' ? `${activePlatform} Preview` : 'Survey Preview'}
        </div>
        {questions.map((q, index) => (
          <div key={q.id || `q-${index}`} className="mb-5 px-1 sm:px-0">
            <p className={styles.questionClass}>
              {index + 1}. {q.text} {q.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </p>

            {q.questionType === SurveyQuestionType_Preview.SINGLE_CHOICE && (
              <RadioGroup className="mt-2 space-y-1.5">
                {q.options.map(opt => (
                  <div key={opt.id || `opt-${opt.order}`} className={styles.optionClass}>
                    <RadioGroupItem
                      value={opt.id}
                      id={`${q.id}-opt-${opt.id}`}
                      disabled // Preview is not interactive
                    >
                      {opt.text}
                    </RadioGroupItem>
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt={opt.text}
                        className={`ml-7 mt-1 ${styles.imageClass}`}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}
            {q.questionType === SurveyQuestionType_Preview.MULTIPLE_CHOICE && (
              <div className="mt-2 space-y-1.5">
                {q.options.map(opt => (
                  <div key={opt.id || `opt-${opt.order}`} className={styles.optionClass}>
                    <Checkbox
                      id={`${q.id}-opt-${opt.id}`}
                      disabled // Preview is not interactive
                    >
                      {opt.text}
                    </Checkbox>
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt={opt.text}
                        className={`ml-7 mt-1 ${styles.imageClass}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className={styles.footerClass}>
          {activePlatform !== 'Generic' ? `End of ${activePlatform} Preview` : 'End of Preview'}
        </div>
      </Card>
    </div>
  );
};

export default SurveyPreview;
