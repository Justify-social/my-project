'use client';

import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  // Modifiers, // Not used, can be removed if restrictTo... modifiers are not used
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import yaml from 'js-yaml';
import { z } from 'zod';
import {
  SurveyQuestionType,
  BrandLiftStudyStatus as _BrandLiftStudyStatus,
  SurveyOptionData as TypeSurveyOptionData, // Alias to avoid conflict if SortableOptionItem also uses SurveyOptionData
} from '@/types/brand-lift'; // Import from local types
import { useAuth } from '@clerk/nextjs'; // Import useAuth
import {
  ForbiddenError as _ForbiddenError,
  NotFoundError as _NotFoundError,
  UnauthenticatedError as _UnauthenticatedError,
  BadRequestError as _BadRequestError,
} from '@/lib/errors'; // Added import for custom errors - Prefixed

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import {
  Card,
  CardContent,
  CardDescription as _CardDescription,
  CardFooter as _CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input as _Input } from '@/components/ui/input';
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
import { SurveyQuestionData } from '@/types/brand-lift';
import { cn } from '@/lib/utils';
import { GifCard } from '@/components/ui/card-gif'; // Import the new GifCard
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as _DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose as _DialogClose,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast'; // Added import for react-hot-toast
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'; // Added import for SSOT toasts
import { Progress } from '@/components/ui/progress'; // Assuming Progress component exists
import { GifSearchModal } from '@/components/ui/gif-search-modal'; // Import the new modal

// --- Giphy API Key ---
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

// --- Giphy Helper Function ---
async function fetchGifFromGiphy(searchTerm: string): Promise<string[]> {
  if (!GIPHY_API_KEY) {
    logger.warn('[Giphy] API key not configured. Skipping GIF fetch.');
    return [];
  }
  if (!searchTerm || searchTerm.trim() === '') {
    logger.info('[Giphy] Empty search term. Skipping GIF fetch.');
    return [];
  }

  const limit = 12;
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
    searchTerm
  )}&limit=${limit}&offset=0&rating=g&lang=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      logger.error('[Giphy] API Error:', { status: response.status, data: errorData });
      return [];
    }
    const data = await response.json();
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
        .map(
          (gif: {
            images?: { downsized_medium?: { url?: string }; original?: { url?: string } };
          }) => gif.images?.downsized_medium?.url || gif.images?.original?.url
        )
        .filter((url: string | undefined): url is string => typeof url === 'string');
    }
    logger.info('[Giphy] No GIFs found for term:', { searchTerm });
    return [];
  } catch (error) {
    logger.error('[Giphy] Fetch error:', { error });
    return [];
  }
}

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
  // Normalizes keys like BRAND_AWARENESS or brand_awareness to brandAwareness for kpiDisplayNames
  const normalizedKeyForDisplay = kpiKey
    .toLowerCase()
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return (
    kpiDisplayNames[normalizedKeyForDisplay] ||
    kpiKey
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  );
};

const kpiTooltips: Record<string, string> = {
  AD_RECALL: 'The percentage of people who remember seeing your advertisement.',
  BRAND_AWARENESS: 'The increase in recognition of your brand.',
  CONSIDERATION: 'The percentage of people considering purchasing from your brand.',
  MESSAGE_ASSOCIATION: 'How well people link your key messages to your brand.',
  BRAND_PREFERENCE: "Preference for your brand over competitors'.",
  PURCHASE_INTENT: 'Likelihood of purchasing your product or service.',
  ACTION_INTENT:
    'Likelihood of taking a specific action related to your brand (e.g., visiting your website).',
  RECOMMENDATION_INTENT: 'Likelihood of recommending your brand to others.',
  ADVOCACY: 'Willingness to actively promote your brand.',
};

// --- KPI Formatting Utilities --- END ---

// NEW: Explicit mapping for KPI association strings to icon IDs
const kpiAssociationToIconIdMap: Record<string, string> = {
  AD_RECALL: 'kpisAdRecall',
  BRAND_AWARENESS: 'kpisBrandAwareness',
  CONSIDERATION: 'kpisConsideration',
  MESSAGE_ASSOCIATION: 'kpisMessageAssociation',
  BRAND_PREFERENCE: 'kpisBrandPreference',
  PURCHASE_INTENT: 'kpisPurchaseIntent',
  ACTION_INTENT: 'kpisActionIntent',
  RECOMMENDATION_INTENT: 'kpisRecommendationIntent',
  ADVOCACY: 'kpisAdvocacy',
};

// --- Zod Schemas for AI Response Validation ---
const aiOptionSchema = z.object({
  text: z.string(),
  image_description: z.string().optional().nullable(),
});

const aiQuestionSchema = z.object({
  number: z.number().optional(),
  text: z.string(),
  type: z.nativeEnum(SurveyQuestionType), // Should now use the imported enum correctly
  objective: z.string().optional().nullable(),
  kpi_association: z.string().optional().nullable(),
  is_randomized: z.boolean().optional().default(false),
  is_mandatory: z.boolean().optional().default(true),
  options: z.array(aiOptionSchema).min(1),
});
const aiSuggestedQuestionsSchema: z.ZodArray<typeof aiQuestionSchema> = z.array(aiQuestionSchema);

type ValidatedAiQuestion = z.infer<typeof aiQuestionSchema>;
type _ValidatedAiOption = z.infer<typeof aiOptionSchema>;

// Define the ref interface here
export interface SurveyQuestionBuilderRef {
  handleAddQuestion: () => void;
  handleSuggestQuestions: () => void;
}

interface SurveyQuestionBuilderProps {
  studyId: string;
  onIsAISuggestingChange?: (isSuggesting: boolean) => void;
}

const generateTempId = () => `temp_${Math.random().toString(36).substring(2, 9)}`;

// SortableQuestionItem Props - Add actionsDisabled and actionsDisabledTitle
interface SortableQuestionItemProps {
  question: SurveyQuestionData;
  index: number;
  onUpdateQuestionText: (questionIdOrTempId: string, text: string) => void;
  onUpdateQuestionType: (questionIdOrTempId: string, type: SurveyQuestionType) => void;
  onToggleRandomized: (questionIdOrTempId: string, checked: boolean) => void;
  onToggleMandatory: (questionIdOrTempId: string, checked: boolean) => void;
  onUpdateKpiAssociation: (questionIdOrTempId: string, kpi: string | null) => void;
  onDeleteQuestion: (questionIdOrTempId: string) => void;
  onAddOption: (questionIdOrTempId: string) => void;
  actionsDisabled: boolean;
  actionsDisabledTitle?: string;
  selectedGifOptions: Record<string, string | null>;
  onSelectOption: (questionId: string, optionIdOrTempId: string) => void;
  onInitiateGifSearch: (questionId: string, optionId: string, currentText?: string) => void;
  editingOptionGL: { questionId: string; optionId: string; currentText: string } | null;
  setEditingOptionGL: (
    editing: { questionId: string; optionId: string; currentText: string } | null
  ) => void;
  editingQuestionDetail: { questionId: string; currentText: string } | null;
  setEditingQuestionDetail: (editing: { questionId: string; currentText: string } | null) => void;
  onUpdateOptionText: (questionIdOrTempId: string, optionIdOrTempId: string, text: string) => void;
  onDeleteOptionForQuestion: (questionIdOrTempId: string, optionIdOrTempId: string) => void;
  onDragEndOptions: (event: DragEndEvent, questionIdOrTempId: string) => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = React.memo(
  ({
    question,
    index,
    onUpdateQuestionText,
    onUpdateQuestionType,
    onToggleRandomized,
    onToggleMandatory,
    onUpdateKpiAssociation,
    onDeleteQuestion,
    onAddOption,
    actionsDisabled,
    actionsDisabledTitle,
    selectedGifOptions,
    onSelectOption,
    onInitiateGifSearch,
    editingOptionGL,
    setEditingOptionGL,
    editingQuestionDetail,
    setEditingQuestionDetail,
    onUpdateOptionText,
    onDeleteOptionForQuestion,
    onDragEndOptions,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: question.id || question.tempId!,
    });
    const [isExpanded, setIsExpanded] = React.useState(true);
    const qId = question.id || question.tempId!;

    const optionSensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 10 : 'auto',
    };
    const currentKpiTooltip =
      question.kpiAssociation &&
      kpiTooltips[question.kpiAssociation.toUpperCase().replace(/\s+/g, '_')]
        ? kpiTooltips[question.kpiAssociation.toUpperCase().replace(/\s+/g, '_')]
        : formatKpiName(question.kpiAssociation);

    // NEW: Determine KPI icon using the explicit map
    const normalizedKpiKeyForIcon = question.kpiAssociation?.toUpperCase().replace(/\s+/g, '_');
    const kpiIconToRender =
      normalizedKpiKeyForIcon && kpiAssociationToIconIdMap[normalizedKpiKeyForIcon]
        ? kpiAssociationToIconIdMap[normalizedKpiKeyForIcon]
        : 'faTagLight'; // Fallback icon

    return (
      <Card ref={setNodeRef} style={style} className="mb-4 bg-white shadow-sm relative">
        <CardHeader
          className="flex flex-row items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2 flex-grow min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="opacity-50 hover:opacity-100 touch-none cursor-grab flex items-center justify-center"
              title={
                question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                  ? 'Drag to reorder (Multiple Choice)'
                  : 'Drag to reorder (Single Choice)'
              }
              onClick={e => e.stopPropagation()}
            >
              <Icon
                iconId={
                  question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                    ? 'faListCheckLight'
                    : 'faListRadioLight'
                }
                className="h-4 w-4 text-muted-foreground"
                aria-label={
                  question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                    ? 'Multiple Choice Question'
                    : 'Single Choice Question'
                }
              />
            </div>
            <CardTitle
              className="text-md truncate flex-grow ml-2"
              title={question.text || `Question ${index + 1}`}
            >
              Question {index + 1}: {question.text.substring(0, 50)}
              {question.text.length > 50 ? '...' : ''}
            </CardTitle>
            {question.kpiAssociation && (
              <div className="ml-2 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-default bg-accent text-white hover:bg-accent focus:bg-accent border-accent"
                      >
                        <Icon iconId={kpiIconToRender} className="h-3 w-3 mr-1.5" />
                        {formatKpiName(question.kpiAssociation)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{currentKpiTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <Icon
              iconId={isExpanded ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="h-4 w-4 text-muted-foreground ml-auto flex-shrink-0"
            />
          </div>
          <div className="flex items-center flex-shrink-0 pl-2">
            {' '}
            <IconButtonAction
              iconBaseName="faTrashCan"
              hoverColorClass="text-destructive"
              ariaLabel="Delete question"
              onClick={e => {
                e.stopPropagation();
                actionsDisabled ? undefined : onDeleteQuestion(qId);
              }}
              className={cn(actionsDisabled && 'opacity-50 cursor-not-allowed')}
            />
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="p-4 space-y-3 border-t">
            {editingQuestionDetail && editingQuestionDetail.questionId === qId ? (
              <div className="space-y-4 border border-accent/20 rounded-lg p-4 bg-accent/5">
                <div className="flex items-center gap-2 text-accent font-medium text-sm">
                  <Icon iconId="faPenToSquareLight" className="h-4 w-4" />
                  <span>Write your question</span>
                </div>
                <Textarea
                  value={editingQuestionDetail.currentText}
                  onChange={e =>
                    setEditingQuestionDetail({ questionId: qId, currentText: e.target.value })
                  }
                  placeholder="What would you like to ask respondents?"
                  disabled={actionsDisabled}
                  title={actionsDisabled ? actionsDisabledTitle : undefined}
                  autoFocus
                  rows={3}
                  className="bg-white border-accent/20 focus:border-accent focus:ring-accent/20"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editingQuestionDetail.currentText.trim() !== '') {
                        onUpdateQuestionText(qId, editingQuestionDetail.currentText);
                        setEditingQuestionDetail(null);
                      }
                    }
                    if (e.key === 'Escape') {
                      setEditingQuestionDetail(null);
                    }
                  }}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingQuestionDetail(null);
                    }}
                    disabled={actionsDisabled}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editingQuestionDetail.currentText.trim() !== '') {
                        onUpdateQuestionText(qId, editingQuestionDetail.currentText);
                        setEditingQuestionDetail(null);
                      }
                    }}
                    disabled={actionsDisabled || editingQuestionDetail.currentText.trim() === ''}
                  >
                    Save Question
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'p-4 rounded-lg border min-h-[60px] cursor-text break-words whitespace-pre-wrap transition-all duration-200',
                  question.text
                    ? 'border-input/20 hover:border-input/40 bg-white'
                    : 'border-accent/30 border-dashed hover:border-accent/60 bg-accent/5'
                )}
                onClick={() => {
                  if (!actionsDisabled) {
                    setEditingOptionGL(null);
                    setEditingQuestionDetail({
                      questionId: qId,
                      currentText: question.text,
                    });
                  }
                }}
                title={actionsDisabled ? actionsDisabledTitle : 'Click to edit question text'}
              >
                {question.text ? (
                  <div className="flex items-start gap-2">
                    <Icon
                      iconId="faPenToSquareLight"
                      className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                    />
                    <span>{question.text}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <Icon iconId="faPenToSquareLight" className="h-4 w-4" />
                    <span className="italic">Click here to write your question...</span>
                  </div>
                )}
              </div>
            )}

            {/* Question Configuration Panel */}
            <div className="p-4 border rounded-lg bg-slate-50/50 space-y-4">
              {/* Question Type Selection */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Icon iconId="faListLight" className="h-4 w-4" />
                  Answer Type
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-all duration-200 relative',
                      question.questionType === SurveyQuestionType.SINGLE_CHOICE
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/20'
                        : 'border-input/40 bg-white hover:border-input/60'
                    )}
                    onClick={() =>
                      !actionsDisabled &&
                      onUpdateQuestionType(qId, SurveyQuestionType.SINGLE_CHOICE)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          iconId="faListRadioLight"
                          className={cn(
                            'h-4 w-4',
                            question.questionType === SurveyQuestionType.SINGLE_CHOICE
                              ? 'text-accent'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span className="text-sm font-medium">Single Choice</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Icon
                              iconId="faCircleInfoLight"
                              className="h-3 w-3 text-muted-foreground hover:text-accent transition-colors cursor-help"
                              onClick={e => e.stopPropagation()}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="text-xs space-y-1">
                              <p className="font-medium">Single Choice Questions</p>
                              <p>
                                Respondents can only select one option from the list. Perfect for
                                questions like "What is your age group?" or "Which brand do you
                                prefer?" where only one answer makes sense.
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-xs text-muted-foreground">Respondents pick one option</p>
                  </div>

                  <div
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-all duration-200 relative',
                      question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/20'
                        : 'border-input/40 bg-white hover:border-input/60'
                    )}
                    onClick={() =>
                      !actionsDisabled &&
                      onUpdateQuestionType(qId, SurveyQuestionType.MULTIPLE_CHOICE)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          iconId="faListCheckLight"
                          className={cn(
                            'h-4 w-4',
                            question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                              ? 'text-accent'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span className="text-sm font-medium">Multiple Choice</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Icon
                              iconId="faCircleInfoLight"
                              className="h-3 w-3 text-muted-foreground hover:text-accent transition-colors cursor-help"
                              onClick={e => e.stopPropagation()}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="text-xs space-y-1">
                              <p className="font-medium">Multiple Choice Questions</p>
                              <p>
                                Respondents can select multiple options from the list. Ideal for
                                questions like "Which features interest you?" or "Select all brands
                                you've heard of" where multiple answers are valid.
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Respondents pick multiple options
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Icon iconId="faRotateLight" className="h-4 w-4" />
                    Answer Order
                  </h4>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                    <Switch
                      id={`rand-${qId}`}
                      checked={question.isRandomized ?? false}
                      onCheckedChange={c => onToggleRandomized(qId, c)}
                      disabled={actionsDisabled}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`rand-${qId}`} className="text-sm font-medium">
                          Randomise Options
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3 w-3 text-muted-foreground hover:text-accent transition-colors cursor-help"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="text-xs space-y-1">
                                <p className="font-medium">Randomise Answer Options</p>
                                <p>
                                  When enabled, each respondent will see the answer choices in a
                                  different random order. This eliminates position bias where people
                                  tend to select the first or last option simply because of its
                                  placement.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Shuffle answer order for each respondent
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Icon iconId="faUserLight" className="h-4 w-4" />
                    Response Format
                  </h4>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                    <Switch
                      id={`force-${qId}`}
                      checked={!(question.isMandatory ?? true)}
                      onCheckedChange={c => onToggleMandatory(qId, !c)}
                      disabled={actionsDisabled}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`force-${qId}`} className="text-sm font-medium">
                          Non-forced Response
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3 w-3 text-muted-foreground hover:text-accent transition-colors cursor-help"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="text-xs space-y-1">
                                <p className="font-medium">Non-forced vs Forced Response</p>
                                <p>
                                  When enabled, escape options like "None of the above", "Other", or
                                  "Prefer not to say" are automatically added to give respondents
                                  alternatives if none of the main options apply. These options
                                  remain in fixed positions to avoid bias.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add escape options like "None" or "Other"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Label htmlFor={`kpi-assoc-${qId}`} className="text-sm font-medium mr-2">
                Associated KPI:
              </Label>
              <Select
                value={question.kpiAssociation || '_NO_KPI_'}
                onValueChange={value =>
                  onUpdateKpiAssociation(qId, value === '_NO_KPI_' ? null : value)
                }
                disabled={actionsDisabled}
              >
                <SelectTrigger
                  id={`kpi-assoc-${qId}`}
                  className="w-auto min-w-[200px] h-9 text-xs px-2 py-1"
                  title={
                    actionsDisabled ? actionsDisabledTitle : 'Associate a Key Performance Indicator'
                  }
                >
                  <SelectValue placeholder="Select KPI..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_NO_KPI_" className="text-xs italic">
                    No KPI associated
                  </SelectItem>
                  {Object.entries(kpiAssociationToIconIdMap).map(([kpiKey, iconId]) => (
                    <SelectItem key={kpiKey} value={kpiKey} className="text-xs">
                      <div className="flex items-center">
                        <Icon iconId={iconId} className="h-3 w-3 mr-2 text-muted-foreground" />
                        {formatKpiName(kpiKey)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Options:</Label>
              <DndContext
                sensors={optionSensors}
                collisionDetection={closestCenter}
                onDragEnd={event => onDragEndOptions(event, qId)}
              >
                <SortableContext
                  items={question.options.map(opt => opt.id || opt.tempId!)}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-row overflow-x-auto space-x-2 mt-1 pb-2 items-stretch">
                    {question.options.map(opt => (
                      <SortableOptionItem
                        key={opt.id || opt.tempId!}
                        option={opt}
                        questionId={qId}
                        actionsDisabled={actionsDisabled}
                        actionsDisabledTitle={actionsDisabledTitle}
                        isEditingThisText={
                          editingOptionGL?.questionId === qId &&
                          editingOptionGL?.optionId === (opt.id || opt.tempId!)
                        }
                        currentEditText={
                          editingOptionGL?.questionId === qId &&
                          editingOptionGL?.optionId === (opt.id || opt.tempId!)
                            ? editingOptionGL.currentText
                            : opt.text
                        }
                        setEditingThisText={() => {
                          if (!actionsDisabled) {
                            setEditingQuestionDetail(null);
                            setEditingOptionGL({
                              questionId: qId,
                              optionId: opt.id || opt.tempId!,
                              currentText: opt.text,
                            });
                          }
                        }}
                        updateCurrentEditText={newText => {
                          if (
                            editingOptionGL &&
                            editingOptionGL.questionId === qId &&
                            editingOptionGL.optionId === (opt.id || opt.tempId!)
                          ) {
                            setEditingOptionGL({ ...editingOptionGL, currentText: newText });
                          }
                        }}
                        saveEditingThisText={() => {
                          if (editingOptionGL) {
                            onUpdateOptionText(
                              qId,
                              editingOptionGL.optionId,
                              editingOptionGL.currentText
                            );
                            setEditingOptionGL(null);
                          }
                        }}
                        cancelEditingThisText={() => setEditingOptionGL(null)}
                        optionSaveDisabled={
                          actionsDisabled ||
                          (editingOptionGL?.questionId === qId &&
                            editingOptionGL?.optionId === (opt.id || opt.tempId!) &&
                            editingOptionGL?.currentText?.trim() === '' &&
                            !opt.imageUrl)
                        }
                        selectedOptionId={
                          selectedGifOptions[qId] === (opt.id || opt.tempId!)
                            ? opt.id || opt.tempId!
                            : undefined
                        }
                        onSelectOption={onSelectOption}
                        onInitiateGifSearch={onInitiateGifSearch}
                        onDeleteThisOption={() =>
                          onDeleteOptionForQuestion(qId, opt.id || opt.tempId!)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddOption(qId)}
                className="mt-2"
                disabled={actionsDisabled}
                title={actionsDisabled ? actionsDisabledTitle : 'Add Option'}
              >
                <Icon iconId="faPlusLight" className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
);
SortableQuestionItem.displayName = 'SortableQuestionItem';

// Define SortableOptionItem component here (or import if it becomes too large)
interface SortableOptionItemProps {
  option: TypeSurveyOptionData;
  questionId: string;
  actionsDisabled: boolean;
  actionsDisabledTitle?: string;
  isEditingThisText: boolean;
  currentEditText: string;
  setEditingThisText: () => void;
  updateCurrentEditText: (newText: string) => void;
  saveEditingThisText: () => void;
  cancelEditingThisText: () => void;
  optionSaveDisabled: boolean;
  selectedOptionId?: string;
  onSelectOption: (questionId: string, optionIdOrTempId: string) => void;
  onInitiateGifSearch: (questionId: string, optionId: string, currentText?: string) => void;
  onDeleteThisOption: () => void;
}

const SortableOptionItem: React.FC<SortableOptionItemProps> = ({
  option,
  questionId,
  actionsDisabled,
  actionsDisabledTitle,
  isEditingThisText,
  currentEditText,
  setEditingThisText,
  updateCurrentEditText,
  saveEditingThisText,
  cancelEditingThisText,
  optionSaveDisabled,
  selectedOptionId,
  onSelectOption,
  onInitiateGifSearch,
  onDeleteThisOption,
}) => {
  const optId = option.id || option.tempId!;
  const {
    attributes,
    listeners,
    setNodeRef: setSortableOptionNodeRef,
    transform: optionTransform,
    transition: optionTransition,
    isDragging: isOptionDragging,
  } = useSortable({
    id: optId,
  });

  const optionStyle = {
    transform: isOptionDragging ? CSS.Transform.toString(optionTransform) : 'none',
    transition: isOptionDragging ? optionTransition : 'none',
    opacity: isOptionDragging ? 0.7 : 1,
    zIndex: isOptionDragging ? 20 : 'auto',
  };

  return (
    <div
      ref={setSortableOptionNodeRef}
      style={optionStyle}
      {...attributes}
      className="flex flex-col space-y-1 p-1 self-stretch flex-shrink-0 w-48"
    >
      <div {...listeners} className="cursor-grab">
        <GifCard
          gifUrl={option.imageUrl}
          altText={option.text}
          optionText={option.text}
          isSelected={optId === selectedOptionId}
          onClick={(e?: React.MouseEvent) => {
            e?.stopPropagation();
            onSelectOption(questionId, optId);
            if (actionsDisabled || isEditingThisText) return;
            setEditingThisText();
          }}
          onSearchClick={(e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (!actionsDisabled) onInitiateGifSearch(questionId, optId, option.text);
          }}
          className="flex-grow min-h-[200px]"
          disabled={actionsDisabled}
          disabledTitle={actionsDisabled ? actionsDisabledTitle : undefined}
          isEditingText={isEditingThisText}
          editingTextValue={currentEditText}
          onEditingTextChange={updateCurrentEditText}
          onSaveText={saveEditingThisText}
          onCancelText={cancelEditingThisText}
          editTextSaveDisabled={optionSaveDisabled}
        />
      </div>

      {/* Edit Icon and Delete Icon - only if NOT editing text inline (via GifCard) */}
      {!isEditingThisText && (
        <div className="flex items-center justify-start space-x-1 pt-1 ">
          <IconButtonAction
            iconBaseName="faPenToSquare"
            ariaLabel="Edit option text"
            onClick={() => !actionsDisabled && setEditingThisText()}
            className={cn('h-7 w-7 p-1', actionsDisabled && 'opacity-50 cursor-not-allowed')}
            hoverColorClass="text-primary"
          />
          <IconButtonAction
            iconBaseName="faTrashCan"
            ariaLabel="Delete option"
            onClick={() => !actionsDisabled && onDeleteThisOption()}
            className={cn('h-7 w-7 p-1', actionsDisabled && 'opacity-50 cursor-not-allowed')}
            hoverColorClass="text-destructive"
          />
        </div>
      )}
    </div>
  );
};

SortableOptionItem.displayName = 'SortableOptionItem';

// Define progress steps configuration outside the component for stability
interface ProgressStep {
  id: number;
  text: string;
}
const PROGRESS_STEPS_CONFIG: ProgressStep[] = [
  { id: 1, text: 'Analysing campaign context...' },
  { id: 2, text: 'Drafting survey questions...' },
  { id: 3, text: 'Sourcing GIF ideas...' },
  { id: 4, text: 'Finalising suggestions...' },
];

const SurveyQuestionBuilder = forwardRef<SurveyQuestionBuilderRef, SurveyQuestionBuilderProps>(
  ({ studyId, onIsAISuggestingChange }, ref) => {
    const { orgId: activeOrgId, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAISuggesting, setIsAISuggesting] = useState(false);
    const [selectedGifOptions, setSelectedGifOptions] = useState<Record<string, string | null>>({});
    const [showAiDisclaimer, setShowAiDisclaimer] = useState(false);

    const [gifSearchModalTriggerState, setGifSearchModalTriggerState] = useState<{
      isOpen: boolean;
      questionId: string;
      optionId: string;
      currentSearchTerm?: string;
    } | null>(null);

    // New states for progress
    const [currentProgressStepIdx, setCurrentProgressStepIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(
      new Array(PROGRESS_STEPS_CONFIG.length).fill(false)
    );

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [editingOptionGL, setEditingOptionGL] = useState<{
      questionId: string;
      optionId: string;
      currentText: string;
    } | null>(null);

    // New state for editing main question text
    const [editingQuestionDetail, setEditingQuestionDetail] = useState<{
      questionId: string;
      currentText: string;
    } | null>(null);

    const saveQuestion = useCallback(
      async (question: SurveyQuestionData, options?: { showToast?: boolean }) => {
        const qId = question.id || question.tempId!;
        const shouldShowToast = options?.showToast ?? true;

        try {
          let response;
          const payload = {
            ...question,
            options: question.options.map(o => ({
              ...o,
              tempId: undefined,
              id: o.id && o.id.startsWith('temp_') ? undefined : o.id,
            })),
          };

          console.log('[SaveQuestion] Payload being sent:', JSON.parse(JSON.stringify(payload)));

          if (question.id && !question.id.startsWith('temp_')) {
            response = await fetch(`/api/brand-lift/questions/${question.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          } else {
            const { id: _id, ...createPayload } = payload;
            response = await fetch(`/api/brand-lift/surveys/${studyId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createPayload),
            });
          }

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: 'Failed to save and parse error response' }));
            throw new Error(
              errorData.error || `Failed to save question (status ${response.status})`
            );
          }

          const savedQuestionFromServer = await response.json();
          console.log(
            '[SaveQuestion] Received from server:',
            JSON.parse(JSON.stringify(savedQuestionFromServer))
          );

          setQuestions(prevQuestions =>
            prevQuestions
              .map(q => {
                if (q.id === qId || q.tempId === qId) {
                  // If this is the question that was saved...
                  const clientSideVersionOfQuestion = question; // The version we sent to the server

                  return {
                    ...savedQuestionFromServer, // Take most properties from the server's response
                    options: (savedQuestionFromServer.options || [])
                      .map((serverOpt: TypeSurveyOptionData) => {
                        // Find the corresponding option from the client-side version sent to the server
                        const clientOpt = clientSideVersionOfQuestion.options.find(
                          (co: TypeSurveyOptionData) =>
                            (co.id && co.id === serverOpt.id) ||
                            (co.tempId && co.tempId === serverOpt.tempId)
                        );
                        if (
                          clientOpt &&
                          clientOpt.imageUrl &&
                          clientOpt.imageUrl !== serverOpt.imageUrl
                        ) {
                          // If client had an imageUrl and it's different from server's echoed one,
                          // trust the client's intended imageUrl for this specific update.
                          // This is particularly for the GIF update scenario.
                          return { ...serverOpt, imageUrl: clientOpt.imageUrl };
                        }
                        return serverOpt; // Otherwise, use the server's option data
                      })
                      .sort(
                        (a: TypeSurveyOptionData, b: TypeSurveyOptionData) => a.order - b.order
                      ),
                  };
                }
                return q;
              })
              .sort((a, b) => a.order - b.order)
          );
          if (shouldShowToast) {
            showSuccessToast('Question saved successfully!');
          }
        } catch (err: unknown) {
          logger.error('Save Question Error:', {
            qId,
            error: (err as Error).message,
            questionData: question,
          });
          showErrorToast((err as Error).message || 'Failed to save question.');
        }
      },
      [studyId]
    );

    const fetchData = useCallback(async () => {
      if (!isAuthLoaded) return;
      if (!isSignedIn) {
        setError('Please sign in to manage survey questions.');
        setIsLoading(false);
        return;
      }
      if (!activeOrgId) {
        setError('An active organization is required. Please select or create one in settings.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [studyRes, questionsRes] = await Promise.all([
          fetch(`/api/brand-lift/surveys/${studyId}`),
          fetch(`/api/brand-lift/surveys/${studyId}/questions`),
        ]);
        if (!studyRes.ok)
          throw new Error(
            (await studyRes.json().then(e => e.error)) || 'Failed to fetch study details'
          );
        const _fetchedStudyDetails = await studyRes.json(); // Prefixed unused variable

        if (!questionsRes.ok)
          throw new Error(
            (await questionsRes.json().then(e => e.error)) || 'Failed to fetch questions'
          );
        const fetchedQuestions = ((await questionsRes.json()) as SurveyQuestionData[]).sort(
          (a, b) => a.order - b.order
        );
        setQuestions(fetchedQuestions);

        if (fetchedQuestions.length > 0) {
          // setHasInitializedQuestions(true);
        }
      } catch (err: unknown) {
        logger.error('Error fetching data for builder:', {
          studyId,
          error: (err as Error).message,
        });
        setError((err as Error).message);
      }
      setIsLoading(false);
    }, [studyId, isAuthLoaded, isSignedIn, activeOrgId]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const actionsDisabled = !isAuthLoaded || !isSignedIn || !activeOrgId || isLoading;
    const actionsDisabledTitle = !isAuthLoaded
      ? 'Loading authentication...'
      : !isSignedIn
        ? 'Please sign in to manage questions'
        : !activeOrgId
          ? 'Select an active organization to manage questions'
          : isLoading
            ? 'Loading data...'
            : undefined;

    const updateQuestionProperty = useCallback(
      (questionIdOrTempId: string, data: Partial<SurveyQuestionData>) => {
        const questionToSave = questions.find(
          q => q.id === questionIdOrTempId || q.tempId === questionIdOrTempId
        );
        if (questionToSave) saveQuestion({ ...questionToSave, ...data });
      },
      [questions, saveQuestion]
    );

    const handleUpdateQuestionText = (id: string, text: string) =>
      updateQuestionProperty(id, { text });
    const handleUpdateQuestionType = (id: string, type: SurveyQuestionType) =>
      updateQuestionProperty(id, { questionType: type });
    const handleToggleRandomized = (id: string, checked: boolean) =>
      updateQuestionProperty(id, { isRandomized: checked });
    const handleToggleMandatory = (id: string, checked: boolean) =>
      updateQuestionProperty(id, { isMandatory: checked });
    const handleUpdateKpiAssociation = (id: string, kpi: string | null) =>
      updateQuestionProperty(id, { kpiAssociation: kpi });

    const actualHandleAddQuestion = () => {
      if (questions.length >= 10) {
        toast.error('Maximum of 10 questions allowed.');
        return;
      }
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
        } catch (err: unknown) {
          logger.error('Failed to delete question from server', {
            questionIdOrTempId,
            error: (err as Error).message,
          });
        }
      }
    };

    const handleAddOptionWrapper = (questionIdOrTempId: string) => {
      let questionToUpdate: SurveyQuestionData | undefined;
      let newOptionTempId: string | undefined;
      const newOptionText: string = 'New Option'; // Default text

      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
            const newOrder =
              q.options.length > 0 ? Math.max(...q.options.map(o => o.order)) + 1 : 0;
            const newOptionData: TypeSurveyOptionData = {
              tempId: generateTempId(),
              id: '',
              text: newOptionText,
              order: newOrder,
              imageUrl: null,
            };
            newOptionTempId = newOptionData.tempId; // Capture the tempId
            questionToUpdate = { ...q, options: [...q.options, newOptionData] };
            return questionToUpdate;
          }
          return q;
        })
      );

      if (questionToUpdate) {
        saveQuestion(questionToUpdate); // Save the question with the new option
        if (newOptionTempId) {
          // Immediately open GIF search for the newly added option
          handleInitiateGifSearch(questionIdOrTempId, newOptionTempId, newOptionText);
        }
      }
    };

    const updateOptionProperty = useCallback(
      (
        questionIdOrTempId: string,
        optionIdOrTempId: string,
        data: Partial<TypeSurveyOptionData>
      ) => {
        console.log('[GIF_SELECT] updateOptionProperty called', {
          questionIdOrTempId,
          optionIdOrTempId,
          data,
        });
        let questionToUpdate: SurveyQuestionData | undefined;
        setQuestions(prevQuestions => {
          const newQuestions = prevQuestions.map(q => {
            if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
              const updatedOptions = q.options.map(opt =>
                opt.id === optionIdOrTempId || opt.tempId === optionIdOrTempId
                  ? { ...opt, ...data }
                  : opt
              );
              questionToUpdate = {
                ...q,
                options: updatedOptions,
              };
              return questionToUpdate;
            }
            return q;
          });
          // Ensure a new array reference is returned if no changes occurred,
          // though `map` typically does this. This is for extra certainty.
          return Object.is(newQuestions, prevQuestions) ? [...newQuestions] : newQuestions;
        });

        if (questionToUpdate) {
          // Clone questionToUpdate to ensure saveQuestion receives a distinct object
          // if there are any concerns about its modification or shared references,
          // though current logic seems to handle it by spreading in saveQuestion.
          saveQuestion({ ...questionToUpdate });
        }
      },
      [saveQuestion]
    );

    const handleUpdateOptionText = (qId: string, oId: string, text: string) =>
      updateOptionProperty(qId, oId, { text });
    const handleUpdateOptionImageUrl = (qId: string, oId: string, imageUrl: string | null) => {
      console.log('[GIF_SELECT] handleUpdateOptionImageUrl called', { qId, oId, imageUrl });
      updateOptionProperty(qId, oId, { imageUrl });
    };
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
          // setSaveStatus(prev => ({ ...prev, globalReorder: 'saving' }));
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
            showSuccessToast('Question order saved successfully!');
            await fetchData();
          } catch (err: unknown) {
            logger.error('Failed to reorder questions on server', {
              studyId,
              error: (err as Error).message,
            });
            showErrorToast('Failed to save new question order.');
          }
        }
      }
    };

    const actualHandleSuggestQuestions = async () => {
      if (!studyId) {
        logger.error('[SurveyQuestionBuilder] Study ID is missing for AI suggestions.');
        showErrorToast('Cannot suggest questions: Study ID is missing.');
        return;
      }
      if (isAISuggesting) return; // Prevent multiple simultaneous requests

      logger.info('[SurveyQuestionBuilder] Initiating AI question suggestions...', { studyId });
      setIsAISuggesting(true);
      if (onIsAISuggestingChange) onIsAISuggestingChange(true);
      setShowAiDisclaimer(true); // Show disclaimer immediately when AI process starts
      setProgress(0); // Initial progress
      let suggestedYaml: string | null = null; // Declare here for broader scope

      try {
        setProgress(25);
        const response = await fetch(`/api/brand-lift/surveys/${studyId}/suggest-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // body: JSON.stringify({ existingQuestions: questions.map(q => q.text) }) // Example if sending existing
        });
        setProgress(50);

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            errorData?.error || `AI suggestions failed: ${response.statusText || 'Unknown error'}`;
          logger.error('[SurveyQuestionBuilder] AI Suggestion API Error', {
            status: response.status,
            errorData,
          });
          showErrorToast(errorMessage);
          throw new Error(errorMessage);
        }

        suggestedYaml = await response.text(); // Assign to the higher-scoped variable
        setProgress(70);

        if (!suggestedYaml) {
          logger.warn('[SurveyQuestionBuilder] AI returned empty YAML response.');
          showErrorToast('AI returned no suggestions. Please try again.');
          return;
        }

        // --- Parse and Validate YAML ---
        let parsedQuestions;
        try {
          parsedQuestions = yaml.load(suggestedYaml);
        } catch (yamlError: unknown) {
          logger.error('[SurveyQuestionBuilder] YAML Parsing Error', {
            message: (yamlError as Error).message,
            yaml: suggestedYaml.substring(0, 500), // Log a snippet
          });
          showErrorToast('Error parsing AI suggestions. Please check format or try again.');
          return;
        }

        const validationResult = aiSuggestedQuestionsSchema.safeParse(parsedQuestions);

        if (!validationResult.success) {
          logger.error('[SurveyQuestionBuilder] AI Response Zod Validation Error', {
            errors: validationResult.error.flatten(),
            data: parsedQuestions,
          });
          showErrorToast('AI suggestions have an invalid format. Please try again.');
          return;
        }

        const validatedQuestions: ValidatedAiQuestion[] = validationResult.data;
        setProgress(85);

        if (!validatedQuestions || validatedQuestions.length === 0) {
          showSuccessToast('AI did not find any new relevant questions to suggest.');
          // Even if AI suggests nothing, we might still want to add demographic questions.
          // So, don't return here. Proceed to check for demographic questions.
        }

        const newQuestions: SurveyQuestionData[] = [];
        let questionOrder = questions.length; // Start ordering from the end of existing questions

        if (validatedQuestions) {
          // Ensure validatedQuestions is not null/undefined before iterating
          for (const aiQuestion of validatedQuestions) {
            const questionId = generateTempId(); // Use tempId for new questions
            const options: TypeSurveyOptionData[] = [];
            let optionOrder = 0;

            for (const aiOption of aiQuestion.options) {
              let imageDescriptionForGiphy = aiOption.image_description || aiOption.text; // Default to option text if no description

              // Custom image_description logic for specific questions
              const questionTextLower = aiQuestion.text.toLowerCase();
              const optionTextLower = aiOption.text.toLowerCase().trim();

              if (questionTextLower.includes('what is your gender?')) {
                if (optionTextLower === 'male') {
                  imageDescriptionForGiphy =
                    'A fun, stylized, and respectful male symbol or a diverse group of male-presenting individuals celebrating.';
                } else if (optionTextLower === 'female') {
                  imageDescriptionForGiphy =
                    'A fun, stylized, and respectful female symbol or a diverse group of female-presenting individuals celebrating.';
                } else if (optionTextLower === 'other') {
                  imageDescriptionForGiphy =
                    'An abstract, colorful, and inclusive swirl of colors representing diversity and fluidity.';
                } else if (optionTextLower === 'prefer not to say') {
                  imageDescriptionForGiphy =
                    'A friendly, thoughtful emoji or a comfortable, private space.';
                }
              } else if (questionTextLower.includes('which age group do you belong to?')) {
                if (
                  optionTextLower.includes('under 18') ||
                  optionTextLower.includes('<18') ||
                  optionTextLower.includes('17 or younger')
                ) {
                  imageDescriptionForGiphy =
                    'Playful and bright scene with youthful energy, like colorful building blocks or animation.';
                } else if (optionTextLower === '18-24') {
                  imageDescriptionForGiphy =
                    'Dynamic and trendy abstract animation with vibrant colors.';
                } else if (optionTextLower === '25-34') {
                  imageDescriptionForGiphy =
                    'Upbeat scene of diverse young adults collaborating or having fun, using technology.';
                } else if (optionTextLower === '35-44') {
                  imageDescriptionForGiphy =
                    'Balanced and creative visual, perhaps a satisfying geometric pattern in motion.';
                } else if (optionTextLower === '45-54') {
                  imageDescriptionForGiphy =
                    'Confident and engaging abstract visual with a sophisticated color palette.';
                } else if (optionTextLower === '55-64') {
                  imageDescriptionForGiphy =
                    'Active and joyful scene, perhaps people enjoying hobbies or nature.';
                } else if (
                  optionTextLower.includes('65+') ||
                  optionTextLower.includes('65 or older')
                ) {
                  imageDescriptionForGiphy =
                    'Elegant and calm animation, like a blooming flower or a serene landscape.';
                } else if (optionTextLower === 'prefer not to say') {
                  imageDescriptionForGiphy =
                    'A discreet and neutral image like a closed book or a simple pattern.';
                }
              }

              let imageUrl: string | null = null;
              if (imageDescriptionForGiphy) {
                try {
                  const gifs = await fetchGifFromGiphy(imageDescriptionForGiphy);
                  if (gifs.length > 0) {
                    imageUrl = gifs[0]; // Take the first GIF
                  }
                } catch (gifError) {
                  logger.error('[SurveyQuestionBuilder] Error fetching GIF for option', {
                    optionText: aiOption.text,
                    description: imageDescriptionForGiphy,
                    error: gifError,
                  });
                }
              }

              options.push({
                tempId: generateTempId(),
                id: '', // Will be set by backend
                text: aiOption.text,
                imageUrl: imageUrl,
                order: optionOrder++,
                questionId: questionId,
              });
            }

            const questionToAdd: SurveyQuestionData = {
              tempId: questionId, // Use the same tempId generated for linking options
              id: '',
              studyId: studyId,
              text: aiQuestion.text,
              questionType: aiQuestion.type,
              order: questionOrder++,
              isRandomized: aiQuestion.is_randomized,
              isMandatory: aiQuestion.is_mandatory,
              kpiAssociation: aiQuestion.kpi_association,
              options: options,
            };
            newQuestions.push(questionToAdd);
          }
        }

        // --- Add standard demographic questions if not already present and within limit ---
        const standardGenderQuestionText = 'What is your gender?';
        const standardAgeQuestionText = 'Which age group do you belong to?';

        const allCurrentQuestions = [...questions, ...newQuestions];

        const hasGenderQuestion = allCurrentQuestions.some(
          q => q.text.toLowerCase().trim() === standardGenderQuestionText.toLowerCase()
        );
        const hasAgeQuestion = allCurrentQuestions.some(
          q => q.text.toLowerCase().trim() === standardAgeQuestionText.toLowerCase()
        );

        // Add Gender Question if missing and space allows
        if (!hasGenderQuestion && questions.length + newQuestions.length < 10) {
          const genderQuestionTempId = generateTempId();
          const genderOptions: TypeSurveyOptionData[] = [
            {
              tempId: generateTempId(),
              id: '',
              questionId: genderQuestionTempId,
              text: 'Male',
              order: 0,
              imageUrl:
                'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnZseXA0eHlna2FiODA0ZGdrN3E0ZmYybG4xc2MyM21mZzgwYjlmcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WuGSL4LFUMQU/giphy.gif', // Will Smith
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: genderQuestionTempId,
              text: 'Female',
              order: 1,
              imageUrl:
                'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWZiOWdoNno3NzFybWp5MzB6eGU2dHl3NWcwOW1xbmt3NHd2NTAyZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5rUG5e98jvlhm/giphy.gif', // Beyonce

              // ce
              // Diverse group of women celebrating/empowering
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: genderQuestionTempId,
              text: 'Other',
              order: 2,
              imageUrl:
                'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXBqeXZibDdhMWFnbTZhNjNjeG8yN2MzZnF0NXN0ZDJiMDl4MWY1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ndspmyWNDTC0MKW2de/giphy.gif', // Other
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: genderQuestionTempId,
              text: 'Prefer not to say',
              order: 3,
              imageUrl:
                'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExamxwbHdrbDFzMTlhc2ZjZ2c1eDV0NWc1a3loampsdTVuN3NmdXZiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jbxfRR84why0wNstbw/giphy.gif', //
            },
          ];
          const genderQuestionToAdd: SurveyQuestionData = {
            tempId: genderQuestionTempId,
            id: '',
            studyId: studyId,
            text: standardGenderQuestionText,
            questionType: SurveyQuestionType.SINGLE_CHOICE,
            order: questionOrder++,
            isRandomized: false,
            isMandatory: true,
            kpiAssociation: null,
            options: genderOptions,
          };
          newQuestions.push(genderQuestionToAdd);
        }

        // Add Age Question if missing and space allows
        // Re-check combined length as gender might have been added
        if (!hasAgeQuestion && questions.length + newQuestions.length < 10) {
          const ageQuestionTempId = generateTempId();
          const ageOptions: TypeSurveyOptionData[] = [
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: 'Under 18',
              order: 0,
              imageUrl:
                'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZ1M2c1cXFjajByYzluNzllamRmbzd6dnU4dmJ6M3g2amZ1bnQ2byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1nfwnYf5Uz7hzhYof8/giphy.gif', // Funny Kid
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '18-24',
              order: 1,
              imageUrl:
                'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWd6eWVwYjgyOTQwaGRlNjJnb3d3aXplczB4aGI2cGN2aDVkZWh6eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SeuMW8SY2KivEOumhW/giphy.gif', // Ok Boomer
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '25-34',
              order: 2,
              imageUrl:
                'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG4xMDNidGs5dzRtcG5tODNnNHlqMzdmd3ZkYm53dDR0YjZ2eGF6biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kdX3zD7qAAY5Cu6s0b/giphy.gif', // Joey Friends
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '35-44',
              order: 3,
              imageUrl:
                'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3RyeWl4ZHN0aWg3bm14dGZ4MGgyN3Y0bWdpb3J3YzhuZ3J3MnhsNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Js8gkvuhpQLhkQ6kXN/giphy.gif', // Dad
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '45-54',
              order: 4,
              imageUrl:
                'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWlpZ3EwazN1ZTEwdmFmNDdqamhzbWZkZ3Q4ZHJtNTR4a24xODQ2diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Km2YiI2mzRKgw/giphy.gif', // No Money
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '55-64',
              order: 5,
              imageUrl:
                'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWZnamNtZnU3dG1wdGY0dTB6anBvc29lNWxuY2ZlZG55dGlld2cxMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCdPNT81vlv3y/giphy.gif', // Money
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: '65+',
              order: 6,
              imageUrl:
                'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGlydW9ubTVoaHI3bW5ibHhiZjBuMXpleDA0aHl5NnR1OHRpM3o5OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JT87wTuCmorTUhk6k4/giphy.gif', // Cruise
            },
            {
              tempId: generateTempId(),
              id: '',
              questionId: ageQuestionTempId,
              text: 'Prefer not to say',
              order: 7,
              imageUrl:
                'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnpzNGc0Nmx0YzVjNGdvNnVhb2FjcTEzcmt5ZGhrYnlkb2JpaGtiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W0Dldg5FhnH3dkfTtH/giphy.gif', // Not saying
            },
          ];
          const ageQuestionToAdd: SurveyQuestionData = {
            tempId: ageQuestionTempId,
            id: '',
            studyId: studyId,
            text: standardAgeQuestionText,
            questionType: SurveyQuestionType.SINGLE_CHOICE,
            order: questionOrder++,
            isRandomized: false,
            isMandatory: true,
            kpiAssociation: null,
            options: ageOptions,
          };
          newQuestions.push(ageQuestionToAdd);
        }

        // Save all new questions (AI suggested + standard demographic if added)
        if (newQuestions.length === 0) {
          // Possible if AI gave no suggestions and demographic Qs already existed or limit reached
          showSuccessToast('No new questions to add.');
        } else if (questions.length + newQuestions.length > 10) {
          // This condition might be hit if demographic questions pushed it over, even if AI questions alone were within limit.
          // Or if initial questions + AI questions already hit limit before demographic checks.
          // A more granular check for each demographic question was done above, so this is a final safeguard.
          showErrorToast(
            'Cannot add all suggested/standard questions as it would exceed the 10 question limit. Some may not have been added.'
          );
          // At this point, newQuestions might contain more than can be added.
          // For simplicity, we'll try to save what fits if it was purely AI questions.
          // If demographic questions were added, the checks above should have prevented overflow.
          // This path indicates a complex overflow. We might need to trim newQuestions or be more sophisticated.
          // For now, let's log and perhaps save only up to the limit.
          logger.warn(
            '[SurveyQuestionBuilder] Exceeded 10 question limit after processing all suggestions.',
            {
              initialCount: questions.length,
              newCount: newQuestions.length,
              totalAttempted: questions.length + newQuestions.length,
            }
          );
          // Attempt to save only what fits, prioritizing AI questions first if an overflow happens here.
          const questionsToSave = newQuestions.slice(0, Math.max(0, 10 - questions.length));
          for (const q of questionsToSave) {
            await saveQuestion(q, { showToast: false });
          }
          if (questionsToSave.length < newQuestions.length) {
            showErrorToast(
              `Some questions could not be added due to the 10 question limit. ${questionsToSave.length} questions were added.`
            );
          } else if (questionsToSave.length > 0) {
            showSuccessToast(`Successfully added ${questionsToSave.length} question(s).`);
          }
        } else {
          for (const q of newQuestions) {
            await saveQuestion(q, { showToast: false });
          }
          logger.info('AI suggestions and standard demographic questions processed and added.', {
            count: newQuestions.length,
          });
          showSuccessToast(`Successfully added ${newQuestions.length} question(s).`);
        }
        await fetchData(); // Refetch to get all questions with proper IDs and order from DB.
        setProgress(100);
        // Keep disclaimer showing after completion - it was set at the start
        // The main success toast is now more conditional above.
        // showSuccessToast(`Successfully added ${newQuestions.length} AI suggested question(s).`); // This was the old toast.
      } catch (err: unknown) {
        logger.error('[SurveyQuestionBuilder] Error during AI question suggestion:', {
          studyId,
          error: (err as Error).message,
          rawResponse: suggestedYaml, // Log the YAML if available
        });
        setError((err as Error).message || 'Failed to process AI suggestions.'); // Ensure setError is available and used correctly
      } finally {
        setIsAISuggesting(false);
        if (onIsAISuggestingChange) onIsAISuggestingChange(false);
        setProgress(0); // Reset progress
      }
    };

    useImperativeHandle(ref, () => ({
      handleAddQuestion: actualHandleAddQuestion,
      handleSuggestQuestions: actualHandleSuggestQuestions,
    }));

    const handleSelectGifOption = (questionId: string, optionIdOrTempId: string) => {
      setSelectedGifOptions(prev => ({
        ...prev,
        [questionId]: optionIdOrTempId,
      }));
      // console.log('Selected GIF option', { questionId, optionIdOrTempId });
    };

    const handleInitiateGifSearch = (
      questionId: string,
      optionId: string,
      currentText: string = ''
    ) => {
      setGifSearchModalTriggerState({
        isOpen: true,
        questionId,
        optionId,
        currentSearchTerm: currentText,
      });
    };

    // useEffect to manage simulated progress for the modal
    useEffect(() => {
      const timers: NodeJS.Timeout[] = [];
      if (isAISuggesting) {
        setCurrentProgressStepIdx(0);
        setProgress(0);
        setCompletedSteps(new Array(PROGRESS_STEPS_CONFIG.length).fill(false));

        const totalDuration = 55000;
        const stepDuration = totalDuration / PROGRESS_STEPS_CONFIG.length;

        PROGRESS_STEPS_CONFIG.forEach((step: ProgressStep, index: number) => {
          const timer = setTimeout(() => {
            setCompletedSteps(prev => prev.map((s, i) => (i < index ? true : s)));
            setCurrentProgressStepIdx(index);
            setProgress(((index + 1) / PROGRESS_STEPS_CONFIG.length) * 100);
            if (index === PROGRESS_STEPS_CONFIG.length - 1) {
              setCompletedSteps(prev => prev.map(() => true));
            }
          }, index * stepDuration);
          timers.push(timer);
        });
      } else {
        timers.forEach(clearTimeout);
      }
      return () => {
        timers.forEach(clearTimeout);
      };
    }, [isAISuggesting]);

    const handleDragEndOptions = useCallback(
      (event: DragEndEvent, questionIdOrTempId: string) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          setQuestions(prevQuestions =>
            prevQuestions.map(q => {
              if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
                const oldIndex = q.options.findIndex(opt => (opt.id || opt.tempId!) === active.id);
                const newIndex = q.options.findIndex(opt => (opt.id || opt.tempId!) === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                  const reorderedOptions = arrayMove(q.options, oldIndex, newIndex);
                  const finalOptions = reorderedOptions.map((opt, index) => ({
                    ...opt,
                    order: index,
                  }));
                  const updatedQuestion = { ...q, options: finalOptions };
                  setTimeout(() => saveQuestion(updatedQuestion, { showToast: true }), 50);
                  return updatedQuestion;
                }
              }
              return q;
            })
          );
        }
      },
      [setQuestions, saveQuestion]
    );

    if (!isAuthLoaded || (isLoading && questions.length === 0 && !error)) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }

    if (isAuthLoaded && !isSignedIn) {
      return (
        <Alert variant="default">
          <Icon iconId="faSignInLight" className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to design this survey.</AlertDescription>
        </Alert>
      );
    }

    if (isAuthLoaded && isSignedIn && !activeOrgId) {
      return (
        <Alert variant="default">
          <Icon iconId="faTriangleExclamationLight" className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Organization Required</AlertTitle>
          <AlertDescription>
            An active organization is required to design this survey. Please select or create an
            organization in your settings.
          </AlertDescription>
        </Alert>
      );
    }

    if (error && questions.length === 0 && !isLoading) {
      return (
        <Alert variant="destructive">
          <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {/* Survey Questions Section - now takes full width */}
        <div className="space-y-6">
          {/* AI-Generated Questions Disclaimer */}
          {showAiDisclaimer && (
            <Alert variant="default" className="border-amber-500 bg-amber-100 shadow-md">
              <Icon iconId="faTriangleExclamationSolid" className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900 font-semibold text-lg">
                AI-Generated Draft Questions - Review Required
              </AlertTitle>
              <AlertDescription className="text-amber-800 text-base leading-relaxed">
                <strong>Important:</strong> These questions have been produced in draft form by AI
                as recommendations only. It is your responsibility to review, edit, and update all
                questions and GIFs to ensure they're properly aligned with your brand and campaign
                goals. Please thoroughly review each question before proceeding.
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAiDisclaimer(false)}
                  className="ml-2 h-auto p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-200"
                >
                  <Icon iconId="faXmarkLight" className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-2">
              <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />{' '}
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map(q => q.id || q.tempId!)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((questionData, i) => (
                <SortableQuestionItem
                  key={questionData.id || questionData.tempId}
                  question={questionData}
                  index={i}
                  onUpdateQuestionText={handleUpdateQuestionText}
                  onUpdateQuestionType={handleUpdateQuestionType}
                  onToggleRandomized={handleToggleRandomized}
                  onToggleMandatory={handleToggleMandatory}
                  onUpdateKpiAssociation={handleUpdateKpiAssociation}
                  onDeleteQuestion={handleDeleteQuestionWrapper}
                  onAddOption={handleAddOptionWrapper}
                  actionsDisabled={actionsDisabled}
                  actionsDisabledTitle={actionsDisabledTitle}
                  selectedGifOptions={selectedGifOptions}
                  onSelectOption={handleSelectGifOption}
                  onInitiateGifSearch={handleInitiateGifSearch}
                  editingOptionGL={editingOptionGL}
                  setEditingOptionGL={setEditingOptionGL}
                  editingQuestionDetail={editingQuestionDetail}
                  setEditingQuestionDetail={setEditingQuestionDetail}
                  onUpdateOptionText={handleUpdateOptionText}
                  onDeleteOptionForQuestion={handleDeleteOptionWrapper}
                  onDragEndOptions={handleDragEndOptions}
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
        </div>

        {/* New GIF Search Modal Integration */}
        {gifSearchModalTriggerState?.isOpen && GIPHY_API_KEY && (
          <GifSearchModal
            isOpen={gifSearchModalTriggerState.isOpen}
            onClose={() => setGifSearchModalTriggerState(null)}
            onGifSelected={gifUrl => {
              if (gifSearchModalTriggerState) {
                handleUpdateOptionImageUrl(
                  gifSearchModalTriggerState.questionId,
                  gifSearchModalTriggerState.optionId,
                  gifUrl
                );
              }
              setGifSearchModalTriggerState(null);
            }}
            initialSearchTerm={gifSearchModalTriggerState.currentSearchTerm || ''}
            giphyApiKey={GIPHY_API_KEY}
          />
        )}

        {/* Progress Modal */}
        <Dialog
          open={isAISuggesting}
          onOpenChange={open => {
            if (!open) {
              setIsAISuggesting(false);
              onIsAISuggestingChange?.(false);
            }
          }}
        >
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={e => e.preventDefault()}
            onInteractOutside={e => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Crafting Your Brand Lift Study
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Justify is working its magic. Please wait a moment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {PROGRESS_STEPS_CONFIG.map((step: ProgressStep, index: number) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {completedSteps[index] ? (
                    <Icon
                      iconId="faCircleCheckLight"
                      className="h-5 w-5 text-green-500 flex-shrink-0"
                    />
                  ) : currentProgressStepIdx === index ? (
                    <Icon
                      iconId="faCircleNotchLight"
                      className="h-5 w-5 text-primary animate-spin flex-shrink-0"
                    />
                  ) : (
                    <Icon
                      iconId="faCircleLight"
                      className="h-5 w-5 text-muted-foreground/30 flex-shrink-0"
                    />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      completedSteps[index]
                        ? 'text-muted-foreground line-through italic'
                        : currentProgressStepIdx === index
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground/80'
                    )}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="w-full h-2 mt-2 mb-1" />
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

SurveyQuestionBuilder.displayName = 'SurveyQuestionBuilder';

export default SurveyQuestionBuilder;
