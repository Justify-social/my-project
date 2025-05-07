// TODO: Replace with actual type definitions based on OpenAPI spec and Cint documentation
// These are simplified placeholders for now.
type CintOAuthToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type CintProject = {
  id: string; // 01GV070G3SJECZAGE3Q3J6FV56
  name: string;
  project_manager_id: string;
  // ... other project fields
};

type CintProjectInput = {
  name: string; // "Test Project"
  project_manager_id: string; // "<YourPMID>"
};

type CintTargetGroupInput = {
  name: string;
  business_unit_id: string; // or number depending on actual type
  project_manager_id: string;
  study_type_code: string; // "adhoc"
  industry_code: string; // "other"
  locale: string; // "eng_us"
  collects_pii: boolean;
  filling_goal: number;
  expected_length_of_interview_minutes: number;
  expected_incidence_rate: number; // 0.0 to 1.0
  fielding_specification: {
    start_at: string; // ISO 8601 date-time
    end_at: string; // ISO 8601 date-time
  };
  cost_per_interview?: {
    // Optional for rate_card, required for dynamic?
    value: string;
    currency_code: string;
  };
  live_url: string; // "https://mytestsurvey.com/?RID=[%RID%]"
  test_url: string; // "https://mytestsurvey.com/?RID=[%RID%]"
  pricing_model?: string; // "dynamic" or "rate_card"
  fielding_assistant_assignment?: any; // Define further based on spec
  profile?: any; // Define further based on spec (complex object)
  // ... other target group fields
};

type CintTargetGroup = CintTargetGroupInput & {
  id: string; // 01BX5ZZKBKACTAV9WEVGEMMVS1
  status: string; // "draft", "live", "paused", "completed"
  // ... other fields from GET response
};

type CintTargetGroupOverview = {
  id: string;
  name: string;
  status: string;
  statistics: {
    filling_goal: number;
    current_completes: number;
    current_prescreens: number;
    incidence_rate_median: number;
    length_of_interview_median_seconds: number;
    conversion_rate_average: number;
    drop_off_rate_average: number;
  };
  // ... other overview fields
};

type CintLaunchFieldingRunResponse = {
  // Based on 204 No Content, but job ID is in location header
  job_id: string; // Extracted from location header
};

type CintS2SValidateResponse = {
  id: string; // respondent RID
  status: number; // 1 for "In Survey/Drop"
  links: Array<{ href: string }>;
};

type CintS2SUpdateStatusBody = {
  id: string; // respondent RID
  status: number; // 5 for Complete, 2 for Terminate, 3 for Overquota, 4 for Quality Terminate
};

import { logger } from './logger';
import { BrandLiftStudyData } from '@/types/brand-lift';
import { v4 as uuidv4 } from 'uuid';

// Helper for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CINT_API_BASE_URL = 'https://api.cint.com/v1/demand'; // As per OpenAPI
const CINT_AUTH_URL = 'https://auth.lucidhq.com/oauth/token'; // As per guide
const CINT_S2S_API_URL = 'https://s2s.cint.com/fulfillment'; // As per guide

/**
 * Service class for interacting with the Cint Lucid Exchange API.
 * This initial version uses mock data and console logging for API calls.
 *
 * Key operations (based on brand lift plan.md and Cint docs):
 * - Authentication (OAuth JWT)
 * - Project Creation
 * - Target Group Creation & Configuration
 * - Launching Target Group (Fielding Run)
 * - Response Collection (S2S)
 * - Status/Progress
 */
export class CintApiService {
  private authToken: string | null = null;
  private tokenExpiry: number | null = null;
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private s2sApiKey: string;
  private mockEnabled: boolean;

  constructor(clientId?: string, clientSecret?: string, accountId?: string, s2sApiKey?: string) {
    this.clientId = clientId || process.env.CINT_CLIENT_ID!;
    this.clientSecret = clientSecret || process.env.CINT_CLIENT_SECRET!;
    this.accountId = accountId || process.env.CINT_ACCOUNT_ID!;
    this.s2sApiKey = s2sApiKey || process.env.CINT_S2S_API_KEY!;
    this.mockEnabled = process.env.CINT_API_MOCK_ENABLED === 'true';

    if (
      !this.mockEnabled &&
      (!this.clientId || !this.clientSecret || !this.accountId || !this.s2sApiKey)
    ) {
      const message =
        'Cint API credentials or Account ID are not configured in environment variables. Live mode will fail.';
      logger.error(message, {
        clientIdExists: !!this.clientId,
        clientSecretExists: !!this.clientSecret,
        accountIdExists: !!this.accountId,
        s2sApiKeyExists: !!this.s2sApiKey,
      });
      // Depending on strictness, could throw new Error(message) here to prevent startup.
    }
    logger.info(`CintApiService initialized. Mock mode: ${this.mockEnabled}`);
  }

  private async _fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    attempt = 1
  ): Promise<Response> {
    try {
      logger.debug(
        `[CintAPI] Fetching (Attempt ${attempt}/${retries}): ${options.method || 'GET'} ${url}`
      );
      const response = await fetch(url, options);
      if (!response.ok) {
        // For 429 (Too Many Requests) or 5xx server errors, retry if attempts remain
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2 ** attempt * 1000; // Exponential backoff
          logger.warn(
            `[CintAPI] Request failed with status ${response.status}. Retrying in ${waitTime}ms...`,
            { url, attempt }
          );
          await delay(waitTime);
          return this._fetchWithRetry(url, options, retries, attempt + 1);
        }
        // For other client errors (4xx) or if retries exhausted, throw an error to be handled by the caller
        let errorBody;
        try {
          errorBody = await response.json();
        } catch (e) {
          errorBody = { message: (await response.text()) || response.statusText };
        }
        logger.error('[CintAPI] Request failed after all retries or with client error', {
          url,
          status: response.status,
          attempt,
          errorBody,
        });
        const err = new Error(
          `Cint API Error: ${response.status} ${response.statusText} - ${errorBody?.error?.message || errorBody?.message}`
        );
        (err as any).status = response.status;
        (err as any).errorBody = errorBody;
        throw err;
      }
      return response;
    } catch (error: any) {
      // Network errors or errors from _fetchWithRetry logic itself
      if (
        attempt < retries &&
        !(
          error instanceof Error &&
          (error as any).status &&
          (error as any).status < 500 &&
          (error as any).status !== 429
        )
      ) {
        const waitTime = 2 ** attempt * 1000;
        logger.warn(`[CintAPI] Network/other error for ${url}. Retrying in ${waitTime}ms...`, {
          url,
          attempt,
          error: error.message,
        });
        await delay(waitTime);
        return this._fetchWithRetry(url, options, retries, attempt + 1);
      }
      logger.error('[CintAPI] Fetch failed after all retries or with non-retryable error', {
        url,
        error: error.message,
      });
      throw error; // Re-throw if all retries fail or it's a non-retryable client error (e.g. 400, 401, 403)
    }
  }

  async authenticate(): Promise<CintOAuthToken> {
    if (this.mockEnabled) {
      logger.info('[CintApiService] Authenticate (mock)');
      this.authToken = 'mock_jwt_token';
      this.tokenExpiry = Date.now() + (3600 - 300) * 1000;
      return { access_token: this.authToken, expires_in: 3600, token_type: 'Bearer' };
    }

    logger.info('[CintApiService] Authenticating with Cint...');
    const requestBody = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      lucid_scopes: 'app:api',
      audience: 'https://api.luc.id',
    };
    try {
      const response = await this._fetchWithRetry(
        CINT_AUTH_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
        3
      ); // Auth retries might be less aggressive or not needed.

      const tokenData: CintOAuthToken = await response.json();
      this.authToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000; // Refresh 5 mins before expiry
      logger.info('[CintApiService] Cint authentication successful. Token acquired.');
      return tokenData;
    } catch (error: any) {
      logger.error('[CintApiService] Cint authentication failed.', {
        error: error.message,
        status: error.status,
        body: error.errorBody,
      });
      this.authToken = null;
      this.tokenExpiry = null;
      throw new Error(`Cint Authentication Failed: ${error.message}`);
    }
  }

  private async getAuthHeaders(): Promise<{
    Authorization: string;
    'Cint-API-Version': string;
    'Content-Type': string;
  }> {
    if (!this.authToken || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
      await this.authenticate();
    }
    if (!this.authToken) {
      throw new Error('Cint authentication token not available. Call authenticate() first.');
    }
    return {
      Authorization: `Bearer ${this.authToken}`,
      'Cint-API-Version': '2025-02-17',
      'Content-Type': 'application/json',
    };
  }

  async createCintProject(studyName: string, projectManagerId: string): Promise<CintProject> {
    if (this.mockEnabled) {
      logger.info('[CintApiService] Creating Cint Project (mock)', {
        accountId: this.accountId,
        studyName,
      });
      const mockId = `proj_mock_${Date.now()}`;
      return { id: mockId, name: studyName, project_manager_id: projectManagerId };
    }

    const headers = await this.getAuthHeaders();
    const idempotencyKey = uuidv4();
    const projectInput: CintProjectInput = {
      name: studyName.substring(0, 255),
      project_manager_id: projectManagerId,
    };

    logger.info('[CintApiService] Creating Cint Project (live)', {
      accountId: this.accountId,
      projectInput,
    });
    try {
      const response = await this._fetchWithRetry(
        `${CINT_API_BASE_URL}/accounts/${this.accountId}/projects`,
        {
          method: 'POST',
          headers: { ...headers, 'idempotency-key': idempotencyKey },
          body: JSON.stringify(projectInput),
        }
      );
      const projectData: CintProject = await response.json();
      logger.info('[CintApiService] Cint Project created successfully (live)', {
        projectId: projectData.id,
      });
      return projectData;
    } catch (error: any) {
      logger.error('[CintApiService] Failed to create Cint Project (live)', {
        error: error.message,
        studyName,
      });
      throw error; // Re-throw to be handled by the calling API route
    }
  }

  /**
   * Creates a new target group within a project.
   * Corresponds to: POST /demand/accounts/{account_id}/projects/{project_id}/target-groups
   * @param cintProjectId The ID of the Cint Project created in the previous step.
   * @param study Our internal BrandLiftStudyData, used to derive Target Group parameters.
   * @param surveyLiveUrl The live URL for respondents to take our survey.
   * @param projectManagerId Cint Project Manager ID.
   * @param businessUnitId Cint Business Unit ID.
   */
  async createCintTargetGroup(
    cintProjectId: string,
    study: BrandLiftStudyData,
    surveyLiveUrl: string,
    projectManagerId: string,
    businessUnitId: string
  ): Promise<CintTargetGroup> {
    if (this.mockEnabled) {
      logger.info('[CintApiService] Creating Cint Target Group (mock)', {
        cintProjectId,
        studyId: study.id,
      });
      const mockTgId = `tg_mock_${Date.now()}`;
      const mockTgInput: CintTargetGroupInput = {
        name: `${study.name} - Target Group`.substring(0, 255),
        business_unit_id: businessUnitId,
        project_manager_id: projectManagerId,
        study_type_code: 'adhoc',
        industry_code: 'other',
        locale: 'eng_us',
        collects_pii: false,
        filling_goal: 1000, // Placeholder
        expected_length_of_interview_minutes: 10, // Placeholder
        expected_incidence_rate: 0.5, // Placeholder
        fielding_specification: {
          start_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        live_url: surveyLiveUrl.replace('{studyId}', study.id),
        test_url: surveyLiveUrl.replace('{studyId}', study.id).replace('live', 'test'),
        profile: {},
      };
      return { ...mockTgInput, id: mockTgId, status: 'draft' };
    }

    const headers = await this.getAuthHeaders();
    const idempotencyKey = uuidv4();

    // TODO: Deep dive into mapping study.audience, demographics from CampaignWizardSubmission, etc. to Cint's `profile` object.
    // This is a complex part of P4-02.1. For now, an empty or minimal profile.
    const cintProfileObject = {
      // Example: if (study.targetAge) { conditions for age... }
      // This requires a mapping from our audience definition to Cint's question IDs and condition formats.
      // Consult cint-exchange-openapi.yaml#components.schemas.TargetGroupProfileInput for structure.
    };

    // TODO: Get these values from the study data or campaign settings
    const studyFillingGoal = (study as any).targetCompletes || 1000; // Placeholder
    const studyLOI = (study as any).estimatedLOI || 10; // Placeholder
    const studyIR = (study as any).estimatedIR || 0.5; // Placeholder
    const studyLocale = (study as any).locale || 'eng_us'; // Placeholder, derive from campaign
    const studyCollectsPii = (study as any).collectsPii || false;
    // Default start/end times, should be configurable or based on campaign flight dates
    const defaultStartDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
    const defaultEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const targetGroupInput: CintTargetGroupInput = {
      name: `${study.name} - Target Group`.substring(0, 255),
      business_unit_id: businessUnitId,
      project_manager_id: projectManagerId,
      study_type_code: 'adhoc',
      industry_code: 'other', // Or map from campaign if available
      locale: studyLocale,
      collects_pii: studyCollectsPii,
      filling_goal: studyFillingGoal,
      expected_length_of_interview_minutes: studyLOI,
      expected_incidence_rate: studyIR,
      fielding_specification: {
        start_at: (study as any).startDate?.toISOString() || defaultStartDate.toISOString(),
        end_at: (study as any).endDate?.toISOString() || defaultEndDate.toISOString(),
      },
      live_url: surveyLiveUrl.replace('{studyId}', study.id),
      test_url: surveyLiveUrl.replace('{studyId}', study.id).replace('live', 'test'), // Basic assumption
      // pricing_model and cost_per_interview depend on account setup with Cint
      // pricing_model: 'dynamic',
      // cost_per_interview: { value: '1.50', currency_code: 'USD' }, // Example
      profile: cintProfileObject,
    };

    logger.info('[CintApiService] Creating Cint Target Group (live)', {
      accountId: this.accountId,
      cintProjectId,
      name: targetGroupInput.name,
    });
    try {
      const response = await this._fetchWithRetry(
        `${CINT_API_BASE_URL}/accounts/${this.accountId}/projects/${cintProjectId}/target-groups`,
        {
          method: 'POST',
          headers: { ...headers, 'idempotency-key': idempotencyKey },
          body: JSON.stringify(targetGroupInput),
        }
      );
      const tgData: CintTargetGroup = await response.json(); // Assuming Cint returns the created TG object
      logger.info('[CintApiService] Cint Target Group created successfully (live)', {
        targetGroupId: tgData.id,
      });
      return tgData; // Should include id and status: 'draft' from Cint
    } catch (error: any) {
      logger.error('[CintApiService] Failed to create Cint Target Group (live)', {
        error: error.message,
        cintProjectId,
        studyId: study.id,
      });
      throw error;
    }
  }

  /**
   * Launches a target group from draft status.
   * Corresponds to: POST .../target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft
   * @param endFieldingAt ISO 8601 date-time string for when fielding should end.
   */
  async launchCintTargetGroup(
    cintProjectId: string,
    cintTargetGroupId: string,
    endFieldingAt: string
  ): Promise<CintLaunchFieldingRunResponse> {
    if (this.mockEnabled) {
      logger.info('[CintApiService] Launching Cint Target Group (mock)', {
        cintProjectId,
        cintTargetGroupId,
      });
      return { job_id: `job_launch_mock_${Date.now()}` };
    }

    const headers = await this.getAuthHeaders();
    const idempotencyKey = uuidv4();
    const requestBody = { end_fielding_at: endFieldingAt };

    logger.info('[CintApiService] Launching Cint Target Group (live)', {
      accountId: this.accountId,
      cintProjectId,
      cintTargetGroupId,
      requestBody,
    });
    try {
      const response = await this._fetchWithRetry(
        `${CINT_API_BASE_URL}/accounts/${this.accountId}/projects/${cintProjectId}/target-groups/${cintTargetGroupId}/fielding-run-jobs/launch-from-draft`,
        {
          method: 'POST',
          headers: { ...headers, 'idempotency-key': idempotencyKey },
          body: JSON.stringify(requestBody),
        }
      );

      // According to Cint docs, a successful launch might be 201, 202, or 204.
      // If 201/202, a job ID might be in the Location header or response body.
      // If 204, it means launched directly.
      // This mock structure assumes a job_id is somehow made available for simplicity of return type.
      // Real implementation needs to handle these different success statuses and header parsing.
      let jobId = `job_launch_${Date.now()}`; // Default if no specific ID found
      const locationHeader = response.headers.get('Location');
      if (locationHeader) {
        const parts = locationHeader.split('/');
        jobId = parts[parts.length - 1];
      } else if (response.status === 202) {
        try {
          const responseBody = await response.json();
          jobId = responseBody.job_id || responseBody.id || jobId; // Try to find job_id in body
        } catch (e) {
          /* Ignore if body is not JSON or job_id not present */
        }
      }

      logger.info('[CintApiService] Cint Target Group launch initiated/completed (live)', {
        targetGroupId: cintTargetGroupId,
        jobId,
        status: response.status,
      });
      return { job_id: jobId };
    } catch (error: any) {
      logger.error('[CintApiService] Failed to launch Cint Target Group (live)', {
        error: error.message,
        cintTargetGroupId,
      });
      throw error;
    }
  }

  /**
   * Gets an overview of a specific target group.
   * Corresponds to: GET /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/overview
   */
  async getTargetGroupOverview(
    cintProjectId: string, // Corrected: Cint Project ID
    cintTargetGroupId: string
  ): Promise<CintTargetGroupOverview> {
    if (this.mockEnabled) {
      logger.info('[CintApiService] Getting Target Group Overview (mock)', {
        cintProjectId,
        cintTargetGroupId,
      });
      return {
        id: cintTargetGroupId,
        name: 'Mock Target Group Overview',
        status: 'live',
        statistics: {
          filling_goal: 1000,
          current_completes: Math.floor(Math.random() * 500),
          current_prescreens: Math.floor(Math.random() * 1000),
          incidence_rate_median: 0.5,
          length_of_interview_median_seconds: 600,
          conversion_rate_average: 0.75,
          drop_off_rate_average: 0.1,
        },
      };
    }
    const headers = await this.getAuthHeaders();
    logger.info('[CintApiService] Getting Target Group Overview (live)', {
      accountId: this.accountId,
      cintProjectId,
      cintTargetGroupId,
    });
    try {
      const response = await this._fetchWithRetry(
        `${CINT_API_BASE_URL}/accounts/${this.accountId}/projects/${cintProjectId}/target-groups/${cintTargetGroupId}/overview`,
        { method: 'GET', headers: headers }
      );
      const overviewData: CintTargetGroupOverview = await response.json();
      logger.info('[CintApiService] Successfully fetched Target Group Overview (live)', {
        targetGroupId: cintTargetGroupId,
      });
      return overviewData;
    } catch (error: any) {
      logger.error('[CintApiService] Failed to fetch Target Group Overview (live)', {
        error: error.message,
        cintTargetGroupId,
      });
      throw error;
    }
  }

  // --- S2S Respondent Flow Methods (as per cint-exchange-guide.md) ---

  /**
   * S2S: Validates a respondent attempting to enter a survey.
   * Corresponds to: GET https://s2s.cint.com/fulfillment/respondents/[%RID%]
   * Requires a separate S2S API Key for Basic Auth, not JWT.
   */
  async s2sValidateRespondent(respondentId: string): Promise<CintS2SValidateResponse> {
    const s2sKey = this.s2sApiKey;
    if (!s2sKey && !this.mockEnabled)
      throw new Error('Cint S2S API Key not configured for live mode.');

    if (this.mockEnabled) {
      logger.info('[CintApiService] S2S Validate Respondent (mock)', { respondentId });
      return {
        id: respondentId,
        status: 1,
        links: [{ href: `https://survey.example.com/s?rid=${respondentId}&mock=true` }],
      };
    }

    const authHeader = `Basic ${Buffer.from(s2sKey + ':').toString('base64')}`;
    logger.info('[CintApiService] S2S Validate Respondent (live)', { respondentId });
    try {
      const response = await this._fetchWithRetry(
        `${CINT_S2S_API_URL}/respondents/${respondentId}`,
        { method: 'GET', headers: { Authorization: authHeader } }
      );
      const validationData: CintS2SValidateResponse = await response.json();
      logger.info('[CintApiService] S2S Respondent Validation successful (live)', {
        respondentId,
        status: validationData.status,
      });
      return validationData;
    } catch (error: any) {
      logger.error('[CintApiService] S2S Respondent Validation failed (live)', {
        error: error.message,
        respondentId,
      });
      throw error;
    }
  }

  /**
   * S2S: Updates a respondent's status (e.g., Complete, Terminate).
   * Corresponds to: POST https://s2s.cint.com/fulfillment/respondents/transition
   * Requires a separate S2S API Key for Basic Auth.
   */
  async s2sUpdateRespondentStatus(
    statusBody: CintS2SUpdateStatusBody
  ): Promise<{ success: boolean; message?: string }> {
    const s2sKey = this.s2sApiKey;
    if (!s2sKey && !this.mockEnabled)
      throw new Error('Cint S2S API Key not configured for live mode.');

    if (this.mockEnabled) {
      logger.info('[CintApiService] S2S Update Respondent Status (mock)', { statusBody });
      return { success: true, message: 'Status updated (mock)' };
    }

    const authHeader = `Basic ${Buffer.from(s2sKey + ':').toString('base64')}`;
    logger.info('[CintApiService] S2S Update Respondent Status (live)', { statusBody });
    try {
      const response = await this._fetchWithRetry(`${CINT_S2S_API_URL}/respondents/transition`, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(statusBody),
      });
      // Cint S2S transition typically returns 200 OK with no significant body or just a success message.
      // We will assume a successful status code means success.
      logger.info('[CintApiService] S2S Respondent Status Update successful (live)', {
        respondentId: statusBody.id,
        newStatus: statusBody.status,
      });
      return { success: true, message: (await response.text()) || 'Status updated' };
    } catch (error: any) {
      logger.error('[CintApiService] S2S Respondent Status Update failed (live)', {
        error: error.message,
        statusBody,
      });
      throw error;
    }
  }

  // --- Placeholder for other methods as needed ---
  // e.g., getSurveyStatus, fetchResponses (if not webhook based), manage quotas etc.

  // Example mock request payloads:
  static getMockProjectInput(): CintProjectInput {
    return {
      name: 'Q4 Brand Awareness Study - Mock',
      project_manager_id: 'pm_mock_123', // Replace with a valid Project Manager ID from your Cint account for testing
    };
  }

  static getMockTargetGroupInput(): CintTargetGroupInput {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // End in 7 days

    return {
      name: 'US GenPop 18-65 - Mock',
      business_unit_id: 'bu_mock_456', // Replace with a valid BU ID
      project_manager_id: 'pm_mock_123',
      study_type_code: 'adhoc',
      industry_code: 'other',
      locale: 'eng_us',
      collects_pii: false,
      filling_goal: 500,
      expected_length_of_interview_minutes: 15,
      expected_incidence_rate: 0.6,
      fielding_specification: {
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
      },
      cost_per_interview: {
        // Example for dynamic pricing
        value: '2.50',
        currency_code: 'USD',
      },
      live_url: 'https://survey.example.com/live?rid=[%RID%]&var1=val1', // Ensure placeholders are correct
      test_url: 'https://survey.example.com/test?rid=[%RID%]&var1=val1',
      pricing_model: 'dynamic',
      // Profile and Fielding Assistant would be complex objects defined as per Cint specs
      profile: {
        /* ... detailed profile JSON ... */
      },
      fielding_assistant_assignment: {
        /* ... fielding assistant JSON ... */
      },
    };
  }
}

// Example Usage (illustrative, not for direct execution without setup):
/*
async function testCintService() {
    // IMPORTANT: Replace with your actual or sandbox credentials and account ID
    const CLIENT_ID = process.env.CINT_CLIENT_ID || "YOUR_CINT_CLIENT_ID";
    const CLIENT_SECRET = process.env.CINT_CLIENT_SECRET || "YOUR_CINT_CLIENT_SECRET";
    const CINT_ACCOUNT_ID = process.env.CINT_ACCOUNT_ID || "YOUR_CINT_ACCOUNT_ID";
    const S2S_API_KEY = process.env.CINT_S2S_API_KEY || "YOUR_S2S_API_KEY";


    if (CLIENT_ID === "YOUR_CINT_CLIENT_ID" || CLIENT_SECRET === "YOUR_CINT_CLIENT_SECRET" || CINT_ACCOUNT_ID === "YOUR_CINT_ACCOUNT_ID") {
        console.warn("Please configure actual Cint credentials in environment variables for meaningful testing.");
        // return;
    }

    const cintService = new CintApiService(CLIENT_ID, CLIENT_SECRET, CINT_ACCOUNT_ID, S2S_API_KEY);

    try {
        // 1. Authenticate (implicitly called by other methods, or explicitly)
        // await cintService.authenticate();
        // console.log("Authenticated with Cint.");

        // 2. Create a Project
        const projectInput = CintApiService.getMockProjectInput();
        const project = await cintService.createProject(projectInput);
        console.log("Project Created (mock):", project);

        if (project.id) {
            // 3. Create a Target Group
            const tgInput = CintApiService.getMockTargetGroupInput();
            const targetGroup = await cintService.createTargetGroup(project.id, tgInput);
            console.log("Target Group Created (mock):", targetGroup);

            if (targetGroup.id && targetGroup.status === "draft") {
                // 4. Launch the Target Group
                const launchResponse = await cintService.launchTargetGroup(project.id, targetGroup.id, targetGroup.fielding_specification.end_at);
                console.log("Target Group Launch initiated (mock):", launchResponse);

                // 5. Get Target Group Overview (simulate some time passing)
                // In a real scenario, you'd poll the job status from launchTargetGroup first, then get overview.
                // For mock, we assume it's live.
                // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                const overview = await cintService.getTargetGroupOverview(project.id, targetGroup.id);
                console.log("Target Group Overview (mock):", overview);
            }

            // 6. Simulate S2S respondent flow
            const mockRespondentId = "s2s_resp_mock_789";
            const s2sValidation = await cintService.s2sValidateRespondent(mockRespondentId);
            console.log("S2S Respondent Validation (mock):", s2sValidation);

            if (s2sValidation.status === 1) { // If "In Survey/Drop"
                const updateStatusBody: CintS2SUpdateStatusBody = { id: mockRespondentId, status: 5 }; // 5 = Complete
                const s2sUpdate = await cintService.s2sUpdateRespondentStatus(updateStatusBody);
                console.log("S2S Respondent Status Update (mock):", s2sUpdate);
            }
        }
    } catch (error) {
        console.error("Error in Cint service test:", error);
    }
}

// testCintService(); // Uncomment to run example if .env variables are set up
*/
