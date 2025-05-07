'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation'; // If needed for navigation from builder

// Actual DND Library Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// TODO: Import actual types from src/types/brand-lift.ts
// Simplified placeholders for now:
enum SurveyQuestionType_Builder {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}
interface SurveyOptionData_Builder {
  id?: string; // থাকবে না যখন নতুন তৈরি হবে
  tempId?: string; // For new, unsaved options
  questionId?: string; // Will be set when linked to a question
  text: string;
  imageUrl?: string | null;
  order: number;
}
interface SurveyQuestionData_Builder {
  id?: string; // থাকবে না যখন নতুন তৈরি হবে
  tempId?: string; // For new, unsaved questions
  studyId: string;
  text: string;
  questionType: SurveyQuestionType_Builder;
  order: number;
  isRandomized?: boolean;
  isMandatory?: boolean;
  kpiAssociation?: string | null;
  options: SurveyOptionData_Builder[];
}
interface SuggestedOption_Builder {
  text: string;
  imageUrl?: string | null;
}
interface AISuggestedQuestion_Builder {
  text: string;
  questionType: SurveyQuestionType_Builder;
  kpiAssociation?: string | null;
  options: Array<{ text: string; imageUrl?: string | null }>;
}

// Actual Shadcn UI Component Imports (assuming standard paths)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// import { Icon } from '@/components/ui/icon'; // For a potential FontAwesome icon component
// Assuming a trash icon and a grip icon are available via an Icon component or directly as SVGs
// import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
const DragHandleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-500 hover:text-gray-700"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.678-.113 1.017-.165m11.543 0c-1.291-.216-2.646-.354-4.034-.437m-6.5 0c1.387.083 2.743.221 4.034.437m0 0M6 6h12v2H6V6Zm12 12H6v-2h12v2Z"
    />
  </svg>
);

interface SurveyQuestionBuilderProps {
  studyId: string;
  // campaignCreative?: { type: 'image' | 'video', url: string }; // For displaying context
}

// Sortable Item (Question Card)
const SortableQuestionItem = ({
  question,
  index,
  updateQuestionField,
  deleteQuestion,
  saveQuestion,
  savingStates,
  addOptionToQuestion,
  updateOptionField,
  deleteOptionFromQuestion,
}: any) => {
  const questionId = (question.id || question.tempId) as string;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: questionId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1, // Slightly less opacity for better visibility
    boxShadow: isDragging
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '', // Add shadow when dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-4 last:mb-0">
      <Card className={isDragging ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-slate-50 border-b border-gray-300">
          <div className="flex items-center">
            <span {...listeners} className="cursor-grab p-1 mr-2 rounded hover:bg-slate-200">
              <DragHandleIcon />
            </span>
            <Label htmlFor={`q-text-${questionId}`} className="text-md font-medium text-slate-700">
              Question {question.order || index + 1}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => deleteQuestion(questionId)}
              variant="ghost"
              size="icon"
              className="text-red-600 hover:bg-red-100 hover:text-red-700 h-8 w-8"
            >
              <DeleteIcon />
            </Button>
            <Button
              onClick={() => saveQuestion(question)}
              size="sm"
              disabled={savingStates[questionId]}
              className="h-8"
            >
              {savingStates[questionId] ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor={`q-text-${questionId}`} className="font-medium">
              Question Text:
            </Label>
            <Textarea
              id={`q-text-${questionId}`}
              value={question.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateQuestionField(questionId, 'text', e.target.value)
              }
              placeholder="Enter your question text here (e.g., How familiar are you with Brand X?)"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`q-type-${questionId}`} className="font-medium">
                Question Type:
              </Label>
              <Select
                value={question.questionType}
                onValueChange={(value: string) =>
                  updateQuestionField(
                    questionId,
                    'questionType',
                    value as SurveyQuestionType_Builder
                  )
                }
              >
                <SelectTrigger id={`q-type-${questionId}`} className="mt-1">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SurveyQuestionType_Builder).map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`q-kpi-${questionId}`} className="font-medium">
                KPI Association (Optional):
              </Label>
              <Input
                id={`q-kpi-${questionId}`}
                value={question.kpiAssociation || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateQuestionField(questionId, 'kpiAssociation', e.target.value)
                }
                placeholder="e.g., Brand Awareness, Ad Recall"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`q-mandatory-${questionId}`}
                checked={!!question.isMandatory}
                onCheckedChange={(checked: boolean) =>
                  updateQuestionField(questionId, 'isMandatory', checked)
                }
              />
              <Label htmlFor={`q-mandatory-${questionId}`} className="font-normal text-sm">
                Mandatory Question
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`q-random-${questionId}`}
                checked={!!question.isRandomized}
                onCheckedChange={(checked: boolean) =>
                  updateQuestionField(questionId, 'isRandomized', checked)
                }
              />
              <Label htmlFor={`q-random-${questionId}`} className="font-normal text-sm">
                Randomize Answer Options
              </Label>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-md font-medium text-slate-700">Answer Options:</Label>
              <Button onClick={() => addOptionToQuestion(questionId)} size="sm" variant="outline">
                + Add Option
              </Button>
            </div>
            <div className="space-y-3">
              {question.options.map((opt: SurveyOptionData_Builder, optIndex: number) => {
                const currentOptKey = (opt.id || opt.tempId) as string;
                return (
                  <div
                    key={currentOptKey}
                    className="flex items-center space-x-2 p-3 border rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {/* TODO: Implement DND for options later */}
                    <span className="text-gray-400 cursor-not-allowed p-1">⠿</span>
                    <Input
                      value={opt.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateOptionField(questionId, currentOptKey, 'text', e.target.value)
                      }
                      placeholder={`Option ${opt.order || optIndex + 1} text`}
                      className="flex-grow"
                    />
                    <Input
                      value={opt.imageUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateOptionField(
                          questionId,
                          currentOptKey,
                          'imageUrl',
                          e.target.value || null
                        )
                      }
                      placeholder={`Image/GIF URL (optional)`}
                      className="flex-grow text-xs w-1/3"
                    />
                    <Button
                      onClick={() => deleteOptionFromQuestion(questionId, currentOptKey)}
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-100 hover:text-red-600 h-8 w-8"
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                );
              })}
            </div>
            {question.options.length === 0 && (
              <p className="text-xs text-gray-500 mt-2 p-2 text-center">
                No options added yet. Click "+ Add Option" to begin.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SurveyQuestionBuilder: React.FC<SurveyQuestionBuilderProps> = ({ studyId }) => {
  const [questions, setQuestions] = useState<SurveyQuestionData_Builder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [initialQuestionsState, setInitialQuestionsState] = useState<SurveyQuestionData_Builder[]>(
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      let data = await response.json();
      if (!Array.isArray(data)) data = [];
      const formattedQuestions = data.map((q: any, index: number) => ({
        ...q,
        id: q.id,
        order: q.order ?? index + 1,
        options:
          q.options?.map((opt: any, optIdx: number) => ({
            ...opt,
            id: opt.id,
            order: opt.order ?? optIdx + 1,
          })) || [],
      }));
      setQuestions(formattedQuestions);
      setInitialQuestionsState(JSON.parse(JSON.stringify(formattedQuestions)));
    } catch (err: any) {
      setError(err.message);
      setQuestions([]);
      setInitialQuestionsState([]);
    }
    setIsLoading(false);
  }, [studyId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSuggestQuestions = async () => {
    setIsAISuggesting(true);
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyId}/suggest-questions`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to get AI suggestions');
      const suggestions: AISuggestedQuestion_Builder[] = await response.json();
      const newQuestionsFromAI = suggestions.map(
        (s, idx) =>
          ({
            studyId,
            ...s,
            options: s.options.map((opt, optIdx) => ({
              ...opt,
              tempId: `ai-opt-${Date.now()}-${idx}-${optIdx}`,
              order: optIdx + 1,
            })),
            order: questions.length + idx + 1,
            tempId: `ai-q-${Date.now()}-${idx}`,
            isRandomized: false,
            isMandatory: true,
            kpiAssociation: s.kpiAssociation || null,
          }) as SurveyQuestionData_Builder
      );
      setQuestions(prev => [...prev, ...newQuestionsFromAI]);
    } catch (err: any) {
      setError(err.message);
    }
    setIsAISuggesting(false);
  };

  const saveQuestion = async (questionData: SurveyQuestionData_Builder) => {
    const questionKey = questionData.id || questionData.tempId;
    if (!questionKey) return;
    setSavingStates(prev => ({ ...prev, [questionKey as string]: true }));
    setError(null);

    const { tempId, studyId: sId, options: currentOptions, ...questionPayload } = questionData;

    try {
      let finalSavedQuestionData: SurveyQuestionData_Builder;

      if (questionData.id) {
        // --- EXISTING QUESTION ---
        const existingQuestionId = questionData.id;
        // 1. Update core question data
        const qResponse = await fetch(
          `/api/brand-lift/surveys/${studyId}/questions/${existingQuestionId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionPayload), // Contains text, type, order, kpi, isRandomized, isMandatory
          }
        );
        if (!qResponse.ok)
          throw new Error(
            `Failed to update question ${existingQuestionId}: ${await qResponse.text()}`
          );
        const updatedQuestionCore = await qResponse.json();

        const savedAndProcessedOptions: SurveyOptionData_Builder[] = [];
        const initialQuestionState = initialQuestionsState.find(iq => iq.id === existingQuestionId);
        const initialOptions = initialQuestionState?.options || [];

        // 2. Process current options: Update existing or Create new
        for (const currentOpt of currentOptions) {
          const {
            tempId: optTempId,
            questionId: optQId,
            id: optId,
            ...optPayloadForSave
          } = currentOpt;
          if (optId) {
            // Existing option: PUT if changed
            const initialOpt = initialOptions.find(io => io.id === optId);
            // More robust check: if any relevant field changed
            const hasChanged =
              !initialOpt ||
              initialOpt.text !== optPayloadForSave.text ||
              initialOpt.order !== optPayloadForSave.order ||
              initialOpt.imageUrl !== optPayloadForSave.imageUrl;

            if (hasChanged) {
              const optResponse = await fetch(
                `/api/brand-lift/surveys/${studyId}/questions/${existingQuestionId}/options/${optId}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(optPayloadForSave),
                }
              );
              if (!optResponse.ok)
                throw new Error(`Failed to update option ${optId}: ${await optResponse.text()}`);
              savedAndProcessedOptions.push(await optResponse.json());
            } else if (initialOpt) {
              savedAndProcessedOptions.push(initialOpt); // Unchanged, use initial version
            }
          } else {
            // New option for this existing question: POST
            const optResponse = await fetch(
              `/api/brand-lift/surveys/${studyId}/questions/${existingQuestionId}/options`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(optPayloadForSave),
              }
            );
            if (!optResponse.ok)
              throw new Error(
                `Failed to create new option for question ${existingQuestionId}: ${await optResponse.text()}`
              );
            savedAndProcessedOptions.push(await optResponse.json());
          }
        }

        // 3. Handle deleted options for existing question
        for (const initialOpt of initialOptions) {
          if (!currentOptions.some(co => co.id === initialOpt.id)) {
            const deleteResponse = await fetch(
              `/api/brand-lift/surveys/${studyId}/questions/${existingQuestionId}/options/${initialOpt.id}`,
              {
                method: 'DELETE',
              }
            );
            if (!deleteResponse.ok)
              throw new Error(
                `Failed to delete option ${initialOpt.id}: ${await deleteResponse.text()}`
              );
            // Option is removed, so not added to savedAndProcessedOptions
          }
        }
        finalSavedQuestionData = {
          ...updatedQuestionCore,
          options: savedAndProcessedOptions.sort((a, b) => a.order - b.order),
        };
      } else {
        // --- NEW QUESTION --- (Assumed to be already correctly handled by POST .../questions with all options)
        const optionsToCreate = currentOptions.map(opt => {
          const { id, tempId: optTempId, questionId: optQId, ...optPayload } = opt;
          return optPayload;
        });
        const response = await fetch(`/api/brand-lift/surveys/${studyId}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...questionPayload, options: optionsToCreate }),
        });
        if (!response.ok)
          throw new Error(`Failed to create question with options: ${await response.text()}`);
        finalSavedQuestionData = await response.json();
      }

      // Update local state: replace the old question (by id or tempId) with the fully saved one
      setQuestions(prevQs =>
        prevQs.map(q =>
          q.id === finalSavedQuestionData.id || (tempId && q.tempId === tempId)
            ? { ...finalSavedQuestionData, tempId: undefined }
            : q
        )
      );

      // Update initialQuestionsState to reflect the newly saved state
      if (finalSavedQuestionData.id) {
        setInitialQuestionsState(prevInitialQs => {
          const existingIndex = prevInitialQs.findIndex(iq => iq.id === finalSavedQuestionData.id);
          const newInitialQs = [...prevInitialQs];
          if (existingIndex > -1) {
            newInitialQs[existingIndex] = JSON.parse(JSON.stringify(finalSavedQuestionData));
          } else {
            newInitialQs.push(JSON.parse(JSON.stringify(finalSavedQuestionData)));
          }
          return newInitialQs;
        });
      }
    } catch (err: any) {
      setError(err.message);
      fetchQuestions(); // Simplistic error recovery: refetch all questions and their initial states
    }
    setSavingStates(prev => ({ ...prev, [questionKey as string]: false }));
  };

  const addBlankQuestion = () => {
    const newOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order)) + 1 : 1;
    const newQuestion: SurveyQuestionData_Builder = {
      tempId: `manual-q-${Date.now()}`,
      studyId,
      text: '',
      questionType: SurveyQuestionType_Builder.SINGLE_CHOICE,
      order: newOrder,
      isRandomized: false,
      isMandatory: true,
      options: [{ tempId: `manual-opt-${Date.now()}-0`, text: '', order: 1 }],
      kpiAssociation: null,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestionField = <K extends keyof SurveyQuestionData_Builder>(
    questionKey: string,
    field: K,
    value: SurveyQuestionData_Builder[K]
  ) => {
    setQuestions(prevQs =>
      prevQs.map(q =>
        q.id === questionKey || q.tempId === questionKey ? { ...q, [field]: value } : q
      )
    );
  };

  const addOptionToQuestion = (questionKey: string) => {
    setQuestions(prevQs =>
      prevQs.map(q => {
        if (q.id === questionKey || q.tempId === questionKey) {
          const newOrder =
            q.options.length > 0 ? Math.max(...q.options.map(opt => opt.order)) + 1 : 1;
          const newOption: SurveyOptionData_Builder = {
            tempId: `manual-opt-${Date.now()}-${q.options.length}`,
            text: '',
            order: newOrder,
            questionId: q.id,
          };
          return { ...q, options: [...q.options, newOption] };
        }
        return q;
      })
    );
  };

  const updateOptionField = (
    questionKey: string,
    optionKey: string,
    field: keyof Omit<SurveyOptionData_Builder, 'id' | 'tempId' | 'questionId'>,
    value: string | number | boolean | null | undefined
  ) => {
    setQuestions(prevQs =>
      prevQs.map(q => {
        if (q.id === questionKey || q.tempId === questionKey) {
          return {
            ...q,
            options: q.options.map(opt =>
              opt.id === optionKey || opt.tempId === optionKey ? { ...opt, [field]: value } : opt
            ),
          };
        }
        return q;
      })
    );
  };

  const deleteOptionFromQuestion = async (questionKey: string, optionKey: string) => {
    const question = questions.find(q => q.id === questionKey || q.tempId === questionKey);
    const option = question?.options.find(o => o.id === optionKey || o.tempId === optionKey);
    setQuestions(prevQs =>
      prevQs.map(q => {
        if (q.id === questionKey || q.tempId === questionKey) {
          return {
            ...q,
            options: q.options.filter(opt => !(opt.id === optionKey || opt.tempId === optionKey)),
          };
        }
        return q;
      })
    );
    if (option?.id && question?.id) {
      try {
        const response = await fetch(
          `/api/brand-lift/surveys/${studyId}/questions/${question.id}/options/${option.id}`,
          { method: 'DELETE' }
        );
        if (!response.ok) {
          setError('Failed to delete option from server. Reverting local change.');
          fetchQuestions();
        } else {
          setInitialQuestionsState(prev =>
            prev.map(iq =>
              iq.id === question.id
                ? { ...iq, options: iq.options.filter(io => io.id !== option.id) }
                : iq
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        fetchQuestions();
      }
    }
  };

  const deleteQuestion = async (questionKey: string) => {
    const questionToDelete = questions.find(q => q.id === questionKey || q.tempId === questionKey);
    setQuestions(prevQs => prevQs.filter(q => !(q.id === questionKey || q.tempId === questionKey)));
    if (questionToDelete?.id) {
      const qId = questionToDelete.id;
      setSavingStates(prev => ({ ...prev, [qId]: true }));
      try {
        const response = await fetch(`/api/brand-lift/surveys/${studyId}/questions/${qId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          setError('Failed to delete question from server. Reverting local change.');
          fetchQuestions();
        } else {
          setInitialQuestionsState(prev => prev.filter(iq => iq.id !== qId));
        }
      } catch (err: any) {
        setError(err.message);
        fetchQuestions();
      }
      setSavingStates(prev => ({ ...prev, [qId]: false }));
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions(items => {
        const oldIndex = items.findIndex(
          item => (item.id || item.tempId) === (active.id as string)
        );
        const newIndex = items.findIndex(item => (item.id || item.tempId) === (over.id as string));
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        const finalItems = reorderedItems.map((item, idx) => ({ ...item, order: idx + 1 }));
        console.log(
          'TODO: Call API to save new question order:',
          finalItems.map(q_1 => ({ id: q_1.id || q_1.tempId, order: q_1.order }))
        );
        setInitialQuestionsState(JSON.parse(JSON.stringify(finalItems)));
        return finalItems;
      });
    }
  }

  if (isLoading)
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64 w-full mb-4" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6 p-1">
      <Card className="bg-slate-50 p-4 shadow-sm border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-2xl text-slate-800">Survey Question Builder</CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Drag and drop to reorder questions. Click on a question to edit its content and
              options.
            </CardDescription>
          </div>
          <div className="flex space-x-2 mt-3 sm:mt-0 flex-shrink-0">
            <Button
              onClick={handleSuggestQuestions}
              disabled={isAISuggesting}
              variant="outline"
              size="sm"
            >
              {isAISuggesting ? 'Getting Suggestions...' : '✨ Suggest Questions (AI)'}
            </Button>
            <Button onClick={addBlankQuestion} size="sm">
              + Add Question Manually
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md border border-red-300">
          Error: {error}
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map(q => (q.id || q.tempId) as string)}
          strategy={verticalListSortingStrategy}
        >
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <SortableQuestionItem
                key={(q.id || q.tempId) as string}
                question={q}
                index={index}
                updateQuestionField={updateQuestionField}
                deleteQuestion={deleteQuestion}
                saveQuestion={saveQuestion}
                savingStates={savingStates}
                addOptionToQuestion={addOptionToQuestion}
                updateOptionField={updateOptionField}
                deleteOptionFromQuestion={deleteOptionFromQuestion}
              />
            ))
          ) : (
            <Card className="text-center p-8 border-dashed border-gray-300">
              <CardContent>
                <p className="text-gray-500">No questions yet.</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start by adding a question manually or get AI suggestions.
                </p>
                <Button onClick={addBlankQuestion} variant="outline" size="sm" className="mr-2">
                  + Add Manually
                </Button>
                <Button
                  onClick={handleSuggestQuestions}
                  disabled={isAISuggesting}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-500 hover:bg-blue-50"
                >
                  {isAISuggesting ? 'Working...' : '✨ Suggest with AI'}
                </Button>
              </CardContent>
            </Card>
          )}
        </SortableContext>
      </DndContext>

      {questions.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-slate-50 rounded-md border border-slate-200">
          <p className="text-sm text-slate-600">Remember to save individual question changes.</p>
          <div className="flex space-x-3">
            <Button onClick={addBlankQuestion} variant="outline">
              + Add New Question
            </Button>
            <Button
              onClick={() => alert('TODO: Navigate to Preview & Submit (Ticket BL-MVP-P2-05/06)')}
              className="bg-green-600 hover:bg-green-700"
            >
              Save All & Preview Survey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionBuilder;
