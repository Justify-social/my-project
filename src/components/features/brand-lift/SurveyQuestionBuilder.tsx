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
import toast from 'react-hot-toast'; // Added import for react-hot-toast
import { showSuccessToast, showErrorToast } from '@/components/ui/toast'; // Added import for SSOT toasts

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
    onToggleMandatory,
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
    const [isEditingQuestionText, setIsEditingQuestionText] = React.useState(false); // New state for inline editing
    const [currentQuestionText, setCurrentQuestionText] = React.useState(question.text); // New state for temp question text

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

    // NEW: Determine KPI icon using the explicit map
    const normalizedKpiKeyForIcon = question.kpiAssociation?.toUpperCase().replace(/\s+/g, '_');
    const kpiIconToRender =
      normalizedKpiKeyForIcon && kpiAssociationToIconIdMap[normalizedKpiKeyForIcon]
        ? kpiAssociationToIconIdMap[normalizedKpiKeyForIcon]
        : 'faTagLight'; // Fallback icon

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
              className="opacity-50 hover:opacity-100 touch-none cursor-grab flex items-center justify-center" // Removed p-1, added flex for self-centering
              title={
                question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                  ? 'Drag to reorder (Multiple Choice)'
                  : 'Drag to reorder (Single Choice)'
              }
              onClick={e => e.stopPropagation()} // Prevent header click from triggering when dragging
            >
              <Icon
                iconId={
                  question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                    ? 'faListCheckLight'
                    : 'faListRadioLight'
                }
                className="h-4 w-4 text-muted-foreground" // Removed mr-2 and flex-shrink-0 as it's the primary icon here
                aria-label={
                  question.questionType === SurveyQuestionType.MULTIPLE_CHOICE
                    ? 'Multiple Choice Question'
                    : 'Single Choice Question'
                }
              />
            </div>
            <CardTitle
              className="text-md truncate flex-grow ml-2" // Added ml-2 for spacing from new drag-icon
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
                        className="cursor-default bg-accent text-white hover:bg-accent focus:bg-accent border-accent" // Changed text-accent-foreground to text-white
                      >
                        <Icon
                          iconId={kpiIconToRender} // Use the new mapped icon ID
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
            {isEditingQuestionText ? (
              <div className="space-y-2">
                <Textarea
                  value={currentQuestionText}
                  onChange={e => setCurrentQuestionText(e.target.value)}
                  placeholder="Enter question text..."
                  disabled={actionsDisabled}
                  title={actionsDisabled ? actionsDisabledTitle : undefined}
                  autoFocus
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingQuestionText(false);
                      setCurrentQuestionText(question.text); // Reset on cancel
                    }}
                    disabled={actionsDisabled}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onUpdateQuestionText(qId, currentQuestionText);
                      setIsEditingQuestionText(false);
                    }}
                    disabled={actionsDisabled || currentQuestionText.trim() === ''}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="p-2 rounded-md border border-transparent hover:border-input min-h-[60px] cursor-text break-words whitespace-pre-wrap"
                onClick={() => {
                  if (!actionsDisabled) {
                    setCurrentQuestionText(question.text); // Ensure current text is loaded before editing
                    setIsEditingQuestionText(true);
                  }
                }}
                title={actionsDisabled ? actionsDisabledTitle : 'Click to edit question text'}
              >
                {question.text || (
                  <span className="text-muted-foreground italic">Enter question text...</span>
                )}
              </div>
            )}
            {/* START: Grouped Toggles Section - Revised Columns */}
            <div className="p-3 border rounded-md bg-slate-100/80">
              <div className="flex flex-row gap-4 md:gap-6">
                {/* Column 1: Choice Types */}
                <div className="flex-1 flex flex-col space-y-3 p-3 border border-slate-200 rounded-md bg-white shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`type-sc-${qId}`}
                      checked={question.questionType === SurveyQuestionType.SINGLE_CHOICE}
                      onCheckedChange={isChecked => {
                        if (isChecked) {
                          onUpdateQuestionType(qId, SurveyQuestionType.SINGLE_CHOICE);
                        } else if (question.questionType === SurveyQuestionType.SINGLE_CHOICE) {
                          onUpdateQuestionType(qId, SurveyQuestionType.MULTIPLE_CHOICE);
                        }
                      }}
                      disabled={actionsDisabled}
                      title={actionsDisabled ? actionsDisabledTitle : 'Set to Single Choice'}
                    />
                    <Label htmlFor={`type-sc-${qId}`}>Single Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`type-mc-${qId}`}
                      checked={question.questionType === SurveyQuestionType.MULTIPLE_CHOICE}
                      onCheckedChange={isChecked => {
                        if (isChecked) {
                          onUpdateQuestionType(qId, SurveyQuestionType.MULTIPLE_CHOICE);
                        } else if (question.questionType === SurveyQuestionType.MULTIPLE_CHOICE) {
                          onUpdateQuestionType(qId, SurveyQuestionType.SINGLE_CHOICE);
                        }
                      }}
                      disabled={actionsDisabled}
                      title={actionsDisabled ? actionsDisabledTitle : 'Set to Multiple Choice'}
                    />
                    <Label htmlFor={`type-mc-${qId}`}>Multiple Choice</Label>
                  </div>
                </div>

                {/* Column 2: Option Settings */}
                <div className="flex-1 flex flex-col space-y-3 p-3 border border-slate-200 rounded-md bg-white shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`rand-${qId}`}
                      checked={question.isRandomized ?? false}
                      onCheckedChange={c => onToggleRandomized(qId, c)}
                      disabled={actionsDisabled}
                      title={actionsDisabled ? actionsDisabledTitle : 'Randomise options'}
                    />
                    <Label htmlFor={`rand-${qId}`}>Randomise Options</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`mand-${qId}`}
                      checked={!(question.isMandatory ?? true)}
                      onCheckedChange={c => onToggleMandatory(qId, !c)}
                      disabled={actionsDisabled}
                      title={
                        actionsDisabled
                          ? actionsDisabledTitle
                          : 'ON = Non-Forced (user not forced to pick a main answer), OFF = Forced (answer required from options)'
                      }
                    />
                    <Label htmlFor={`mand-${qId}`}>Non-Forced Choice</Label>
                  </div>
                </div>
              </div>
            </div>
            {/* END: Grouped Toggles Section */}

            {/* START: Associate KPI Section */}
            <div className="mt-2">
              <Label htmlFor={`kpi-assoc-${qId}`} className="text-sm font-medium mr-2">
                Associated KPI:
              </Label>
              <Select
                value={question.kpiAssociation || '_NO_KPI_'} // Line changed
                onValueChange={value =>
                  onUpdateKpiAssociation(qId, value === '_NO_KPI_' ? null : value)
                } // Line changed
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
                  </SelectItem>{' '}
                  {/* Line changed */}
                  {Object.entries(kpiAssociationToIconIdMap).map(([kpiKey, iconId]) => (
                    // kpiKey is e.g., AD_RECALL. We need its display name.
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
            {/* END: Associate KPI Section */}

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
                            <GifCard
                              gifUrl={opt.imageUrl!}
                              altText={opt.text || `Option ${optIdx + 1}`}
                              optionText={opt.text || `Option ${optIdx + 1}`}
                              isSelected={optId === selectedOptionId}
                              onClick={() => onSelectOption?.(qId, optId)}
                              onSearchClick={() => onInitiateGifSearch?.(qId, optId, opt.text)}
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
                                    autoFocus
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
                                      disabled={
                                        actionsDisabled || editingOption.currentText.trim() === ''
                                      }
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
                                <div
                                  className="flex items-center space-x-1 text-xs truncate flex-grow mr-1 group/text relative p-1 cursor-pointer hover:bg-slate-100 rounded"
                                  title={opt.text || `Option ${optIdx + 1}`}
                                  onClick={
                                    actionsDisabled
                                      ? undefined
                                      : () =>
                                          setEditingOption({
                                            optionId: optId,
                                            currentText: opt.text,
                                          })
                                  }
                                >
                                  <span className="truncate">
                                    {opt.text || `Option ${optIdx + 1}`}
                                  </span>
                                  {!actionsDisabled && (
                                    <Icon
                                      iconId="faPenToSquareLight"
                                      className="h-3 w-3 text-muted-foreground opacity-0 group-hover/text:opacity-100 transition-opacity"
                                    />
                                  )}
                                </div>
                              )}
                              {/* Delete button for the option itself */}
                              <IconButtonAction
                                iconBaseName="faTrashCan"
                                ariaLabel="Delete option"
                                onClick={
                                  actionsDisabled ? undefined : () => onDeleteOption(qId, optId)
                                }
                                className={cn(
                                  'h-6 w-6 p-0.5 flex-shrink-0',
                                  actionsDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                                hoverColorClass="text-destructive"
                              />
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

        if (fetchedQuestions.length > 0) {
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
      let newOptionTempId: string | undefined;
      let newOptionText: string = 'New Option'; // Default text

      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionIdOrTempId || q.tempId === questionIdOrTempId) {
            const newOrder =
              q.options.length > 0 ? Math.max(...q.options.map(o => o.order)) + 1 : 0;
            const newOptionData: SurveyOptionData = {
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
            showSuccessToast('Question order saved successfully!');
            await fetchData();
          } catch (err: any) {
            logger.error('Failed to reorder questions on server', { studyId, error: err.message });
            showErrorToast('Failed to save new question order.');
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

        // Process AI-suggested questions first
        let currentOrder = questions.length;
        const processedAiQuestions: SurveyQuestionData[] = await Promise.all(
          validation.data.map(async (aiQ: ValidatedAiQuestion) => {
            const optionsWithImages: SurveyOptionData[] = await Promise.all(
              aiQ.options.map(async (aiOpt: ValidatedAiOption, optIdx: number) => {
                let imageUrl: string | null = null;
                if (aiOpt.image_description) {
                  const MAX_GIPHY_SEARCH_TERM_LENGTH = 100; // Max length for Giphy search term
                  let searchTerm = aiOpt.image_description;
                  if (searchTerm.length > MAX_GIPHY_SEARCH_TERM_LENGTH) {
                    searchTerm = searchTerm.substring(0, MAX_GIPHY_SEARCH_TERM_LENGTH);
                    logger.warn('[Giphy] Search term truncated for Giphy API call due to length.', {
                      originalTerm: aiOpt.image_description,
                      truncatedTerm: searchTerm,
                      studyId: studyId, // Assuming studyId is accessible here for context
                    });
                  }
                  imageUrl = await fetchGifFromGiphy(searchTerm);
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
            const questionToAdd: SurveyQuestionData = {
              tempId: generateTempId(),
              id: '',
              studyId: studyId,
              text: aiQ.text,
              questionType: aiQ.type,
              order: currentOrder++,
              isRandomized: aiQ.is_randomized,
              isMandatory: aiQ.is_mandatory, // AI questions can define their own mandatory status
              kpiAssociation: aiQ.kpi_association,
              options: optionsWithImages,
            };
            return questionToAdd;
          })
        );

        // Define standard demographic questions
        const genderQuestion: SurveyQuestionData = {
          tempId: generateTempId(),
          id: '',
          studyId: studyId,
          text: 'What is your gender?',
          questionType: SurveyQuestionType.SINGLE_CHOICE,
          order: currentOrder++,
          isRandomized: false,
          isMandatory: true,
          kpiAssociation: null,
          options: [
            { tempId: generateTempId(), id: '', text: 'Male', order: 0, imageUrl: null },
            { tempId: generateTempId(), id: '', text: 'Female', order: 1, imageUrl: null },
            { tempId: generateTempId(), id: '', text: 'Other', order: 2, imageUrl: null },
            {
              tempId: generateTempId(),
              id: '',
              text: 'Prefer not to say',
              order: 3,
              imageUrl: null,
            },
          ],
        };

        const ageQuestion: SurveyQuestionData = {
          tempId: generateTempId(),
          id: '',
          studyId: studyId,
          text: 'Which age group do you belong to?',
          questionType: SurveyQuestionType.SINGLE_CHOICE,
          order: currentOrder++,
          isRandomized: false,
          isMandatory: true,
          kpiAssociation: null,
          options: [
            { tempId: generateTempId(), id: '', text: '18-24', order: 0, imageUrl: null },
            { tempId: generateTempId(), id: '', text: '25-34', order: 1, imageUrl: null },
            { tempId: generateTempId(), id: '', text: '35-44', order: 2, imageUrl: null },
            { tempId: generateTempId(), id: '', text: '45-54', order: 3, imageUrl: null },
            { tempId: generateTempId(), id: '', text: '55-64', order: 4, imageUrl: null },
            { tempId: generateTempId(), id: '', text: '65+', order: 5, imageUrl: null },
            {
              tempId: generateTempId(),
              id: '',
              text: 'Prefer not to say',
              order: 6,
              imageUrl: null,
            },
          ],
        };

        const allNewQuestions = [...processedAiQuestions, genderQuestion, ageQuestion];

        // Save all new questions (AI + demographic)
        // Ensure we don't exceed the max of 10 questions IN TOTAL (existing + new)
        if (questions.length + allNewQuestions.length > 10) {
          toast.error('Adding these suggestions would exceed the 10 question limit.');
          // Optionally, allow user to select which AI questions to add, or truncate.
          // For now, we just prevent adding if it exceeds.
        } else {
          for (const q of allNewQuestions) {
            await saveQuestion(q); // This updates local state via setQuestions in its success path
          }
          await fetchData(); // Refetch to ensure orders and IDs are fully synced, though saveQuestion updates local state
          logger.info('AI suggestions and demographic questions processed and added.', {
            count: allNewQuestions.length,
          });
        }
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
                  onToggleMandatory={handleToggleMandatory}
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
