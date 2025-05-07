export enum BrandLiftStudyStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  COLLECTING = 'COLLECTING', // Data collection in progress via Cint
  COMPLETED = 'COMPLETED', // Data collection finished, report may be pending or generated
  ARCHIVED = 'ARCHIVED',
}

export enum SurveyQuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  // TEXT_INPUT = "TEXT_INPUT", // Future consideration
  // NPS = "NPS", // Future consideration
}

export enum SurveyApprovalCommentStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  // NEED_ACTION = "NEED_ACTION", // Could be a derived state or separate field if needed
}

export enum SurveyOverallApprovalStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED', // Approved by internal team
  SIGNED_OFF = 'SIGNED_OFF', // Final sign-off, ready for data collection launch
}

export interface BrandLiftStudyData {
  id: string; // ULID
  name: string;
  campaignId: string; // Corresponds to CampaignWizardSubmission id
  status: BrandLiftStudyStatus;
  funnelStage: string; // e.g., "Top Funnel", "Mid Funnel", "Bottom Funnel"
  primaryKpi: string; // e.g., "Brand Awareness", "Ad Recall"
  secondaryKpis?: string[];
  createdAt: Date;
  updatedAt: Date;
  cintProjectId?: string | null; // ID from Cint API after project creation
  cintTargetGroupId?: string | null; // ID from Cint API after target group creation
  // Potentially: targetAudienceCriteria?: any; // To store criteria sent to Cint
}

export interface SurveyQuestionData {
  id: string; // ULID
  studyId: string; // Foreign key to BrandLiftStudyData
  text: string;
  questionType: SurveyQuestionType;
  order: number;
  isRandomized?: boolean; // Option randomization for MCQs
  isMandatory?: boolean;
  kpiAssociation?: string | null; // Link to specific KPI string
  options?: SurveyOptionData[]; // Populated for SINGLE_CHOICE, MULTIPLE_CHOICE
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyOptionData {
  id: string; // ULID
  questionId: string; // Foreign key to SurveyQuestionData
  text: string;
  imageUrl?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
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
    // textAnswer?: string; // For TEXT_INPUT type (future)
  }>;
  demographics?: Record<string, any> | null; // JSON object for demographic data from Cint (e.g., age, gender, location)
  respondedAt: Date; // Timestamp of when the response was submitted/recorded
  // completionTimeSeconds?: number; // Optional: Time taken to complete the survey
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
}

export interface SurveyApprovalCommentData {
  id: string; // ULID
  // Link to overall approval status or directly to study if comments are general
  approvalStatusId?: string | null; // FK to SurveyApprovalStatusData (if comments are tied to an approval instance)
  studyId: string; // FK to BrandLiftStudyData (if comments can be general to the study)
  questionId?: string | null; // Optional: Foreign key to SurveyQuestionData if comment is on a specific question
  authorId: string; // Clerk User ID of the commenter
  text: string;
  status: SurveyApprovalCommentStatus;
  createdAt: Date;
  updatedAt: Date;
  // resolutionNote?: string | null;
}

export interface SurveyApprovalStatusData {
  id: string; // ULID, typically one per BrandLiftStudy
  studyId: string; // Foreign key to BrandLiftStudyData (unique)
  status: SurveyOverallApprovalStatus;
  requestedSignOff: boolean; // True if formal sign-off has been requested
  signedOffBy?: string | null; // Clerk User ID of the final approver
  signedOffAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
