'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  Modifiers,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'; // Comment out if types not found
import yaml from 'js-yaml';
import { z } from 'zod';
import { SurveyQuestionType } from '@prisma/client'; // Import directly from Prisma

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';
import { SurveyQuestionData, SurveyOptionData, BrandLiftStudyData } from '@/types/brand-lift';

// --- KPI Formatting Utilities --- START ---
const kpiDisplayNames: Record<string, string> = {
  adRecall: 'Ad Recall',
  brandAwareness: 'Brand Awareness',
  consideration: 'Consideration',
  messageAssociation: 'Message Association',
  brandPreference: 'Brand Preference',
  purchaseIntent: 'Purchase Intent',
  actionIntent: 'Action Intent',
  recommendationIntent: 'Recommendation Intent',
  advocacy: 'Advocacy',
  // Add any other KPIs that might appear here
};

const formatKpiName = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return 'N/A';
  // Normalizes keys like BRAND_AWARENESS or brand_awareness to brandAwareness
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return (
    kpiDisplayNames[normalizedKey] || // Check against map first
    // Fallback formatting if not in map
    kpiKey
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  );
};
// --- KPI Formatting Utilities --- END ---

// --- Zod Schemas for AI Response Validation ---
const aiOptionSchema = z.object({
  text: z.string(),
  image_description: z.string().optional().nullable(),
});

const aiQuestionSchema = z.object({
  number: z.number().optional(),
  text: z.string(),
  type: z.nativeEnum(SurveyQuestionType), // Use direct SurveyQuestionType from Prisma
  objective: z.string().optional().nullable(),
  kpi_association: z.string().optional().nullable(),
  is_randomized: z.boolean().optional().default(false),
  is_mandatory: z.boolean().optional().default(true),
  options: z.array(aiOptionSchema).min(1),
});
const aiSuggestedQuestionsSchema: z.ZodArray<typeof aiQuestionSchema> = z.array(aiQuestionSchema);

type ValidatedAiQuestion = z.infer<typeof aiQuestionSchema>;
type ValidatedAiOption = z.infer<typeof aiOptionSchema>;

interface SurveyQuestionBuilderProps {
  studyId: string;
}

const generateTempId = () => `temp_${Math.random().toString(36).substring(2, 9)}`;

interface SortableQuestionItemProps {
  question: SurveyQuestionData;
  index: number;
  onUpdateQuestionText: (questionIdOrTempId: string, text: string) => void;
  onUpdateQuestionType: (questionIdOrTempId: string, type: SurveyQuestionType) => void;
  onUpdateQuestionOrder: (questionIdOrTempId: string, order: number) => void;
  onToggleRandomized: (questionIdOrTempId: string, checked: boolean) => void;
  onToggleMandatory: (questionIdOrTempId: string, checked: boolean) => void;
  onUpdateKpiAssociation: (questionIdOrTempId: string, kpi: string | null) => void;
  onDeleteQuestion: (questionIdOrTempId: string) => void;
  onAddOption: (questionIdOrTempId: string) => void;
  onUpdateOptionText: (questionIdOrTempId: string, optionIdOrTempId: string, text: string) => void;
  onUpdateOptionImageUrl: (
    questionIdOrTempId: string,
    optionIdOrTempId: string,
    imageUrl: string | null
  ) => void;
  onUpdateOptionOrder: (
    questionIdOrTempId: string,
    optionIdOrTempId: string,
    order: number
  ) => void;
  onDeleteOption: (questionIdOrTempId: string, optionIdOrTempId: string) => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = React.memo(
  ({
    question,
    index,
    onUpdateQuestionText,
    onUpdateQuestionType,
    onUpdateQuestionOrder,
    onToggleRandomized,
    onToggleMandatory,
    onUpdateKpiAssociation,
    onDeleteQuestion,
    onAddOption,
    onUpdateOptionText,
    onUpdateOptionImageUrl,
    onUpdateOptionOrder,
    onDeleteOption,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: question.id || question.tempId!,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 10 : 'auto',
    };
    const qId = question.id || question.tempId!;

    return (
      <Card ref={setNodeRef} style={style} className="mb-4 bg-white shadow-sm relative group">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div
              {...attributes}
              {...listeners}
              className="p-1 cursor-grab opacity-50 hover:opacity-100"
            >
              <Icon iconId="faBarsLight" className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-md">Question {index + 1}</CardTitle>
          </div>
          <IconButtonAction
            iconBaseName="faTrashCan"
            hoverColorClass="text-destructive"
            ariaLabel="Delete question"
            onClick={() => onDeleteQuestion(qId)}
          />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={question.text}
            onChange={e => onUpdateQuestionText(qId, e.target.value)}
            placeholder="Enter question text..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={question.questionType}
              onValueChange={v => onUpdateQuestionType(qId, v as SurveyQuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SurveyQuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                <SelectItem value={SurveyQuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={question.order}
              onChange={e => onUpdateQuestionOrder(qId, parseInt(e.target.value, 10) || 0)}
              placeholder="Order"
              className="w-20"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`rand-${qId}`}
                checked={question.isRandomized ?? false}
                onCheckedChange={c => onToggleRandomized(qId, c)}
              />
              <Label htmlFor={`rand-${qId}`}>Randomise Options</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`mand-${qId}`}
                checked={question.isMandatory ?? true}
                onCheckedChange={c => onToggleMandatory(qId, c)}
              />
              <Label htmlFor={`mand-${qId}`}>Mandatory</Label>
            </div>
          </div>
          <Input
            value={question.kpiAssociation || ''}
            onChange={e => onUpdateKpiAssociation(qId, e.target.value || null)}
            placeholder={`KPI Association (e.g. ${formatKpiName('BRAND_AWARENESS')})`}
          />
          <div>
            <Label className="text-sm font-medium">Options:</Label>
            <div className="space-y-2 mt-1">
              {question.options
                .sort((a, b) => a.order - b.order)
                .map((opt, optIdx) => {
                  const optId = opt.id || opt.tempId!;
                  return (
                    <Card key={optId} className="p-2 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Option {optIdx + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => onDeleteOption(qId, optId)}
                        >
                          <Icon iconId="faXmarkLight" className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={opt.text}
                        onChange={e => onUpdateOptionText(qId, optId, e.target.value)}
                        placeholder="Option text"
                      />
                      <Input
                        value={opt.imageUrl || ''}
                        onChange={e => onUpdateOptionImageUrl(qId, optId, e.target.value || null)}
                        placeholder="Image URL (optional)"
                      />
                      <Input
                        type="number"
                        value={opt.order}
                        onChange={e =>
                          onUpdateOptionOrder(qId, optId, parseInt(e.target.value, 10) || 0)
                        }
                        placeholder="Order"
                        className="w-16 text-xs"
                      />
                    </Card>
                  );
                })}
            </div>
            <Button variant="outline" size="sm" onClick={() => onAddOption(qId)} className="mt-2">
              <Icon iconId="faPlusLight" className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);
SortableQuestionItem.displayName = 'SortableQuestionItem';

const SurveyQuestionBuilder: React.FC<SurveyQuestionBuilderProps> = ({ studyId }) => {
  const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studyDetails, setStudyDetails] = useState<Partial<BrandLiftStudyData> | null>(null);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error' | null>>(
    {}
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setStudyDetails(null);
    try {
      const [studyRes, questionsRes] = await Promise.all([
        fetch(`/api/brand-lift/surveys/${studyId}`),
        fetch(`/api/brand-lift/surveys/${studyId}/questions`),
      ]);
      if (!studyRes.ok)
        throw new Error(
          (await studyRes.json().then(e => e.error)) || 'Failed to fetch study details'
        );
      setStudyDetails(await studyRes.json());
      if (!questionsRes.ok)
        throw new Error(
          (await questionsRes.json().then(e => e.error)) || 'Failed to fetch questions'
        );
      setQuestions(
        ((await questionsRes.json()) as SurveyQuestionData[]).sort((a, b) => a.order - b.order)
      );
    } catch (err: any) {
      logger.error('Error fetching data for builder:', { studyId, error: err.message });
      setError(err.message);
    }
    setIsLoading(false);
  }, [studyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveQuestion = useCallback(
    async (question: SurveyQuestionData) => {
      const qId = question.id || question.tempId!;
      setSaveStatus(prev => ({ ...prev, [qId]: 'saving' }));
      try {
        let response;
        const payload = {
          ...question,
          options: question.options.map(o => ({
            ...o,
            tempId: undefined,
            id: o.id.startsWith('temp_') ? undefined : o.id,
          })),
        };
        if (question.id) {
          response = await fetch(`/api/brand-lift/questions/${question.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch(`/api/brand-lift/surveys/${studyId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        if (!response.ok)
          throw new Error((await response.json().then(e => e.error)) || 'Failed to save question');
        const savedQuestion = await response.json();
        setQuestions(prev =>
          prev
            .map(q =>
              q.id === qId || q.tempId === qId
                ? {
                    ...savedQuestion,
                    options: savedQuestion.options.sort(
                      (a: SurveyOptionData, b: SurveyOptionData) => a.order - b.order
                    ),
                  }
                : q
            )
            .sort((a, b) => a.order - b.order)
        );
        setSaveStatus(prev => ({ ...prev, [qId]: 'saved' }));
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [qId]: null })), 2000);
      } catch (err: any) {
        logger.error('Save Question Error:', { qId, error: err.message });
        setSaveStatus(prev => ({ ...prev, [qId]: 'error' }));
        setError(`Failed to save question ${question.text.substring(0, 20)}...`);
      }
    },
    [studyId]
  );

  const updateQuestionProperty = (
    questionIdOrTempId: string,
    data: Partial<SurveyQuestionData>
  ) => {
    const questionToSave = questions.find(
      q => q.id === questionIdOrTempId || q.tempId === questionIdOrTempId
    );
    if (questionToSave) saveQuestion({ ...questionToSave, ...data });
  };
  const handleUpdateQuestionText = (id: string, text: string) =>
    updateQuestionProperty(id, { text });
  const handleUpdateQuestionType = (id: string, type: SurveyQuestionType) =>
    updateQuestionProperty(id, { questionType: type });
  const handleUpdateQuestionOrder = (id: string, order: number) => {
    setQuestions(prev =>
      prev
        .map(q => (q.id === id || q.tempId === id ? { ...q, order } : q))
        .sort((a, b) => a.order - b.order)
    );
    const qToSave = questions.find(q => q.id === id || q.tempId === id);
    if (qToSave) saveQuestion({ ...qToSave, order });
  };
  const handleToggleRandomized = (id: string, checked: boolean) =>
    updateQuestionProperty(id, { isRandomized: checked });
  const handleToggleMandatory = (id: string, checked: boolean) =>
    updateQuestionProperty(id, { isMandatory: checked });
  const handleUpdateKpiAssociation = (id: string, kpi: string | null) =>
    updateQuestionProperty(id, { kpiAssociation: kpi });

  const handleAddQuestion = () => {
    const newOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order)) + 1 : 0;
    const newQuestion: SurveyQuestionData = {
      tempId: generateTempId(),
      id: '',
      studyId: studyId,
      text: 'New Question',
      questionType: SurveyQuestionType.SINGLE_CHOICE,
      order: newOrder,
      isRandomized: false,
      isMandatory: true,
      kpiAssociation: null,
      options: [{ tempId: generateTempId(), id: '', text: 'Option 1', order: 0, imageUrl: null }],
    };
    setQuestions(prev => [...prev, newQuestion]);
    saveQuestion(newQuestion);
  };

  const handleDeleteQuestionWrapper = async (questionIdOrTempId: string) => {
    const isTemp = questionIdOrTempId.startsWith('temp_');
    setQuestions(prev =>
      prev.filter(q => q.id !== questionIdOrTempId && q.tempId !== questionIdOrTempId)
    );
    if (!isTemp) {
      try {
        const response = await fetch(`/api/brand-lift/questions/${questionIdOrTempId}`, {
          method: 'DELETE',
        });
        if (!response.ok)
          throw new Error(
            (await response.json().then(e => e.error)) || 'Failed to delete question from server'
          );
        logger.info('Deleted question from server', { questionIdOrTempId });
      } catch (err: any) {
        logger.error('Failed to delete question from server', {
          questionIdOrTempId,
          error: err.message,
        });
      }
    }
  };

  const handleAddOptionWrapper = (questionIdOrTempId: string) => {
    let questionToUpdate: SurveyQuestionData | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
          const newOrder = q.options.length > 0 ? Math.max(...q.options.map(o => o.order)) + 1 : 0;
          const newOption: SurveyOptionData = {
            tempId: generateTempId(),
            id: '',
            text: 'New Option',
            order: newOrder,
            imageUrl: null,
          };
          questionToUpdate = { ...q, options: [...q.options, newOption] };
          return questionToUpdate;
        }
        return q;
      })
    );
    if (questionToUpdate) saveQuestion(questionToUpdate);
  };

  const updateOptionProperty = (
    questionIdOrTempId: string,
    optionIdOrTempId: string,
    data: Partial<SurveyOptionData>
  ) => {
    let questionToUpdate: SurveyQuestionData | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
          questionToUpdate = {
            ...q,
            options: q.options.map(opt =>
              opt.id === optionIdOrTempId || opt.tempId === optionIdOrTempId
                ? { ...opt, ...data }
                : opt
            ),
          };
          return questionToUpdate;
        }
        return q;
      })
    );
    if (questionToUpdate) saveQuestion(questionToUpdate);
  };
  const handleUpdateOptionText = (qId: string, oId: string, text: string) =>
    updateOptionProperty(qId, oId, { text });
  const handleUpdateOptionImageUrl = (qId: string, oId: string, imageUrl: string | null) =>
    updateOptionProperty(qId, oId, { imageUrl });
  const handleUpdateOptionOrder = (qId: string, oId: string, order: number) =>
    updateOptionProperty(qId, oId, { order });

  const handleDeleteOptionWrapper = (questionIdOrTempId: string, optionIdOrTempId: string) => {
    let questionToUpdate: SurveyQuestionData | undefined;
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
          questionToUpdate = {
            ...q,
            options: q.options.filter(
              opt => opt.id !== optionIdOrTempId && opt.tempId !== optionIdOrTempId
            ),
          };
          return questionToUpdate;
        }
        return q;
      })
    );
    if (questionToUpdate) saveQuestion(questionToUpdate);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over?.id) {
      const oldIndex = questions.findIndex(item => (item.id || item.tempId) === active.id);
      const newIndex = questions.findIndex(item => (item.id || item.tempId) === over.id);
      const reordered = arrayMove(questions, oldIndex, newIndex);
      const finalItems = reordered.map((item, index) => ({ ...item, order: index }));
      setQuestions(finalItems);

      const orderPayload = finalItems
        .filter(q => q.id && q.id !== '')
        .map(q => ({ id: q.id!, order: q.order }));
      if (orderPayload.length > 0) {
        setSaveStatus(prev => ({ ...prev, globalReorder: 'saving' }));
        try {
          const res = await fetch(`/api/brand-lift/surveys/${studyId}/questions/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
          });
          if (!res.ok)
            throw new Error(
              (await res.json().then(e => e.error)) || 'Failed to reorder questions on server'
            );
          setSaveStatus(prev => ({ ...prev, globalReorder: 'saved' }));
          setTimeout(() => setSaveStatus(prev => ({ ...prev, globalReorder: null })), 2000);
          await fetchData();
        } catch (err: any) {
          logger.error('Failed to reorder questions on server', { studyId, error: err.message });
          setSaveStatus(prev => ({ ...prev, globalReorder: 'error' }));
          setError('Failed to save new question order. Please refresh.');
        }
      }
    }
  };

  const handleSuggestQuestions = async () => {
    let yamlSuggestionsForErrorLog: string | null = null; // For logging in catch block
    setIsAISuggesting(true);
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyId}/suggest-questions`, {
        method: 'POST',
      });
      if (!response.ok)
        throw new Error(
          (await response.json().then(e => e.error)) || 'Failed to get AI suggestions'
        );
      const yamlText = await response.text();
      yamlSuggestionsForErrorLog = yamlText; // Store for potential error logging
      const parsed = yaml.load(yamlText) as any[];
      const validation = aiSuggestedQuestionsSchema.safeParse(parsed);

      if (!validation.success) {
        logger.error('AI suggestions failed Zod validation', {
          errors: validation.error.flatten(),
          raw: yamlText,
        });
        throw new Error('Received invalid suggestions structure from AI.');
      }
      const newAiQuestions: SurveyQuestionData[] = validation.data.map(
        (aiQ: ValidatedAiQuestion, idx: number) => ({
          tempId: generateTempId(),
          id: '',
          studyId: studyId,
          text: aiQ.text,
          questionType: aiQ.type, // type is already SurveyQuestionType from Zod schema
          order: questions.length + idx,
          isRandomized: aiQ.is_randomized,
          isMandatory: aiQ.is_mandatory,
          kpiAssociation: aiQ.kpi_association,
          options: aiQ.options.map((aiOpt: ValidatedAiOption, optIdx: number) => ({
            tempId: generateTempId(),
            id: '',
            text: aiOpt.text,
            imageUrl: null,
            order: optIdx,
          })),
        })
      );
      for (const q of newAiQuestions) {
        await saveQuestion(q);
      }
      await fetchData();
      logger.info('AI suggestions parsed and added.', { count: newAiQuestions.length });
    } catch (err: any) {
      logger.error('AI Suggestion processing error:', {
        studyId,
        error: err.message,
        rawResponse: yamlSuggestionsForErrorLog,
      });
      setError(err.message || 'Failed to process AI suggestions.');
    }
    setIsAISuggesting(false);
  };

  if (isLoading && questions.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (error && questions.length === 0) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <Card className="md:col-span-1 sticky top-6">
        <CardHeader>
          <CardTitle>Campaign Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">
            Study: {studyDetails?.name || <Skeleton className="h-4 w-3/4" />}
          </p>
          <p className="text-sm">
            Campaign: {studyDetails?.campaign?.campaignName || <Skeleton className="h-4 w-2/3" />}
          </p>
          <p className="text-sm">
            Primary KPI:{' '}
            {studyDetails?.primaryKpi ? (
              formatKpiName(studyDetails.primaryKpi)
            ) : (
              <Skeleton className="h-4 w-1/2" />
            )}
          </p>
          <div className="mt-4 p-2 bg-slate-50 border rounded text-xs text-muted-foreground min-h-[50px]">
            {studyDetails?.campaign?.primaryCreativeUrl ? (
              <img
                src={studyDetails.campaign.primaryCreativeUrl}
                alt="Campaign Creative"
                className="rounded-md max-h-40 w-auto"
              />
            ) : (
              'Primary campaign creative visual will be displayed here.'
            )}
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-xl font-semibold">Survey Questions</h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleSuggestQuestions}
              disabled={isAISuggesting || isLoading}
            >
              {isAISuggesting ? (
                <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Icon iconId="faLightbulbLight" className="mr-2 h-4 w-4" />
              )}
              Suggest (AI)
            </Button>
            <Button onClick={handleAddQuestion} disabled={isLoading}>
              <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add New Question
            </Button>
          </div>
        </div>
        {error && !isLoading && (
          <Alert variant="destructive" className="mt-2">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />{' '}
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={questions.map(q => q.id || q.tempId!)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, index) => (
              <SortableQuestionItem
                key={question.id || question.tempId}
                question={question}
                index={index}
                onUpdateQuestionText={handleUpdateQuestionText}
                onUpdateQuestionType={handleUpdateQuestionType}
                onUpdateQuestionOrder={handleUpdateQuestionOrder}
                onToggleRandomized={handleToggleRandomized}
                onToggleMandatory={handleToggleMandatory}
                onUpdateKpiAssociation={handleUpdateKpiAssociation}
                onDeleteQuestion={handleDeleteQuestionWrapper}
                onAddOption={handleAddOptionWrapper}
                onUpdateOptionText={handleUpdateOptionText}
                onUpdateOptionImageUrl={handleUpdateOptionImageUrl}
                onUpdateOptionOrder={handleUpdateOptionOrder}
                onDeleteOption={handleDeleteOptionWrapper}
              />
            ))}
          </SortableContext>
        </DndContext>

        {questions.length === 0 && !isLoading && !error && (
          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center">
              <Icon
                iconId="faCircleQuestionLight"
                className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50"
              />
              <p className="text-muted-foreground">No questions yet.</p>
              <p className="text-xs text-muted-foreground">
                Add your first question manually or use AI suggestions to get started.
              </p>
            </CardContent>
          </Card>
        )}
        {saveStatus.globalReorder && (
          <div
            className={`fixed bottom-4 right-4 p-3 rounded-md shadow-lg text-white text-sm ${saveStatus.globalReorder === 'saving' ? 'bg-blue-500' : saveStatus.globalReorder === 'saved' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {saveStatus.globalReorder === 'saving' && (
              <Icon iconId="faSpinnerLight" className="animate-spin mr-2" />
            )}
            {saveStatus.globalReorder === 'saved'
              ? 'Order saved!'
              : saveStatus.globalReorder === 'error'
                ? 'Order save failed!'
                : 'Reordering...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyQuestionBuilder;
