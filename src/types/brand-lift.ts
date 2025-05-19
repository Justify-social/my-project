import {
  BrandLiftStudyStatus,
  SurveyQuestionType,
  SurveyApprovalCommentStatus,
  SurveyOverallApprovalStatus,
} from '@prisma/client'; // Import enums from Prisma client

// Re-export the enums so they can be imported from this file
export {
  BrandLiftStudyStatus,
  SurveyQuestionType,
  SurveyApprovalCommentStatus,
  SurveyOverallApprovalStatus,
};

export interface BrandLiftStudyData {
  id: string; // ULID
  name: string;
  campaignId: string; // Corresponds to CampaignWizardSubmission id
  status: BrandLiftStudyStatus; // Now uses Prisma enum
  funnelStage: string; // e.g., "Top Funnel", "Mid Funnel", "Bottom Funnel"
  primaryKpi: string; // e.g., "Brand Awareness", "Ad Recall"
  secondaryKpis?: string[];
  createdAt: Date;
  updatedAt: Date;
  cintProjectId?: string | null; // ID from Cint API after project creation
  cintTargetGroupId?: string | null; // ID from Cint API after target group creation
  // Potentially: targetAudienceCriteria?: any; // To store criteria sent to Cint
  campaign?: {
    campaignName?: string | null;
    primaryCreativeUrl?: string | null;
    primaryCreativeType?: string | null;
  };
  questions?: SurveyQuestionData[]; // Optional on base study, loaded separately
  approvalStatus?: SurveyApprovalStatusData | null; // Optional, loaded separately
}

export interface SurveyQuestionData {
  id: string; // ULID
  tempId?: string; // For frontend state management before saving
  studyId: string; // Foreign key to BrandLiftStudyData
  text: string;
  questionType: SurveyQuestionType; // Now uses Prisma enum
  order: number;
  isRandomized?: boolean | null; // Option randomization for MCQs
  isMandatory?: boolean | null;
  kpiAssociation?: string | null; // Link to specific KPI string
  createdAt?: Date; // Optional as it's set by DB
  updatedAt?: Date; // Optional as it's set by DB
  options: SurveyOptionData[];
}

export interface SurveyOptionData {
  id: string; // ULID
  tempId?: string; // For frontend state management before saving
  questionId?: string; // Will be present if option belongs to an existing question
  text: string;
  imageUrl?: string | null;
  order: number;
  createdAt?: Date; // Optional
  updatedAt?: Date; // Optional
}

export interface SurveyResponseData {
  id: string; // ULID
  studyId: string; // Foreign key to BrandLiftStudyData
  respondentId: string; // Unique ID for the respondent (e.g., from Cint)
  cintResponseId?: string | null; // Specific response/session ID from Cint, if available
  isControlGroup: boolean; // Flag indicating if the respondent was in the control group
  answers: Array<{
    // Array to handle multi-select and store answers for each question responded to
    questionId: string;
    optionIds?: string[]; // For MULTIPLE_CHOICE, SINGLE_CHOICE (will have one item)
    textAnswer?: string | null; // For potential open-ended in future
  }>;
  demographics?: Record<string, any> | null; // JSON object for demographic data from Cint (e.g., age, gender, location)
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BrandLiftReportData {
  id: string; // ULID
  studyId: string; // Foreign key to BrandLiftStudyData
  generatedAt: Date;
  // Metrics will be a structured JSON object. Define more granularly as reporting logic solidifies.
  metrics: {
    overallLift?: number;
    kpiLifts?: Array<{
      kpi: string;
      lift: number;
      exposedValue: number;
      controlValue: number;
      pValue?: number | null;
    }>;
    funnelData?: {
      control: Record<string, number>; // e.g. { awareness: 50, consideration: 30, intent: 10 }
      exposed: Record<string, number>; // e.g. { awareness: 70, consideration: 45, intent: 20 }
    };
    demographicBreakdowns?: Array<{
      segmentType: string; // e.g., "Age", "Gender"
      segmentValue: string; // e.g., "18-24", "Female"
      kpi: string;
      lift: number;
      exposedValue: number;
      controlValue: number;
    }>;
    // wordCloudData?: Array<{ text: string; value: number }>; // Explicitly out of scope for MVP as per plan
  } | null;
  recommendations?: string[];
  status: 'PENDING' | 'GENERATED' | 'ERROR';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SurveyApprovalCommentData {
  id: string; // ULID
  approvalStatusId: string; // Link to SurveyApprovalStatus
  questionId?: string | null;
  authorId: string; // Clerk User ID
  authorName?: string; // For display, if fetched
  authorAvatarUrl?: string; // For display
  text: string;
  status: SurveyApprovalCommentStatus; // Now uses Prisma enum
  createdAt: Date;
  updatedAt?: Date;
  resolutionNote?: string | null;
}

export interface SurveyApprovalStatusData {
  id: string; // ULID, typically one per BrandLiftStudy
  studyId: string; // Foreign key to BrandLiftStudyData (unique)
  status: SurveyOverallApprovalStatus; // Now uses Prisma enum
  requestedSignOff: boolean; // True if formal sign-off has been requested
  signedOffBy?: string | null; // Clerk User ID of the final approver
  signedOffAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comments?: SurveyApprovalCommentData[]; // Optional, loaded separately
}

// Utility type for questions with options during creation if needed
export type SurveyQuestionWithOptionInput = Omit<
  SurveyQuestionData,
  'id' | 'createdAt' | 'updatedAt' | 'studyId'
> & {
  options: Array<Omit<SurveyOptionData, 'id' | 'createdAt' | 'updatedAt' | 'questionId'>>;
};
