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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import yaml from 'js-yaml';
import { z } from 'zod';
import {
  SurveyQuestionType,
  BrandLiftStudyStatus as PrismaBrandLiftStudyStatusEnum,
} from '@prisma/client';
import { useAuth } from '@clerk/nextjs'; // Import useAuth
import { ForbiddenError, NotFoundError, UnauthenticatedError, BadRequestError } from '@/lib/errors'; // Added import for custom errors

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
import { cn } from '@/lib/utils';
import { GifCard } from '@/components/ui/card-gif'; // Import the new GifCard
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

// --- Giphy API Key ---
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

// --- Giphy Helper Function ---
async function fetchGifFromGiphy(searchTerm: string): Promise<string | null> {
  if (!GIPHY_API_KEY) {
    logger.warn('[Giphy] API key not configured. Skipping GIF fetch.');
    return null;
  }
  if (!searchTerm || searchTerm.trim() === '') {
    logger.info('[Giphy] Empty search term. Skipping GIF fetch.');
    return null;
  }

  // Using Giphy Search endpoint. Translate might also be an option.
  // https://developers.giphy.com/docs/api/endpoint#search
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
    searchTerm
  )}&limit=1&offset=0&rating=g&lang=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      logger.error('[Giphy] API Error:', { status: response.status, data: errorData });
      return null;
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Using downsized version for previews, adjust if original or other sizes are needed
      return (
        data.data[0].images?.downsized_medium?.url || data.data[0].images?.original?.url || null
      );
    }
    logger.info('[Giphy] No GIFs found for term:', { searchTerm });
    return null;
  } catch (error) {
    logger.error('[Giphy] Fetch error:', { error });
    return null;
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

// Helper function to map KPI association string to icon ID from kpis-icon-registry.json
const getKpiIconId = (kpiAssociation: string | null | undefined): string | null => {
  if (!kpiAssociation) return null;
  // Example: "AD_RECALL" -> "kpisAdRecall"
  // This needs to match the `id` field in kpis-icon-registry.json
  const parts = kpiAssociation.toLowerCase().split('_');
  const capitalizedParts = parts.map((part, index) =>
    index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
  );
  return `kpis${capitalizedParts.join('')}`;
};

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
  onUpdateQuestionOrder: (questionIdOrTempId: string, order: number) => void;
  onToggleRandomized: (questionIdOrTempId: string, checked: boolean) => void;
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
  actionsDisabled: boolean;
  actionsDisabledTitle?: string;
  selectedOptionId?: string | null; // To manage which option is selected for GIF cards
  onSelectOption?: (questionId: string, optionIdOrTempId: string) => void; // Callback for when an option/GIF is selected
  onInitiateGifSearch?: (questionId: string, optionId: string, currentText?: string) => void; // New prop
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = React.memo(
  ({
    question,
    index,
    onUpdateQuestionText,
    onUpdateQuestionType,
    onUpdateQuestionOrder,
    onToggleRandomized,
    onUpdateKpiAssociation,
    onDeleteQuestion,
    onAddOption,
    onUpdateOptionText,
    onUpdateOptionImageUrl,
    onUpdateOptionOrder,
    onDeleteOption,
    actionsDisabled,
    actionsDisabledTitle,
    selectedOptionId,
    onSelectOption,
    onInitiateGifSearch,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: question.id || question.tempId!,
    });
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [editingOption, setEditingOption] = useState<{
      optionId: string;
      currentText: string;
    } | null>(null); // For GIF text editing

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 10 : 'auto',
    };
    const qId = question.id || question.tempId!;
    const currentKpiTooltip =
      question.kpiAssociation &&
      kpiTooltips[question.kpiAssociation.toUpperCase().replace(/\s+/g, '_')]
        ? kpiTooltips[question.kpiAssociation.toUpperCase().replace(/\s+/g, '_')]
        : formatKpiName(question.kpiAssociation);

    return (
      <Card ref={setNodeRef} style={style} className="mb-4 bg-white shadow-sm relative group">
        <CardHeader
          className="flex flex-row items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2 flex-grow min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="p-1 opacity-50 hover:opacity-100 touch-none" // Added touch-none to allow drag on touch devices if header is clickable
              title="Drag to reorder"
              onClick={e => e.stopPropagation()} // Prevent header click from triggering when dragging
            >
              <Icon iconId="faBarsLight" className="h-4 w-4 text-muted-foreground" />
            </div>
            {/* Add Question Type Icon Here */}
            <Icon
              iconId={
                question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                  ? 'faListCheckLight'
                  : 'faListRadioLight'
              }
              className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0"
              aria-label={
                question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                  ? 'Multiple Choice'
                  : 'Single Choice'
              }
            />
            <CardTitle
              className="text-md truncate flex-grow"
              title={question.text || `Question ${index + 1}`}
            >
              Question {index + 1}: {question.text.substring(0, 50)}
              {question.text.length > 50 ? '...' : ''}
            </CardTitle>
            {/* KPI Badge - MOVED HERE */}
            {question.kpiAssociation && (
              <div className="ml-2 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline" // Use outline for structure
                        className="cursor-default bg-accent text-accent-foreground hover:bg-accent focus:bg-accent border-accent"
                      >
                        <Icon
                          iconId={getKpiIconId(question.kpiAssociation) || 'faTagLight'}
                          className="h-3 w-3 mr-1.5"
                        />
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
            {/* Chevron icon for collapse/expand state, moved inside the clickable part of header */}
            <Icon
              iconId={isExpanded ? 'faChevronUpLight' : 'faChevronDownLight'}
              className="h-4 w-4 text-muted-foreground ml-auto flex-shrink-0"
            />
          </div>
          <div className="flex items-center flex-shrink-0 pl-2">
            {' '}
            {/* Added pl-2 for spacing */}
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
            <Textarea
              value={question.text}
              onChange={e => onUpdateQuestionText(qId, e.target.value)}
              placeholder="Enter question text..."
              disabled={actionsDisabled}
              title={actionsDisabled ? actionsDisabledTitle : undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={question.questionType}
                onValueChange={v => onUpdateQuestionType(qId, v as SurveyQuestionType)}
                disabled={actionsDisabled}
              >
                <SelectTrigger title={actionsDisabled ? actionsDisabledTitle : undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SurveyQuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                  <SelectItem value={SurveyQuestionType.MULTIPLE_CHOICE}>
                    Multiple Choice
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`rand-${qId}`}
                  checked={question.isRandomized ?? false}
                  onCheckedChange={c => onToggleRandomized(qId, c)}
                  disabled={actionsDisabled}
                  title={actionsDisabled ? actionsDisabledTitle : undefined}
                />
                <Label htmlFor={`rand-${qId}`}>Randomise Options</Label>
              </div>
            </div>
            {/* The placeholder for Associate KPI button if no KPI is associated - can remain or be removed */}
            {!question.kpiAssociation && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    /* Placeholder for KPI selection UI */
                  }}
                  className="text-xs h-7 px-2 py-1"
                  disabled // Or enable if it opens a KPI selection modal
                  title="Associate KPI (Feature TBD)"
                >
                  <Icon iconId="faPlusLight" className="mr-1 h-3 w-3" />
                  Associate KPI
                </Button>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Options:</Label>
              <div className="flex flex-row overflow-x-auto space-x-2 mt-1 pb-2">
                {' '}
                {/* Added pb-2 for scrollbar clearance */}
                {question.options
                  .sort((a, b) => a.order - b.order)
                  .map((opt, optIdx) => {
                    const optId = opt.id || opt.tempId!;
                    // Check if the imageUrl likely points to a GIF
                    const isGif =
                      opt.imageUrl &&
                      (opt.imageUrl.endsWith('.gif') || opt.imageUrl.includes('giphy.com'));

                    return (
                      <React.Fragment key={optId}>
                        {isGif ? (
                          <div className="p-1 self-stretch flex flex-col flex-shrink-0 w-48">
                            {' '}
                            {/* Adjusted for horizontal scroll */}
                            <GifCard
                              gifUrl={opt.imageUrl!}
                              altText={opt.text || `Option ${optIdx + 1}`}
                              optionText={opt.text || `Option ${optIdx + 1}`}
                              isSelected={optId === selectedOptionId}
                              onClick={() => onSelectOption?.(qId, optId)} // This could also trigger GIF search later
                              className="flex-grow"
                              disabled={actionsDisabled}
                              disabledTitle={actionsDisabled ? actionsDisabledTitle : undefined}
                            />
                            <div className="mt-1 flex items-center justify-between">
                              {editingOption?.optionId === optId ? (
                                <div className="w-full space-y-1">
                                  <Input
                                    value={editingOption.currentText}
                                    onChange={e =>
                                      setEditingOption(prev => ({
                                        ...prev!,
                                        currentText: e.target.value,
                                      }))
                                    }
                                    placeholder="Option text"
                                    className="text-xs h-7"
                                    disabled={actionsDisabled}
                                  />
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        onUpdateOptionText(
                                          qId,
                                          editingOption.optionId,
                                          editingOption.currentText
                                        );
                                        setEditingOption(null);
                                      }}
                                      disabled={actionsDisabled}
                                      className="text-xs h-6 px-1.5 py-0.5 flex-grow"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingOption(null)}
                                      disabled={actionsDisabled}
                                      className="text-xs h-6 px-1.5 py-0.5 flex-grow"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs truncate flex-grow mr-1" title={opt.text}>
                                  {opt.text || `Option ${optIdx + 1}`}
                                </span>
                              )}
                              {!editingOption || editingOption.optionId !== optId ? (
                                <React.Fragment>
                                  <IconButtonAction
                                    iconBaseName="faPenToSquare"
                                    ariaLabel="Edit option text"
                                    onClick={
                                      actionsDisabled
                                        ? undefined
                                        : () =>
                                            setEditingOption({
                                              optionId: optId,
                                              currentText: opt.text,
                                            })
                                    }
                                    className={cn(
                                      'h-6 w-6 p-0.5',
                                      actionsDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                    hoverColorClass="text-accent"
                                  />
                                  <IconButtonAction
                                    iconBaseName="faMagnifyingGlass"
                                    ariaLabel="Search for GIF"
                                    onClick={
                                      actionsDisabled
                                        ? undefined
                                        : () => onInitiateGifSearch?.(qId, optId, opt.text)
                                    }
                                    className={cn(
                                      'h-6 w-6 p-0.5',
                                      actionsDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                    hoverColorClass="text-accent"
                                  />
                                </React.Fragment>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <Card
                            key={optId}
                            className="p-2 bg-slate-50 space-y-1 flex-shrink-0 w-64"
                          >
                            {' '}
                            {/* Added flex-shrink-0 and example width */}
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Option {optIdx + 1}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto"
                                onClick={() => onDeleteOption(qId, optId)}
                                disabled={actionsDisabled}
                                title={actionsDisabled ? actionsDisabledTitle : 'Delete option'}
                              >
                                <Icon iconId="faXmarkLight" className="h-3 w-3" />
                              </Button>
                            </div>
                            <Input
                              value={opt.text}
                              onChange={e => onUpdateOptionText(qId, optId, e.target.value)}
                              placeholder="Option text"
                              disabled={actionsDisabled}
                              title={actionsDisabled ? actionsDisabledTitle : undefined}
                            />
                            <Input
                              value={opt.imageUrl || ''}
                              onChange={e =>
                                onUpdateOptionImageUrl(qId, optId, e.target.value || null)
                              }
                              placeholder="Image/GIF URL (optional)"
                              disabled={actionsDisabled}
                              title={actionsDisabled ? actionsDisabledTitle : undefined}
                            />
                            <Input
                              type="number"
                              value={opt.order}
                              onChange={e =>
                                onUpdateOptionOrder(qId, optId, parseInt(e.target.value, 10) || 0)
                              }
                              placeholder="Order"
                              className="w-16 text-xs"
                              disabled={actionsDisabled}
                              title={actionsDisabled ? actionsDisabledTitle : undefined}
                            />
                          </Card>
                        )}
                      </React.Fragment>
                    );
                  })}
              </div>
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

const SurveyQuestionBuilder = forwardRef<SurveyQuestionBuilderRef, SurveyQuestionBuilderProps>(
  ({ studyId, onIsAISuggestingChange }, ref) => {
    const { orgId: activeOrgId, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [studyDetails, setStudyDetails] = useState<Partial<BrandLiftStudyData> | null>(null);
    const [isAISuggestingInternal, setIsAISuggestingInternal] = useState(false);
    const [saveStatus, setSaveStatus] = useState<
      Record<string, 'saving' | 'saved' | 'error' | null>
    >({});
    const [hasInitializedQuestions, setHasInitializedQuestions] = useState(false);
    // State to track selected GIF option for each question
    const [selectedGifOptions, setSelectedGifOptions] = useState<Record<string, string | null>>({});
    // State for GIF Search Modal
    const [gifSearchModalState, setGifSearchModalState] = useState<{
      questionId: string;
      optionId: string;
      currentSearchTerm: string;
      searchResults: string[];
      isLoading: boolean;
      error?: string;
    } | null>(null);
    const [gifSearchInput, setGifSearchInput] = useState(''); // Separate state for modal input

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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
            throw new Error(
              (await response.json().then(e => e.error)) || 'Failed to save question'
            );
          const savedQuestion = await response.json();
          setQuestions(prev =>
            prev
              .map(q =>
                q.id === qId || q.tempId === qId
                  ? {
                      ...savedQuestion,
                      options: (savedQuestion.options || []).sort(
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
        const fetchedStudyDetails = await studyRes.json();
        setStudyDetails(fetchedStudyDetails);

        if (!questionsRes.ok)
          throw new Error(
            (await questionsRes.json().then(e => e.error)) || 'Failed to fetch questions'
          );
        const fetchedQuestions = ((await questionsRes.json()) as SurveyQuestionData[]).sort(
          (a, b) => a.order - b.order
        );
        setQuestions(fetchedQuestions);

        // Initialize with 10 blank questions if fetchedQuestions is empty and not already initialized
        if (fetchedQuestions.length === 0 && !hasInitializedQuestions) {
          const newBlankQuestions: SurveyQuestionData[] = [];
          for (let i = 0; i < 10; i++) {
            newBlankQuestions.push({
              tempId: generateTempId(),
              id: '',
              studyId: studyId,
              text: `Placeholder Question ${i + 1}`,
              questionType: SurveyQuestionType.SINGLE_CHOICE,
              order: i,
              isRandomized: false,
              isMandatory: true,
              kpiAssociation: null,
              options: [
                { tempId: generateTempId(), id: '', text: 'Option 1', order: 0, imageUrl: null },
              ],
            });
          }
          setQuestions(newBlankQuestions);
          for (const q of newBlankQuestions) {
            await saveQuestion(q);
          }
          setHasInitializedQuestions(true);
        } else if (fetchedQuestions.length > 0) {
          setHasInitializedQuestions(true);
        }
      } catch (err: any) {
        logger.error('Error fetching data for builder:', { studyId, error: err.message });
        setError(err.message);
      }
      setIsLoading(false);
    }, [studyId, isAuthLoaded, isSignedIn, activeOrgId, hasInitializedQuestions, saveQuestion]);

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
    const handleUpdateKpiAssociation = (id: string, kpi: string | null) =>
      updateQuestionProperty(id, { kpiAssociation: kpi });

    const actualHandleAddQuestion = () => {
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
            const newOrder =
              q.options.length > 0 ? Math.max(...q.options.map(o => o.order)) + 1 : 0;
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

    const actualHandleSuggestQuestions = async () => {
      let yamlSuggestionsForErrorLog: string | null = null;
      setIsAISuggestingInternal(true);
      onIsAISuggestingChange?.(true);
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
        yamlSuggestionsForErrorLog = yamlText;
        const parsed = yaml.load(yamlText) as any[];
        const validation = aiSuggestedQuestionsSchema.safeParse(parsed);

        if (!validation.success) {
          logger.error('AI suggestions failed Zod validation', {
            errors: validation.error.flatten(),
            raw: yamlText,
          });
          throw new Error('Received invalid suggestions structure from AI.');
        }
        const newAiQuestions: SurveyQuestionData[] = await Promise.all(
          validation.data.map(async (aiQ: ValidatedAiQuestion, idx: number) => {
            const optionsWithImages: SurveyOptionData[] = await Promise.all(
              aiQ.options.map(async (aiOpt: ValidatedAiOption, optIdx: number) => {
                let imageUrl: string | null = null;
                if (aiOpt.image_description) {
                  imageUrl = await fetchGifFromGiphy(aiOpt.image_description);
                }
                return {
                  tempId: generateTempId(),
                  id: '',
                  text: aiOpt.text,
                  imageUrl: imageUrl,
                  order: optIdx,
                };
              })
            );

            return {
              tempId: generateTempId(),
              id: '',
              studyId: studyId,
              text: aiQ.text,
              questionType: aiQ.type,
              order: questions.length + idx,
              isRandomized: aiQ.is_randomized,
              isMandatory: aiQ.is_mandatory,
              kpiAssociation: aiQ.kpi_association,
              options: optionsWithImages,
            };
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
      setIsAISuggestingInternal(false);
      onIsAISuggestingChange?.(false);
    };

    useImperativeHandle(ref, () => ({
      handleAddQuestion: actualHandleAddQuestion,
      handleSuggestQuestions: actualHandleSuggestQuestions,
    }));

    // Handler for selecting a GIF option
    const handleSelectGifOption = (questionId: string, optionIdOrTempId: string) => {
      setSelectedGifOptions(prev => ({
        ...prev,
        [questionId]: optionIdOrTempId,
      }));
      logger.info('Selected GIF option', { questionId, optionIdOrTempId });
    };

    // Add the new handler for initiating GIF search modal
    const handleInitiateGifSearch = (
      questionId: string,
      optionId: string,
      currentText: string = ''
    ) => {
      setGifSearchModalState({
        questionId,
        optionId,
        currentSearchTerm: currentText, // Keep original term for context if needed
        searchResults: [],
        isLoading: false,
        error: undefined,
      });
      setGifSearchInput(currentText); // Initialize input with current option text or description
    };

    const executeGifSearch = async () => {
      // Removed searchTerm param, will use gifSearchInput
      if (!gifSearchModalState || !gifSearchInput.trim()) return;
      setGifSearchModalState(prev => ({
        ...prev!,
        isLoading: true,
        error: undefined,
        searchResults: [],
      }));
      try {
        const gifUrl = await fetchGifFromGiphy(gifSearchInput);
        setGifSearchModalState(prev => ({
          ...prev!,
          isLoading: false,
          searchResults: gifUrl ? [gifUrl] : [],
          error: gifUrl ? undefined : 'No GIF found for that term.',
        }));
      } catch (e: any) {
        logger.error('Giphy Search Execution Error:', e);
        setGifSearchModalState(prev => ({
          ...prev!,
          isLoading: false,
          error: e.message || 'Failed to search GIFs.',
        }));
      }
    };

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
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id || question.tempId}
                  question={question}
                  index={index}
                  onUpdateQuestionText={handleUpdateQuestionText}
                  onUpdateQuestionType={handleUpdateQuestionType}
                  onUpdateQuestionOrder={handleUpdateQuestionOrder}
                  onToggleRandomized={handleToggleRandomized}
                  onUpdateKpiAssociation={handleUpdateKpiAssociation}
                  onDeleteQuestion={handleDeleteQuestionWrapper}
                  onAddOption={handleAddOptionWrapper}
                  onUpdateOptionText={handleUpdateOptionText}
                  onUpdateOptionImageUrl={handleUpdateOptionImageUrl}
                  onUpdateOptionOrder={handleUpdateOptionOrder}
                  onDeleteOption={handleDeleteOptionWrapper}
                  actionsDisabled={actionsDisabled}
                  actionsDisabledTitle={actionsDisabledTitle}
                  selectedOptionId={selectedGifOptions[question.id || question.tempId!]}
                  onSelectOption={handleSelectGifOption}
                  onInitiateGifSearch={handleInitiateGifSearch}
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

        {/* GIF Search Modal */}
        {gifSearchModalState && (
          <Dialog
            open={!!gifSearchModalState}
            onOpenChange={isOpen => !isOpen && setGifSearchModalState(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Search for a GIF</DialogTitle>
                <DialogDescription>
                  Enter a term to search for a GIF. The first result will be shown.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gif-search-term" className="text-right">
                    Search
                  </Label>
                  <Input
                    id="gif-search-term"
                    value={gifSearchInput}
                    onChange={e => setGifSearchInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && executeGifSearch()} // Allow Enter to search
                    className="col-span-3"
                    placeholder="e.g., happy cat, thumbs up"
                  />
                </div>
                {gifSearchModalState.isLoading && (
                  <div className="flex justify-center items-center p-4">
                    <Icon iconId="faSpinnerLight" className="animate-spin h-8 w-8 text-primary" />
                  </div>
                )}
                {gifSearchModalState.error && (
                  <Alert variant="destructive">
                    <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
                    <AlertTitle>Search Error</AlertTitle>
                    <AlertDescription>{gifSearchModalState.error}</AlertDescription>
                  </Alert>
                )}
                {gifSearchModalState.searchResults.length > 0 && (
                  <div className="mt-2 flex flex-col items-center">
                    <p className="text-sm text-muted-foreground mb-2">Result (click to use):</p>
                    {gifSearchModalState.searchResults.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Search result ${idx + 1}`}
                        className="max-w-full h-auto rounded-md cursor-pointer border hover:border-primary"
                        onClick={() => {
                          handleUpdateOptionImageUrl(
                            gifSearchModalState.questionId,
                            gifSearchModalState.optionId,
                            url
                          );
                          setGifSearchModalState(null);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={executeGifSearch}
                  disabled={gifSearchModalState.isLoading || !gifSearchInput.trim()}
                >
                  {gifSearchModalState.isLoading ? (
                    <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <Icon iconId="faMagnifyingGlassLight" className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
);

SurveyQuestionBuilder.displayName = 'SurveyQuestionBuilder';

export default SurveyQuestionBuilder;
