openapi: 3.0.3
info:
description: Demand contracts
title: Demand API
version: '2024-12-02T00:00:00Z'
servers:

- description: Production server
  url: https://api.cint.com/v1
  tags:
- description: Cint Exchange API, that supports a full lifecycle of creation, management and post-fielding workflows to allow for diverse experiences and automations to be built.
  name: Demand
- description: Create, list and update projects.
  name: Projects
- description: Create, update, list and other operations on Target Groups.
  name: Target Groups
- description: Obtain Target Group feasibility either by providing Target Group ID or details.
  name: Feasibility
- description: Create, update and obtain Target Group Fielding runs and Fielding Assistant assignments.
  name: Fielding
- description: Asynchronously update Target Group Fielding Runs in batches.
  name: Fielding (Batch)
- description: Validate, Submit and check reconciliations for one or more target groups. When buyers review their responses, they may find some are poor quality. e.g. respondent simply went through the survey and selected one particular answer option for all the questions (Straight Liner). A buyer may wish to change such sessions from Complete to Terminated or vice versa. Sessions from more than one Target Group can be combined in a single request and the buyer will need to provide Target Group ID, RID (Response ID) and reason code. Acceptable reason codes are mentioned in the Cint Reconciliation Policy. There are no limits to the number or type of changes to sessions that are within their reconciliation window.
  name: Reconciliations
- description: 'Aggregate reports that roll statistics up on an <i>Account</i>, <i>Business Unit</i>, <i>Project</i> and <i>Target Group</i> level. The API generates reports in CSV format(except for Termination detailsreport) and can be filtered by different types(Business Units, Projects or Target Groups). You can specify multiple identifiers to filter by in a single report generation request, so long as they are all of same filter type. Each report type has restriction on the filters they support. Follow the table under `Generate report` endpoint for available options. <p>A report request can cover up to <b>six months</b> in duration in single request and return data from within the <b>last 12 months</b>.</p> <p>Reporting data is near real time but should not be used for live management of Target Groups within the Exchange as <b>latency cannot be guaranteed</b>.</p> <p>You will need one of the following roles to access this API: <br />- Buyer Admin (`buy_admin`) <br />- Buyer Manager (`buy_mgr`)</p>'
  name: Reports
- description: Create, update, list and delete Target Group Profiling.
  name: Profiling
- description: Create, manage and reuse audience descriptions and templates to allow for efficient and automated targeting workflows on the Cint Exchange.
  name: Profiling Templates
- description: A set of APIs to help you select the best times for launching your target groups.
  name: Intelligent Calendar
- description: Create, update, list alocation for for a targetgroup not account.
  name: Allocations
- description: Create, update, list alocation template.
  name: Allocation Templates
- description: Operations for Platform.
  name: Platform
- description: Platform-wide definitions endpoints.
  name: Definitions
- description: Endpoints for managing Accounts-related resources, such as users.
  name: Accounts
- description: Endpoints for managing your Notifications Webhooks.
  name: Notifications Webhooks
  paths:
  /accounts:
  parameters: - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Accounts
      summary: Returns a list of all accounts which a user is authorized to access.
      operationId: get_user_accounts
      description: |
        Returns a list of all accounts which a user is authorized to access.
      responses:
        '200':
          description: Successfully returned list of accounts.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AccountsList'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/business-units:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of business units available on the account.
      operationId: get_business_units
      description: |
        Lists available account business units. Business unit definitions are supposed to help you 
        organize surveys between different parts of your organization. They also determine the currency
        used by their assigned surveys.
      responses:
        '200':
          description: Successfully returned account business units.
          content:
            application/json:
              schema:
                type: object
                properties:
                  business_units:
                    type: array
                    description: A list of business units.
                    items:
                      $ref: '#/components/schemas/BusinessUnit'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/clients:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of clients assigned to an account.
      operationId: get_clients
      description: Lists available clients that have been created on the specified account.
      responses:
        '200':
          description: Successfully returned account clients.
          content:
            application/json:
              schema:
                type: object
                properties:
                  clients:
                    type: array
                    description: A list of clients.
                    items:
                      $ref: '#/components/schemas/ClientListItem'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/service-clients:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/UserType'
    get:
      tags:
        - Accounts
      summary: Returns all service clients for an account.
      operationId: get_account_service_clients
      description: Lists all available service clients for an account.
      responses:
        '200':
          description: Successfully returned a list of all service clients for an account.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServiceClientsList'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/users:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/UserType'
    get:
      tags:
        - Accounts
      summary: Returns all users for an account.
      operationId: get_account_users
      description: Lists all available users for an account.
      responses:
        '200':
          description: Successfully returned a list of all users for an account.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UsersList'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/users/{user_id}/business-units:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/UserID'
    get:
      tags:
        - Accounts
      summary: Returns business unit ID for user's account.
      operationId: get_user_account_business_unit_id
      description: Returns the business unit ID associated with the specified user's account.
      responses:
        '200':
          description: Successfully returned the business unit ID associated with  the user's account.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserAccountBusinessUnit'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/webhooks:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Notifications Webhooks
      summary: Returns a list of all webhooks for an account.
      operationId: get_webhooks
      description: Lists all available webhooks for an account.
      parameters:
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/EndBefore'
      responses:
        '200':
          description: Successfully returned a list of all webhooks for an account.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebhooksList'
              example:
                webhooks:
                  - id: e8e705b9-ef5a-437c-873a-4f49a679f802
                    url: https://example.com/webhook
                    event: survey_completed
                  - id: 3fda1b8d-bf76-4f38-bddb-8734cbec553f
                    url: https://example.com/webhook
                    event: survey_paused
                next_cursor: fee5d640-463d-4013-b042-c26c05685cbc
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      tags:
        - Notifications Webhooks
      summary: Creates a new webhook for an account.
      operationId: create_webhook
      description: Creates a new webhook for an account.
      requestBody:
        $ref: '#/components/requestBodies/WebhookCreate'
      responses:
        '201':
          description: Successfully created a new webhook.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebhookCreated'
              example:
                id: e8e705b9-ef5a-437c-873a-4f49a679f802
                url: https://example.com/survey_completed_webhook
                events:
                  - survey_completed
                secret: FP7UPZpATKBcYJj4va95PYud+a3gCidRERiLO+9MoFE=
                created_at: '2023-01-01T23:00:00.000Z'
                updated_at: '2023-01-01T23:00:00.000Z'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/webhooks/{webhook_id}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/WebhookID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Notifications Webhooks
      summary: Returns a webhook for an account.
      operationId: get_webhook
      description: Returns a webhook for an account.
      responses:
        '200':
          description: Successfully returned a webhook.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Webhook'
              example:
                id: e8e705b9-ef5a-437c-873a-4f49a679f802
                url: https://example.com/survey_completed_webhook
                events:
                  - survey_completed
          headers:
            ETag:
              $ref: '#/components/headers/ETag'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      tags:
        - Notifications Webhooks
      summary: Updates a webhook for an account.
      operationId: update_webhook
      description: Updates a webhook for an account.
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
        - $ref: '#/components/parameters/IfMatch'
      requestBody:
        $ref: '#/components/requestBodies/WebhookUpdate'
      responses:
        '200':
          description: Successfully updated a webhook.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Webhook'
              example:
                id: e8e705b9-ef5a-437c-873a-4f49a679f802
                url: https://example.com/survey_completed_webhook
                events:
                  - survey_completed
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      tags:
        - Notifications Webhooks
      summary: Deletes a webhook for an account.
      operationId: delete_webhook
      description: Deletes a webhook for an account.
      parameters:
        - $ref: '#/components/parameters/IfMatch'
      responses:
        '204':
          description: Successfully deleted a webhook.
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/webhooks/{webhook_id}/regenerate-secret:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/WebhookID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    post:
      tags:
        - Notifications Webhooks
      summary: Regenerate secret for a webhook.
      operationId: regenerate_webhook_secret
      description: Regenerates secret for a webhook.
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
      responses:
        '200':
          description: Successfully new webhook secret generated.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebhookSecretRegenerated'
              example:
                id: e8e705b9-ef5a-437c-873a-4f49a679f802
                url: https://example.com/target_group_paused_webhook
                events:
                  - target_group_paused
                secret: FP7UPZpATKBcYJj4va95PYud+a3gCidRERiLO+9MoFE=
                created_at: '2023-01-01T23:00:00.000Z'
                updated_at: '2023-01-02T23:00:00.000Z'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /accounts/{account_id}/webhooks/events:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Notifications Webhooks
      summary: Returns a list of valid events for webhooks.
      operationId: get_webhook_events
      description: Returns a list of valid events for webhooks. These events can be used to set up webhook type notifications.
      responses:
        '200':
          description: Success.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WebhookListEvents'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /countries:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of all available countries.
      operationId: get_countries
      description: |
        Lists available countries that can be used for target group filtering purposes.  
        `0/NA` is a special country code that can be used for scenarios where a couintry is not applicable.
      responses:
        '200':
          description: Successfully returned countries.
          content:
            application/json:
              schema:
                type: object
                properties:
                  countries:
                    type: array
                    description: A list of countries.
                    items:
                      $ref: '#/components/schemas/CountryListItem'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/allocation-template-association:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
    get:
      operationId: get_account_allocation_template_association
      summary: Gets the template associated with an account if there is one
      tags:
        - Allocation Templates
      responses:
        '200':
          description: A successful response returns the allocation template association.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetAccountAllocationTemplateAssociation'
          headers:
            ETag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: set_account_allocation_template_association
      summary: Sets the template associated with an account.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/IfMatch'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateAccountAllocationTemplateAssociation'
      responses:
        '204':
          description: No Content
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/allocation-templates:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
    get:
      operationId: list_account_allocation_templates
      summary: Lists all account allocation templates.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/EndBefore'
      responses:
        '200':
          description: A successful response returns the account allocation template.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListAccountAllocationTemplatesResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      operationId: create_account_allocation_template
      summary: Creates an individual account template for an account.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyULID'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AllocationTemplateCreateRequest'
      responses:
        '201':
          description: A location for the created allocation template.
          headers:
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/allocation-templates/{template_id}:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/TemplateID'
    get:
      operationId: get_account_allocation_template_by_template_id
      summary: Fetch an individual account template based on the template id.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/LocaleCodeFilter'
      responses:
        '200':
          description: A successful response returns the account allocation template.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetAccountAllocationTemplateByTemplateIdResponse'
          headers:
            ETag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: update_account_allocation_template
      summary: Updates an individual account template for an account.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/IfMatch'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AllocationTemplateUpdateRequest'
      responses:
        '204':
          description: Successfully updated a account template.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      operationId: delete_account_allocation_template
      summary: Deletes an individual account template for an account.
      tags:
        - Allocation Templates
      responses:
        '204':
          description: Successfully deleted an account template.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/business-units/{business_unit_id}/rate-card:
    get:
      summary: Find a rate card based on the provided parameters.
      description: Provides means to lookup a rate card based on the provided search parameters.
      operationId: get_rate_card
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/BusinessUnitID'
        - $ref: '#/components/parameters/CountryCode'
      tags:
        - Target Groups
      responses:
        '200':
          description: Successfully return matching rate card.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateCard'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/drafts/generate-interlocked-profile:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/AccountID'
    post:
      operationId: generate_draft_interlock_profile
      summary: Generate interlocked profile from provided profiles
      tags:
        - Profiling
      description: |
        Allows you to generate the draft interlocked profiles.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateDraftInterlockRequest'
      responses:
        '201':
          description: Successfully applied profiles to the target group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DraftInterlockProfilesResponse'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/accounts/{account_id}/panel-distribution/draft:
    summary: Provides panel distribution for profile conditions in setup page / draft target group
    description: Provides an audience prediction for draft target group from Panel Distribution.
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
    post:
      summary: Get Panel Distribution for draft target group profile conditions
      description: Panel distribution enables the prediction of quota allocations for  each profile condition, based on historical data trends.
      operationId: get_panel_distribution_draft
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PanelDistributionDraftRequest'
      responses:
        '200':
          description: Successfully return panel distribution prediction.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApplyProfilesResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            isSynthetic:
              $ref: '#/components/headers/IsSyntheticTraffic'
        '400':
          $ref: '#/components/responses/Error_BadRequest_DemandAPI'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '500':
          $ref: '#/components/responses/Error_Internal_DemandAPI'
      tags:
        - Profiling
  /demand/accounts/{account_id}/profiling-templates:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
    get:
      tags:
        - Profiling Templates
      operationId: list_profile_templates
      summary: List profile templates
      description: |
        Returns a paginated list of available profile templates in the form of a summary.
      parameters:
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/EndBefore'
        - $ref: '#/components/parameters/Order'
        - $ref: '#/components/parameters/ProfilingTemplatesScope'
        - $ref: '#/components/parameters/ProfilingTemplatesLocales'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfileTemplatesList'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      tags:
        - Profiling Templates
      operationId: create_profile_template
      summary: Create a profile template
      description: Creates a new profile template.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileTemplateRequest'
      responses:
        '201':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfileTemplateResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/profiling-templates/{profile_template_id}:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProfileTemplateID'
    get:
      tags:
        - Profiling Templates
      operationId: get_profile_template
      summary: Get a profile template
      description: Returns a certain profile template by its ID.
      parameters:
        - $ref: '#/components/parameters/ProfilingTemplatesLocales'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfileTemplateResponse'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      tags:
        - Profiling Templates
      operationId: edit_profile_template
      summary: Edit a profile template
      description: Lets you edit an existing profile template.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileTemplateRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfileTemplateResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      tags:
        - Profiling Templates
      operationId: delete_profile_template
      summary: Delete a profile template
      description: Deletes a certain profile template by its ID.
      parameters:
        - $ref: '#/components/parameters/ProfilingTemplatesLocales'
      responses:
        '204':
          description: OK
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
    get:
      summary: Lists projects for an account
      operationId: list_account_projects
      description: Fetch a paginated list of projects for a specific account. Each individual project contains details such as the project name, last activity and statistics.
      parameters:
        - $ref: '#/components/parameters/ProjectManagerIDFilter'
        - $ref: '#/components/parameters/ProjectStatusFilter'
        - $ref: '#/components/parameters/ProjectNameFilter'
        - $ref: '#/components/parameters/ProjectSearchString'
        - $ref: '#/components/parameters/EndBefore'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/PageSize'
      tags:
        - Projects
      responses:
        '200':
          description: Successfully returns a paginated list of projects for an account.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectsList'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      summary: Create a new project
      operationId: create_project
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectInfo'
      responses:
        '202':
          description: Accepted
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            ETag:
              $ref: '#/components/headers/ETag'
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectIDResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Projects
  /demand/accounts/{account_id}/projects/{project_id}:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
    get:
      summary: Get an existing project by ID
      operationId: get_project_by_id
      responses:
        '200':
          description: A successful response returns the project details.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectDetails'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Projects
    put:
      summary: Update an existing project
      operationId: update_project
      parameters:
        - $ref: '#/components/parameters/IfMatch'
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectInfoUpdate'
      responses:
        '200':
          description: Successfully updated the project details.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectIDResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Projects
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/complete-fielding-runs-by-target-group-id:
    post:
      summary: Creates a bulk complete job for fielding runs of a set of target groups.
      description: Creates a bulk job that completes all fielding runs for a set of target groups.  The status of the fielding runs will be set to complete, regardless if their goals or end dates have been reached.
      operationId: create_bulk_complete_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk complete target groups job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkCompleteTargetGroupJobRequest'
      tags:
        - Fielding (Batch)
      responses:
        '201':
          description: Location to created bulk complete target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/complete-fielding-runs-by-target-group-id/{job_id}:
    get:
      summary: Retrieves a bulk complete job for fielding runs of a set of target groups.
      description: Returns a bulk complete job for fielding runs of a set of target groups.
      operationId: get_bulk_complete_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding (Batch)
      responses:
        '200':
          description: The requested bulk complete target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkCompleteTargetGroupJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/launch-fielding-runs-by-target-group-id:
    post:
      summary: Creates a bulk launch job for fielding runs of a set of target groups.
      description: Creates a bulk job that launches all scheduled fielding runs for a set of target groups.  The status of the fielding runs will be set to live and the fielding period will be updated to start `now`.
      operationId: create_bulk_launch_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk launch target groups job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkLaunchTargetGroupJobRequest'
      tags:
        - Fielding (Batch)
      responses:
        '201':
          description: Location to created bulk launch target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/launch-fielding-runs-by-target-group-id/{job_id}:
    get:
      summary: Retrieves a bulk launch job for fielding runs of a set of target groups.
      description: Returns a bulk launch job for fielding runs of a set of target groups.
      operationId: get_bulk_launch_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding (Batch)
      responses:
        '200':
          description: The requested bulk launch target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkLaunchTargetGroupJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/pause-fielding-runs-by-target-group-id:
    post:
      summary: Creates a bulk pause job for fielding runs of a set of target groups.
      description: Creates a bulk job that pauses all applicable fielding runs for a set of target groups.  The status of the fielding runs will be set to paused.
      operationId: create_bulk_pause_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk pause target groups job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkPauseTargetGroupJobRequest'
      tags:
        - Fielding (Batch)
      responses:
        '201':
          description: Location to created bulk pause target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/pause-fielding-runs-by-target-group-id/{job_id}:
    get:
      summary: Retrieves a bulk pause job for fielding runs of a set of target groups.
      description: Returns a bulk pause job for fielding runs of a set of target groups.
      operationId: get_bulk_pause_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding (Batch)
      responses:
        '200':
          description: The requested bulk pause target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkPauseTargetGroupJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/relaunch-fielding-runs-by-target-group-id:
    post:
      summary: Creates a bulk relaunch job for fielding runs of a set of target groups.
      description: Creates a bulk job that relaunches all applicable completed fielding runs for a set of target groups.  The status of the fielding runs will be set to live if the run's goal and end date have not been reached.
      operationId: create_bulk_relaunch_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk relaunch target groups job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkRelaunchTargetGroupJobRequest'
      tags:
        - Fielding (Batch)
      responses:
        '201':
          description: Location to created bulk relaunch target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/relaunch-fielding-runs-by-target-group-id/{job_id}:
    get:
      summary: Retrieves a bulk relaunch job for fielding runs of a set of target groups.
      description: Returns a bulk relaunch job for fielding runs of a set of target groups.
      operationId: get_bulk_relaunch_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding (Batch)
      responses:
        '200':
          description: The requested bulk relaunch target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkRelaunchTargetGroupJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/resume-fielding-runs-by-target-group-id:
    post:
      summary: Creates a bulk resume job for fielding runs of a set of target groups.
      description: Creates a bulk job that resumes all paused fielding runs for a set of target groups.  The status of the fielding runs will be set to live, if its goals and end date have not been reached.
      operationId: create_bulk_resume_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk resume target groups job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkResumeTargetGroupJobRequest'
      tags:
        - Fielding (Batch)
      responses:
        '201':
          description: Location to created bulk resume target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/resume-fielding-runs-by-target-group-id/{job_id}:
    get:
      summary: Retrieves a bulk resume job for fielding runs of a set of target groups.
      description: Returns a bulk resume job for fielding runs of a set of target groups.
      operationId: get_bulk_resume_target_groups_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding (Batch)
      responses:
        '200':
          description: The requested bulk resume target groups job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkResumeTargetGroupJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/update-target-group-project-managers:
    post:
      summary: Creates a bulk update target group project managers job.
      description: Returns location to created bulk update target group project managers job.
      operationId: create_bulk_update_target_group_project_manager_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Create bulk update target group project managers job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBulkUpdateTargetGroupProjectManagerJobRequest'
      tags:
        - Target Groups
      responses:
        '201':
          description: Location to created bulk update target group project managers job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/batch-jobs/update-target-group-project-managers/{job_id}:
    get:
      summary: Retrieves a bulk update target group project managers job.
      description: Returns a bulk update target group project managers job.
      operationId: get_bulk_update_target_group_project_manager_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Target Groups
      responses:
        '200':
          description: The requested bulk update target group project managers job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetBulkUpdateTargetGroupProjectManagerJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/compute-target-group-transitions:
    post:
      summary: Computes available target group transitions.
      description: Returns all target group Ids for the given query parameters and the available possible actions on the returned set of target groups.
      operationId: compute_target_group_transitions
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      requestBody:
        description: Compute target group transitions request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ComputeTargetGroupTransitionsRequest'
      tags:
        - Target Groups
      responses:
        '200':
          description: Target group Ids with their possible actions.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ComputeTargetGroupTransitionsResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/overview:
    get:
      summary: Overview for a project
      operationId: project_overview
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
      responses:
        '200':
          description: Ok
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectOverview'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Projects
  /demand/accounts/{account_id}/projects/{project_id}/target-groups:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
    get:
      operationId: get_list_target_groups
      summary: Retrieve a paginated list of Target Groups for a given project, based on filter criteria.
      description: Fetch a paginated list of essential data points and statistical metrics related to Target Groups of a single project, such as current status, progress, and other relevant details, based on filter criteria such as language, country, name, etc.
      tags:
        - Target Groups
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/EndBefore'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/TargetGroupExclusionStatus'
        - $ref: '#/components/parameters/TargetGroupName'
        - $ref: '#/components/parameters/TargetGroupSearchString'
        - $ref: '#/components/parameters/TargetGroupHumanReadableIds'
        - $ref: '#/components/parameters/TargetGroupStatus'
        - $ref: '#/components/parameters/TargetGroupCountry'
        - $ref: '#/components/parameters/TargetGroupLanguage'
      responses:
        '200':
          description: A successful response returns a paginated list of matching Target Groups along with details such as attributes and metrics.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TargetGroupsList'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      operationId: create_target_group
      summary: Create a target group in draft status.
      description: Create a target group in draft status.
      tags:
        - Target Groups
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        description: Create target group request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDraftTargetGroupRequest'
      responses:
        '201':
          description: Successfully created a Target Group in draft status.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreatedDraftTargetGroupResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get_target_group
      summary: Fetches a target group in draft status.
      description: 'Retrieves a target group using its Target Group ID. If the Target Group is not in a draft status it will redirect to the Target Group Details URL: `/v2/accounts/$1/projects/$2/target-groups/$3/details`'
      tags:
        - Target Groups
      responses:
        '200':
          description: Successfully returned a draft Target Group.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/FetchTargetGroupResponse'
                  - $ref: '#/components/schemas/DraftTargetGroupLinks'
        '301':
          description: Redirecting, as the draft Target Group has been launched
          headers:
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: update_target_group
      summary: Update a target group in draft status.
      description: Update a target group in draft status.
      tags:
        - Target Groups
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Update target group request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDraftTargetGroupRequest'
      responses:
        '204':
          description: Successfully updated a Target Group in draft status.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/calculate-feasibility:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    post:
      summary: Provides Target Group feasibility for a given ID
      description: |-
        Returns feasibility information for the Target Group based on the Target Group details and profiles.
        None of the request properties are mandatory; if any are omitted,  the endpoint will collect the necessary information for those properties.  However, if a property is specified, then the entire related set of  information is required.
      operationId: calculate_target_group_feasibility_by_id
      tags:
        - Feasibility
      requestBody:
        required: false
        description: Optionally provides a means of overriding Target Group details.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CalculateTargetGroupFeasibilityByIdRequest'
      responses:
        '200':
          description: Successfully obtained target group feasibility.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CalculateTargetGroupFeasibilityResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/changelog:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/PageSize'
      - $ref: '#/components/parameters/StartAfter'
      - $ref: '#/components/parameters/EndBefore'
    get:
      operationId: get_target_group_changelog
      summary: Get Target Group Changelog
      tags:
        - Target Groups
      description: Returns a list of changes happened to the target group in the past
      responses:
        '200':
          description: Successfully return list of profiles.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TargetGroupChangelogList'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/completes-aggregated-by-interval:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/AggregationInterval'
    get:
      operationId: get_target_group_completes_aggregated_by_interval
      summary: Get Target Group's collected completes as an aggregated time series
      tags:
        - Target Groups
      description: Returns a list of timestamps according to the aggregation interval and the Target Group's fielding period, with a count of completes collected thus far for each interval. When no interval is provided as a parameter, the endpoint defaults to an interval of 24 hours.
      responses:
        '200':
          description: Successfully return list of intervals with counts.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TargetGroupCollectedCompletesAggregatedIntervalsResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/cost-per-interview:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    put:
      operationId: update_cost_per_interview
      summary: Update target group cost per interview.
      description: Updates the cost per interview to the value specified in the request body. The target group cannot be in draft state.
      tags:
        - Target Groups
      requestBody:
        description: Cost per interview update request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CostPerInterviewUpdateRequest'
      responses:
        '200':
          description: Cost per interview on target group successfully updated.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CostPerInterviewUpdateResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/details:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get_target_group_details
      summary: Retrieve Target Group details
      description: |-
        Fetch details of a launched Target Group, such as Business Unit ID, Study Type ID, Industry ID, Locale, Filling Goal, and other  metadata related to the Target Group.
        Attempting to retrieve a draft Target Group details will result in a Not Found error.
      tags:
        - Target Groups
      responses:
        '200':
          description: A successful response returns a paginated list of matching Target Groups along with details such as attributes and metrics.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/TargetGroupDetails'
                  - $ref: '#/components/schemas/TargetGroupLinks'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: update_launched_target_group_details
      summary: Update launched Target Group details
      description: |-
        Update a launched Target Group details, such as the Project Manager ID, Live URL, and other metadata related to the Target Group.
        Attempting to update a draft Target Group details will result in a Not Found error.
      tags:
        - Target Groups
      requestBody:
        description: The Target Group update request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TargetGroupDetailsUpdateRequest'
      responses:
        '200':
          description: A successful response returns updated Target Group details.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TargetGroupDetails'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-assistant-assignment:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    get:
      operationId: get_fielding_assistant_assignment
      summary: Returns Fielding Assistant assignment details for a Target Group.
      description: |-
        Returns Fielding Assistant assignment configuration details that includes:
          * Pricing
          * Quota overlay
          * Pacing
          * Soft launch
      tags:
        - Fielding
      responses:
        '200':
          description: Successfully returned Fielding Assistant assignment details for a Target Group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FieldingAssistantModulesAssignment'
          headers:
            ETag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: create_or_update_fielding_assistant_assignment
      summary: Create or update the fielding assistant modules assignment.
      description: Creates or updates a fielding assistant assignment with the configuration specified in the request body.
      tags:
        - Fielding
      parameters:
        - $ref: '#/components/parameters/IfMatch'
        - $ref: '#/components/parameters/IfNoneMatch'
      requestBody:
        description: Fielding assistant assignment request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FieldingAssistantModulesAssignmentRequestModel'
      responses:
        '204':
          description: Fielding assistant assignment on target group successfully created or updated.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft:
    post:
      summary: Creates a `launch fielding run from draft` job.
      description: Returns location to the created launch fielding run from draft job.
      operationId: create_launch_fielding_run_from_draft_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
      requestBody:
        description: Create launch fielding run from draft job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateLaunchFieldingRunFromDraftJobRequest'
      tags:
        - Fielding
      responses:
        '201':
          description: Location to the created launch fielding run from draft job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/launch-from-draft/{job_id}:
    get:
      summary: Retrieves a `launch fielding run from draft` job.
      description: Returns a `launch fielding run from draft` job.
      operationId: get_launch_fielding_run_from_draft_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding
      responses:
        '200':
          description: The requested launch fielding run from draft job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetLaunchFieldingRunFromDraftJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/schedule-from-draft:
    post:
      summary: Creates a `schedule fielding run from draft` job.
      description: Returns location to the created schedule fielding run from draft job.
      operationId: create_schedule_fielding_run_from_draft_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
      requestBody:
        description: Create schedule fielding run from draft job request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateScheduleFieldingRunFromDraftJobRequest'
      tags:
        - Fielding
      responses:
        '201':
          description: Location to the created schedule fielding run from draft job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-run-jobs/schedule-from-draft/{job_id}:
    get:
      summary: Retrieves a `schedule fielding run from draft` job.
      description: Returns a `schedule fielding run from draft` job.
      operationId: get_schedule_fielding_run_from_draft_job
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/JobID'
      tags:
        - Fielding
      responses:
        '200':
          description: The requested schedule fielding run from draft job.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetScheduleFieldingRunFromDraftJobResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      summary: Get fielding runs by target group id
      description: 'Fetches the fielding runs for a given target group. '
      operationId: get_fielding_runs_by_target_group_id
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      tags:
        - Fielding
      responses:
        '200':
          description: A successful response returns a list of matching fielding runs for a given target group id.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetListFieldingRunsResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/FieldingRunID'
    get:
      summary: Retrieves a fielding run.
      description: Fetches the details of a fielding run.
      operationId: get_fielding_run
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      tags:
        - Fielding
      responses:
        '200':
          description: The requested fielding run.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FieldingRunItem'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      summary: Updates a fielding run.
      description: Update a specific fielding run of a target group.
      operationId: update_fielding_run
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      requestBody:
        description: The fielding run update request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateFieldingRunRequest'
      responses:
        '202':
          description: A successful updated fielding run response.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UpdateFieldingRunResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/complete:
    post:
      operationId: complete_fielding_run
      summary: Complete a fielding run
      description: Completes a fielding run and sets the fielding run status to complete, regardless if its goals or end date has been reached. It is recommended to set Content-Length to zero when calling out to this endpoint.
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/FieldingRunID'
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      responses:
        '204':
          description: Successfully completed a Fielding Run.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/launch-now:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/FieldingRunID'
    post:
      operationId: launch_now_fielding_run
      summary: Launches a fielding run now.
      description: Update the fielding run's fielding period to start now and launch the fielding run.  Both start and end time of the fielding run will be updated.
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      responses:
        '200':
          description: Successfully updated the fielding period and launched the fielding run
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LaunchNowFieldingRunResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/pause:
    post:
      operationId: pause_fielding_run
      summary: Pause a fielding run
      description: Pauses a live fielding run and sets the fielding run status to paused. To resume a fielding run and to set it live again, use the /resume API. It is recommended to set Content-Length to zero when calling out to this endpoint.
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/FieldingRunID'
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      responses:
        '204':
          description: Successfully paused a Fielding Run.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/relaunch:
    post:
      operationId: relaunch_fielding_run
      summary: Relaunch a fielding run
      description: Relaunches a completed fielding run and sets the fielding run status to live again, if its goals and end date have not been reached yet. It is recommended to set Content-Length to zero when calling out to this endpoint.
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/FieldingRunID'
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      responses:
        '204':
          description: Successfully relaunched a Fielding Run.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/fielding-runs/{fielding_run_id}/resume:
    post:
      operationId: resume_fielding_run
      summary: Resume a fielding run
      description: Resumes a paused fielding run and sets the fielding run live again, if its goals and end date have not been reached. It is recommended to set Content-Length to zero when calling out to this endpoint.
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/ProjectID'
        - $ref: '#/components/parameters/TargetGroupID'
        - $ref: '#/components/parameters/FieldingRunID'
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IfMatch'
      tags:
        - Fielding
      responses:
        '204':
          description: Successfully resumed a Fielding Run.
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
            etag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '422':
          $ref: '#/components/responses/Error_InvalidState'
        '429':
          $ref: '#/components/responses/Error_RateLimit'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/filling-strategy:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    put:
      operationId: update_filling_strategy
      summary: Updates the filling strategy on the given target group.
      description: Updates the filling strategy to the value specified in the request body.
      tags:
        - Target Groups
      requestBody:
        description: Filling strategy update request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FillingStrategyUpdateRequest'
      responses:
        '200':
          description: Filling strategy on target group successfully updated.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FillingStrategyUpdateResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '405':
          $ref: '#/components/responses/Error_MethodNotAllowed'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/overview:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get_target_group_overview
      summary: Retrieve basic attributes and stats for a Target Group.
      description: |-
        Fetch a set of essential data points and statistical metrics related to a specific launched Target Group, such as its current status, progress, and other relevant details.
        Attempting to retrieve a draft Target Group overview will result in a Not Found error.
      tags:
        - Target Groups
      responses:
        '200':
          description: A successful response returns requested Target Group attributes and statistics.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TargetGroupOverview'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profile/{profile_id}/panel-distribution:
    summary: Provides panel distribution for particular profile conditions
    description: Provides an audience prediction for launch/live target group from Panel Distribution.
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    get:
      summary: Get Panel Distribution for profile conditions in manage page
      description: Panel distribution enables the prediction of quota allocations for  each profile condition, based on historical data trends.
      operationId: get_panel_distribution_by_profile
      responses:
        '200':
          description: Successfully return panel distribution prediction.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
        '400':
          $ref: '#/components/responses/Error_BadRequest_DemandAPI'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '500':
          $ref: '#/components/responses/Error_Internal_DemandAPI'
      tags:
        - Profiling
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: list_profiles
      summary: Get Profiles
      tags:
        - Profiling
      description: Returns a list of all non-interlocked, non-control profiles for the target group.
      responses:
        '200':
          description: Successfully return list of profiles.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListRegularProfiles'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      operationId: create_profile
      summary: Create a Profile
      tags:
        - Profiling
      description: |
        Profiles give you the ability to define the audience of your study and control the respondents through quotas.
        Each profile contains a set of conditions, and quotas can be set on those conditions.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileCreationRequest'
      responses:
        '201':
          description: Successfully created a profile.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    get:
      operationId: get_profile
      summary: Get a Profile
      tags:
        - Profiling
      description: Returns a profile by the ID.
      responses:
        '200':
          description: Successfully return the profile.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      operationId: delete_profile
      summary: Delete a Profile
      tags:
        - Profiling
      responses:
        '204':
          description: Successfully removed the profile.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/conditions:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    put:
      operationId: update_profile_conditions
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
      summary: Update Profile Conditions
      tags:
        - Profiling
      description: |
        Allows you to manipulate the active set of conditions on the profile.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegularProfileCreationConditions'
      responses:
        '200':
          description: Successfully updated the conditions on the profile.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/disable-quotas:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    post:
      operationId: disable_quotas
      summary: Disable Quotas
      tags:
        - Profiling
      responses:
        '200':
          description: Successfully disabled quotas on the profile.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/enable-quotas:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    post:
      operationId: enable_quotas
      summary: Enable Quotas
      tags:
        - Profiling
      responses:
        '200':
          description: Successfully enabled quotas on the profile.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/group-quotas:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    post:
      operationId: manipulate_profile_condition_groups
      summary: Manage Profile Condition Groups
      tags:
        - Profiling
      description: |
        Condition grouping is a way to combine a set of conditions into a single quota. This 
        allows you to avoid setting individual quotas for each and every condition.
        Using this endpoint, you can declare the groups you want. 
        Please note that each condition can be at most a member of one group. Also, a group of one 
        condition will be automatically ungrouped.
        This is a declarative API.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConditionGroupingRequest'
      responses:
        '200':
          description: Successfully grouped conditions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/apply-profiles:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: apply_profiles
      summary: Apply all profiles to a target group
      tags:
        - Profiling
      description: |
        Allows you to apply the draft profiles to a target group, letting you
        create multiple profiles at once.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApplyProfileRequest'
      responses:
        '201':
          description: Successfully applied profiles to the target group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApplyProfilesResponse'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest_DemandAPI'
        '500':
          $ref: '#/components/responses/Error_Internal_DemandAPI'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/batch-delete-profile-quotas:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: batch_delete_profiles_quotas
      summary: Batch Delete Profiles Quotas
      tags:
        - Profiling
      description: Allows the user to batch delete multiple quotas from profiles on a target group.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchProfilesQuotasDeletionRequest'
      responses:
        '204':
          description: Successfully deleted profiles
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/batch-delete-profiles:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: batch_delete_profiles
      summary: Batch Delete Profiles
      tags:
        - Profiling
      description: Allows the user to batch delete multiple profiles on a target group.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchProfileDeletionRequest'
      responses:
        '204':
          description: Successfully deleted profiles
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/filling-goal:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    put:
      operationId: update_profile_filling_goal
      summary: Update Profile Filling Goal
      tags:
        - Profiling
      description: |
        Allows you to change the filling goals of quotas inside a list of profiles.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FillingGoalUpdateRequest'
      responses:
        '200':
          description: Successfully updated the filling goal.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegularProfile'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/quota-distribution:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/TargetGroupFillingGoal'
    get:
      operationId: get_target_group_quota_distribution
      summary: Get the distribution of quotas given target groups filling goal
      description: Get the distribution of quotas given the target group filling goal. Values are evenly divided among all quotas in all profiles for a target group.
      tags:
        - Target Groups
      responses:
        '200':
          description: Successfully calculated quota distribution for target group
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FetchTargetGroupQuotaDistribution'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/projects/{project_id}/target-groups/calculate-feasibility:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    post:
      operationId: calculate_target_group_feasibility
      summary: Provides Target Group feasibility
      description: |-
        Returns feasibility information for the draft Target Group Specification based on the Target Group details and profiles.
        If profiles are provided, response includes per quota feasibility based  on profile conditions.
      tags:
        - Feasibility
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CalculateTargetGroupFeasibilityRequest'
      responses:
        '200':
          description: Successfully obtained target group feasibility.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CalculateTargetGroupFeasibilityResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/reconciliations:
    get:
      summary: Get a list of submitted reconciliations by account id
      operationId: get_reconciliations_by_account_id
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/FileName'
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/StartAfter'
        - $ref: '#/components/parameters/EndBefore'
        - $ref: '#/components/parameters/Status'
        - $ref: '#/components/parameters/SubmittedByUserID'
        - $ref: '#/components/parameters/NextCursor'
      responses:
        '200':
          description: Successfully returned reconciliations.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReconciliationsFiles'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
    post:
      summary: Submit reconciliations.
      operationId: post_reconciliations
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/FileName'
        - $ref: '#/components/parameters/IdempotencyKeyRequired'
      requestBody:
        content:
          text/csv:
            schema:
              type: string
              description: 'CSV file with two columns. Format each line as: RID, reason code. Do not include a header row.'
      responses:
        '200':
          description: Successfully submitted reconciliations.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubmitReconciliationsResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reconciliations/{request_id}:
    get:
      summary: Get a reconciliation by request ID.
      operationId: get_reconciliation_by_request_id
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/RequestID'
      responses:
        '200':
          description: Successfully returned reconciliation request.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Reconciliation'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reconciliations/{request_id}/target-groups:
    get:
      summary: Get list of target groups associated to a reconciliation request ID.
      operationId: get_target_groups_by_request_id
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/RequestID'
        - $ref: '#/components/parameters/PageSize'
        - $ref: '#/components/parameters/StartAfter'
      responses:
        '200':
          description: Successfully returned paginated list of target groups.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestReconciliationsTargetGroups'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reconciliations/{request_id}/target-groups/{target_group_id}:
    get:
      summary: Get a target groups reconciliation information by target group id and request id
      operationId: get_target_group_by_request_id_and_target_group_id
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/RequestID'
        - $ref: '#/components/parameters/parameters-TargetGroupID'
      responses:
        '200':
          description: Successfully returned target group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReconciliationsTargetGroup'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reconciliations/eligible-target-groups:
    get:
      summary: List Eligible Target Groups
      operationId: get_eligible_target_groups
      parameters:
        - $ref: '#/components/parameters/AccountID'
        - $ref: '#/components/parameters/SessionMonth'
        - $ref: '#/components/parameters/ReconTGName'
        - $ref: '#/components/parameters/ReconTGStatus'
        - $ref: '#/components/parameters/ReconProjectName'
        - $ref: '#/components/parameters/ReconProjectManagerID'
      responses:
        '200':
          description: Successfully returned target group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReconciliationsEligibleTargetGroupsResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reconciliations/reason-codes:
    description: Returns a list of all reconciliation reason codes, names and descriptions.
    get:
      summary: List of reconciliation reason codes and details.
      description: Returns a list of all reconciliation reason codes, names and descriptions.
      operationId: request_reconciliation_reason_codes
      parameters:
        - $ref: '#/components/parameters/AccountID'
      responses:
        '200':
          description: Successfully returns a list of reconciliation reason codes and descriptions.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReconciliationReasonCodesResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Reconciliations
  /demand/accounts/{account_id}/reports:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/Authorization'
      - $ref: '#/components/parameters/ReportTypeQuery'
      - $ref: '#/components/parameters/EndBefore'
      - $ref: '#/components/parameters/StartAfter'
      - $ref: '#/components/parameters/PageSize'
    get:
      operationId: report_requests
      summary: List of report requests
      description: Lists all report requests made by the user in authorization token in last 90 days.  If the token has a `buyer_admin` role, then it will list all report requests made by all users in the account in last 90 days.
      tags:
        - Reports
      responses:
        '200':
          description: Successfully returns all report requests.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportRequestList'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/reports/{report_id}/share:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ReportId'
      - $ref: '#/components/parameters/Authorization'
      - $ref: '#/components/parameters/ReportTypeQuery'
    get:
      operationId: share_report
      summary: Share Report
      description: Generate a shareable presigned url link for the report
      tags:
        - Reports
      responses:
        '200':
          description: Successfully returns all report shareable presigned url link.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportShareResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/reports/{report_id}/status:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/Authorization'
      - $ref: '#/components/parameters/ReportId'
    get:
      operationId: report_status
      summary: Status Report
      description: Get status for a report job
      tags:
        - Reports
      responses:
        '200':
          description: Successfully returns status information for a report job.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportStatusResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/reports/{report_type}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/Authorization'
      - $ref: '#/components/parameters/ReportType'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    post:
      operationId: generate_report
      summary: Generate Report
      description: |-
        Generate reports in asynchronous pattern. Response includes a request identifier that can be used to track the request progress.  Response also includes a `report_url` that can be used to download the report when the request is complete. User can select if report needs to be generated for entire account or project or one or multiple target groups.
        <table>
              <tr><th> Report Name</th><th>Level</th><th>Multiple selection</th><th>Comments</th></tr>
              <tr><td>Completes</td><td>Account, BU, Project and Target group</td><td>Yes</td><td>Except account, user can select multiple values for BU, Project, Targetgroup</td></tr>
              <tr><td>Reconciliation Eligible RIDs</td><td>Project and Target group</td><td>Yes</td><td>Only multiple target groups selection is possible. Project is restricted to only 1 project at a time</td></tr>
              <tr><td>Reconciliation status</td><td>Account, Project and Target group</td><td>Yes</td><td>Except account, user can select multiple values for Project, Targetgroup</td></tr>
              <tr><td>Respondent Analysis</td><td>Project and Target group</td><td>Yes</td><td>Only Target group can be multiselect. Project is restricted to only 1 project at a time</td></tr>
              <tr><td>Sample bought</td><td>Account, BU, Project and Target group</td><td>Yes</td><td>Except account, user can select multiple values for BU, Project, Targetgroup</td></tr>
              <tr><td>Termination details</td><td>Target group</td><td>No</td><td>Only 1 Target group is allowed to be selected</td></tr>
        </table>
      tags:
        - Reports
      requestBody:
        description: Report request.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReportGenerationRequest'
      responses:
        '202':
          description: Accepted response returns status, report url, start date, end date, report id, message
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReportGenerationResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/accounts/{account_id}/reports/download:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/Authorization'
      - $ref: '#/components/parameters/ReportTypeQuery'
      - $ref: '#/components/parameters/ReportFileName'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    get:
      operationId: download_report
      summary: Download Report
      description: Allows user to download report generated (csv format or excel format based on report type). When a report is generated, `report_url` parameter is returned in the response. That parameter has this endpoint with all necessary parameters filled.
      tags:
        - Reports
      responses:
        '200':
          description: Successfully returns a CSV or XLSX report file.
          content:
            text/csv:
              schema:
                type: string
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
              schema:
                type: string
                format: binary
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/allocation-templates:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/PageSize'
      - $ref: '#/components/parameters/StartAfter'
      - $ref: '#/components/parameters/EndBefore'
    get:
      operationId: list_global_allocation_templates
      summary: Lists all global allocation templates.
      tags:
        - Allocation Templates
      responses:
        '200':
          description: A successful response returns the global allocation template.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListGlobalAllocationTemplatesResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      operationId: create_global_allocation_template
      summary: Creates a global template for an account.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/IdempotencyKeyULID'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AllocationTemplateCreateRequest'
      responses:
        '201':
          description: Location to created allocation global template id.
          headers:
            location:
              $ref: '#/components/headers/Location'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/allocation-templates/{template_id}:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/TemplateID'
    get:
      operationId: get_global_allocation_template_by_template_id
      summary: Fetch an individual global template based on the template id.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/LocaleCodeFilter'
      responses:
        '200':
          description: A successful response returns the global allocation template.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetGlobalAllocationTemplateByTemplateIdResponse'
          headers:
            ETag:
              $ref: '#/components/headers/ETag'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    put:
      operationId: update_global_allocation_template
      summary: Updates an individual global template for an account.
      tags:
        - Allocation Templates
      parameters:
        - $ref: '#/components/parameters/IfMatch'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AllocationTemplateUpdateRequest'
      responses:
        '204':
          description: Successfully updated a global template.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '412':
          $ref: '#/components/responses/Precondition_Failed'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      operationId: delete_global_allocation_template
      summary: Deletes an individual global template.
      tags:
        - Allocation Templates
      responses:
        '204':
          description: Successfully deleted a global template.
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/intelligent-calendar/suggest-days:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    post:
      summary: Suggest number of days for running a Target Group
      description: Provides you with a suggestion of the number of days for running a hypothetical Target Group. This endpoint requires you to give it the locale, the LOI, the IR, the expected number of completes, the price and optionally whether or not your Target Group collects PII.
      operationId: suggest_days
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SuggestDaysRequest'
      responses:
        '200':
          description: Successfully return day suggestion.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuggestDaysResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Intelligent Calendar
  /demand/intelligent-calendar/suggest-time-range:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    get:
      summary: Time range suggestion for different locales
      description: Provides you with a suggestion of the best possible time range to run your target groups in  any given locale. This endpoint requires you to give it a locale and a time range. You can put in a time range through either a start and end date or a number of days. If you use days, you will be given the best time range to start on from the moment you've made your request to the number of days you've given.
      operationId: suggest_time_range
      parameters:
        - name: days
          in: query
          description: Number of days in field. Only one of `days` or `start`/`end` MUST be provided.
          required: true
          schema:
            type: integer
            minimum: 1
          example: 10
        - name: start
          in: query
          description: Timestamp for start date in RFC3339 format, timezone-aware. Only one of `days` or `start`/`end` MUST be provided.
          required: true
          schema:
            type: string
            format: date-time
          example: '2024-12-31T23:59:59.99+01:00'
        - name: end
          in: query
          description: Timestamp for end date in RFC3339 format, timezone-aware. Only one of `days` or `start`/`end` MUST be provided.
          required: true
          schema:
            type: string
            format: date-time
          example: '2025-12-31T23:59:59.99+01:00'
        - name: locale
          in: query
          description: Locale code.
          schema:
            $ref: '#/components/schemas/LocaleCode'
      responses:
        '200':
          description: Successfully return time range suggestion.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuggestedTimeRangeResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Intelligent Calendar
  /demand/panel-distribution:
    summary: Provides panel distribution for profile conditions
    description: Provides a prediction of Panel Distribution.
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
    post:
      summary: Get Panel Distribution for profile conditions
      description: Panel distribution enables the prediction of quota allocations for  each profile condition, based on historical data trends.
      operationId: get_panel_distribution
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PanelDistributionRequest'
      responses:
        '200':
          description: Successfully return panel distribution prediction.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PanelDistributionResponse'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Profiling
  /demand/questions:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
    get:
      operationId: list_questions
      summary: Lists all available questions.
      description: Returns a list of available questions that are used as basis for  a target group profile.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/QuestionSearchFilter'
        - $ref: '#/components/parameters/QuestionCategoryFilter'
        - $ref: '#/components/parameters/QuestionScopeFilter'
        - $ref: '#/components/parameters/LocaleCodeFilter'
        - $ref: '#/components/parameters/QuestionsAccountID'
      responses:
        '200':
          description: Successfully return questions.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListQuestions'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/questions-translation:
    summary: Questions translations.
    description: An endpoint translating underlaying sprocket questions.
    parameters:
      - $ref: '#/components/parameters/QuestionsTranslationIDs'
      - $ref: '#/components/parameters/QuestionsTranslationLocale'
      - $ref: '#/components/parameters/QuestionsTranslationTranslationLanguage'
      - $ref: '#/components/parameters/QuestionsTranslationQuery'
      - $ref: '#/components/parameters/QuestionsTranslationLimit'
      - $ref: '#/components/parameters/QuestionsTranslationAllowCustomQuals'
      - $ref: '#/components/parameters/QuestionsTranslationAllowForeignQuals'
      - $ref: '#/components/parameters/QuestionsTranslationNoFilter'
      - $ref: '#/components/parameters/QuestionsTranslationStartAfter'
      - $ref: '#/components/parameters/QuestionsTranslationEndBefore'
      - $ref: '#/components/parameters/QuestionsTranslationClassificationFilter'
      - $ref: '#/components/parameters/QuestionsTranslationModel'
      - $ref: '#/components/parameters/QuestionsTranslationVersion'
    get:
      summary: Get list of translated questions for list of question IDs.
      description: Responds with question list per requested question IDs having text in language of local and requested translation.
      operationId: get_questions_translation
      responses:
        '200':
          description: Successfully returned translated questions.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionsTranslationResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
      tags:
        - Profiling
  /demand/questions/{question_id}:
    parameters:
      - $ref: '#/components/parameters/QuestionID'
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
    get:
      operationId: get_question_by_id
      summary: Provides question with all available options.
      description: Returns a question by the given ID that includes a list of all available  options on a question that can be used to craft profiles. Respondents  will always be presented with all of available options on the question.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/LocaleCodeFilter'
      responses:
        '200':
          description: Successfully return question by ID that includes all question options.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionByID'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/questions/categories:
    get:
      operationId: list_all_question_categories
      summary: Lists all available question categories.
      description: Returns a list of all available question categories.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IsSyntheticTraffic'
        - $ref: '#/components/parameters/RunAsOf'
      responses:
        '200':
          description: Successfully return question categories.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListQuestionCategories'
          headers:
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/system-allocation-template:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/LocaleCodeFilter'
    get:
      operationId: get_system_allocation_template
      summary: Gets the system allocation template.
      tags:
        - Allocation Templates
      responses:
        '200':
          description: A successful response returns the account allocation template.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetSystemAllocationTemplateResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/v2/accounts/{account_id}/drafts/generate-interlocked-profile:
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/IdempotencyKeyRequired'
      - $ref: '#/components/parameters/AccountID'
    post:
      operationId: generate_draft_interlock_profile_v2
      summary: Generate interlocked profile from provided profiles
      tags:
        - Profiling
      description: |
        Allows you to generate the draft interlocked profiles.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateDraftInterlockRequest'
      responses:
        '201':
          description: Successfully applied profiles to the target group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DraftInterlockProfilesResponseV2'
          headers:
            idempotency-key:
              $ref: '#/components/headers/IdempotencyKey'
            traceparent:
              $ref: '#/components/headers/Traceparent'
            tracestate:
              $ref: '#/components/headers/Tracestate'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/all-profiles:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get-profiles-all
      summary: Get profiles.
      description: Retrieve all profiles of a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Profiles retrieved
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetAllProfilesResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profile/{profile_id}/panel-distribution:
    summary: Provides panel distribution for particular profile conditions
    description: Provides an audience prediction for launch/live target group from Panel Distribution.
    parameters:
      - $ref: '#/components/parameters/Traceparent'
      - $ref: '#/components/parameters/Tracestate'
      - $ref: '#/components/parameters/IsSyntheticTraffic'
      - $ref: '#/components/parameters/RunAsOf'
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileID'
    get:
      summary: Get Panel Distribution for profile conditions in manage page
      description: Panel distribution enables the prediction of quota allocations for  each profile condition, based on historical data trends.
      operationId: get_v2_panel_distribution_by_profile
      responses:
        '200':
          description: Successfully return panel distribution prediction.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetPanelDistributionResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest_DemandAPI'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '500':
          $ref: '#/components/responses/Error_Internal_DemandAPI'
      tags:
        - Profiling
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get-profiles
      summary: Get profiles.
      description: Retrieve all profiles of a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Profiles retrieved
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetAllProfilesResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
    post:
      operationId: create-profile
      summary: Create a profile.
      description: Creates a profile based on the conditions received.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        description: Create profile request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProfileRequestBody'
      responses:
        '201':
          description: Successfully created profile
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
            IdempotencyKey:
              $ref: '#/components/headers/IdempotencyKey'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputRegularProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    get:
      operationId: get-profile
      summary: Get profile.
      description: Retrieve a specific profile of a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Profiles retrieved
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetProfileResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/conditions:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    put:
      operationId: update-profile-conditions
      summary: Updates profile conditions.
      description: Updates profile conditions.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Update profiles condition request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileCreationConditions'
      responses:
        '200':
          description: Conditions Updated
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputRegularProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/disable-quotas:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    post:
      operationId: disable-quotas-v2
      summary: Disables quotas for a profile.
      description: Disables quotas for a profile.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Successfully disabled quotas
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputRegularProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/enable-quotas:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    post:
      operationId: enable-quotas
      summary: Enables quotas for a profile.
      description: Enables quotas for a profile.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Successfully enabled quotas
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputRegularProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/group-quotas:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    post:
      operationId: group-quotas
      summary: Manage quota groups on a profile.
      description: |
        Condition grouping is a way to combine a set of conditions into a single quota. This
        allows you to avoid setting individual quotas for each and every condition.
        Using this endpoint, you can declare the groups you want.
        Please note that each condition can be at most a member of one group. Also, a group of one
        condition will be automatically ungrouped.
        This is a declarative API.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Updated profiles condition request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GroupQuotasRequestBody'
      responses:
        '201':
          description: Quota Groups Created with Success
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputRegularProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/{profile_id}/remove-interlocks:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/ProfileIDV2'
    post:
      operationId: remove-interlocks
      summary: Remove Interlocks.
      description: Remove the interlocking between profiles.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKey'
      responses:
        '200':
          description: Successfully removed interlocks
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
            IdempotencyKey:
              $ref: '#/components/headers/IdempotencyKey'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RemoveInterlocksResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/apply-profiles:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: apply-profiles
      summary: Apply-profiles.
      description: Receive information about profiles and their quotas and create the respective profiles.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        description: Apply profiles request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApplyProfilesRequestBody'
      responses:
        '200':
          description: Successfully created profile
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
            IdempotencyKey:
              $ref: '#/components/headers/IdempotencyKey'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/schemas-ApplyProfilesResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/batch-delete-profile-quotas:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: batch-delete-profile-quotas
      summary: Bulk delete profile quotas from a target group.
      description: Bulk delete profile quotas from a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Delete profiles request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchDeleteProfileQuotasRequestBody'
      responses:
        '204':
          description: Successfully deleted quotas
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/batch-delete-profiles:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: batch-delete-profiles
      summary: Bulk delete profiles from a target group.
      description: Bulk delete profiles from a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Delete profiles request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchDeleteProfileRequestBody'
      responses:
        '204':
          description: Successfully deleted profiles
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/create-interlocked-profile:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    post:
      operationId: create-interlocked-profile
      summary: Create an interlocked profile.
      description: Generate interlocked profile from up to 6 existing profiles with quotas enabled.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
        - $ref: '#/components/parameters/IdempotencyKey'
      requestBody:
        description: Create profile request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateInterlockedProfileRequestBody'
      responses:
        '200':
          description: Successfully created profile
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
            IdempotencyKey:
              $ref: '#/components/headers/IdempotencyKey'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutputInterlockedProfile'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/profiles/filling-goal:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    put:
      operationId: bulk-update-quotas
      summary: Update quotas.
      description: Update quotas.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      requestBody:
        description: Updated profiles quotas request
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateFillingGoalRequestBody'
      responses:
        '201':
          description: Successfully created profile
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetAllProfilesResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/quota-distribution:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/TargetGroupFillingGoal'
    get:
      operationId: get-target-group-quota-distribution
      summary: Get Target Group Quota Distribution.
      description: |
        Get the distribution of quotas given the target group filling goal. 
        Values are evenly divided among all quotas in all profiles for a target group.
      tags:
        - Profiling
      parameters:
        - $ref: '#/components/parameters/Traceparent'
        - $ref: '#/components/parameters/Tracestate'
      responses:
        '200':
          description: Quota Distribution Response
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetTargetGroupQuotaDistributionResponse'
        '400':
          description: Bad Request
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BadRequestErrorResponseDemographics'
        '401':
          description: Unauthorized
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnauthorizedErrorResponseDemographics'
        '403':
          description: Forbidden
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForbiddenErrorResponseDemographics'
        '404':
          description: Not Found
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NotFoundErrorResponseDemographics'
        '500':
          description: Internal Server Error
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InternalErrorResponseDemographics'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/supply-allocations:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
    get:
      operationId: get_target_group_supply_allocation
      summary: Fetches all Supplier Group Allocations for a target group.
      tags:
        - Allocations
      responses:
        '200':
          description: A successful response returns all Supplier Group Allocations for a Target Group.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GetSupplyAllocationResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    post:
      operationId: create_target_group_supply_allocation
      summary: Create a Supplier Group Allocations for a Target Group
      tags:
        - Allocations
      description: Create a Supplier Group Allocations for a Target Group.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SupplyAllocationCreateRequest'
      responses:
        '201':
          description: Successfully created a Supplier Group Allocation.
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
    delete:
      operationId: delete_target_group_supply_allocation
      summary: Delete a Supplier Group Allocations for a Target Group
      tags:
        - Allocations
      responses:
        '204':
          description: Successfully deleted a Supplier Group Allocation.
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /demand/v2/accounts/{account_id}/projects/{project_id}/target-groups/{target_group_id}/supply-allocations/{allocation_id}:
    parameters:
      - $ref: '#/components/parameters/AccountID'
      - $ref: '#/components/parameters/ProjectID'
      - $ref: '#/components/parameters/TargetGroupID'
      - $ref: '#/components/parameters/AllocationId'
    put:
      operationId: update_target_group_supply_allocation
      summary: Updates a Supplier Group Allocations
      tags:
        - Allocations
      description: Updates a Supplier Group Allocations
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SupplyAllocationUpdateRequest'
      responses:
        '200':
          description: A successful response returns updated Supplier Group.
          headers:
            TraceParent:
              $ref: '#/components/headers/Traceparent'
            TraceState:
              $ref: '#/components/headers/Tracestate'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UpdateSupplyAllocationResponse'
        '400':
          $ref: '#/components/responses/Error_BadRequest'
        '401':
          $ref: '#/components/responses/Error_Unauthorized'
        '403':
          $ref: '#/components/responses/Error_Forbidden'
        '404':
          $ref: '#/components/responses/Error_NotFound'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /industries:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of industries.
      operationId: get_industries
      description: Lists available industries. Surveys can be associated with these industries.
      responses:
        '200':
          description: Successfully returned industries.
          content:
            application/json:
              schema:
                type: object
                properties:
                  industries:
                    type: array
                    description: A list of industries.
                    items:
                      $ref: '#/components/schemas/IndustryListItem'
  /industry-lockouts:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of all available industry lockouts.
      operationId: get_industry_lockouts
      description: |
        Lists available industry lockouts. An industry lockout locks respondents during a specific timeframe based on whether they have taken a separate survey in the same industry.
      responses:
        '200':
          description: Successfully returned industry lockouts.
          content:
            application/json:
              schema:
                type: object
                properties:
                  industry_lockouts:
                    type: array
                    description: A list of industry lockouts.
                    items:
                      $ref: '#/components/schemas/IndustryLockoutItem'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /integration-use-cases:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: List of all supported integration use cases.
      operationId: get_integration_use_cases
      description: |
        Lists all supported integration use cases. A use case indicates
        the purpose for which the integration will be used.
      responses:
        '200':
          description: Successfully returned list of integration use cases.
          content:
            application/json:
              schema:
                type: object
                properties:
                  integration_use_cases:
                    type: array
                    description: A list of integration use cases.
                    items:
                      $ref: '#/components/schemas/IntegrationUseCaseListItem'
                example:
                  integration_use_cases:
                    - id: manage_surveys
                      name: Manage surveys
                      description: |
                        Create, update, and retrieve surveys, allocations, groups, qualifications, and quotas.
                    - id: performance_reporting
                      name: Performance reporting
                      description: |
                        Monitor survey performance and do reconciliation.
                    - id: financial_reporting
                      name: Financial reporting
                      description: |
                        Generate cost summary reports for sets of surveys.
        '500':
          $ref: '#/components/responses/Error_Internal'
  /locales:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of all available locales.
      operationId: get_locales
      description: Suggests locales with a better support.
      responses:
        '200':
          description: Successfully returned suggested locales.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Locales'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /study-types:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of study types.
      operationId: get_study_types
      description: Lists available study types. Study types are supposed to indicate the survey's limits and its' purpose.
      responses:
        '200':
          description: Successfully returned study types.
          content:
            application/json:
              schema:
                type: object
                properties:
                  study_types:
                    type: array
                    description: A list of study types.
                    items:
                      $ref: '#/components/schemas/StudyTypeListItem'
        '500':
          $ref: '#/components/responses/Error_Internal'
  /suppliers:
    parameters:
      - $ref: '#/components/parameters/CorrelationIDHeader'
    get:
      tags:
        - Definitions
      summary: Returns a list of suppliers.
      operationId: get_suppliers
      description: Lists available suppliers on our marketplace.
      responses:
        '200':
          description: Successfully returned suppliers.
          content:
            application/json:
              schema:
                type: object
                properties:
                  suppliers:
                    type: array
                    description: A list of suppliers.
                    items:
                      $ref: '#/components/schemas/SupplierDetailsItem'
        '500':
          $ref: '#/components/responses/Error_Internal'
components:
  parameters:
    CorrelationIDHeader:
      name: X-Correlation-ID
      in: header
      required: false
      description: |
        This header uniquely identifies the request to allow referencing of a particular transaction and event chain. 
        When not provided, a new correlation ID will be generated and included in the API response HTTP header.
      schema:
        type: string
        format: uuid
    AccountID:
      name: account_id
      description: The account's unique identifier.
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/AccountID'
    UserType:
      name: user_type
      in: query
      description: Filter users by user type.
      schema:
        type: string
        enum:
          - project_manager
    UserID:
      in: path
      name: user_id
      schema:
        $ref: '#/components/schemas/UserID'
      required: true
      description: Uniquely identifies a user.
    PageSize:
      name: page_size
      in: query
      description: |
        A limit on the number of objects to be returned, between 1 and 100.
      schema:
        type: integer
        default: 10
      example: 15
    StartAfter:
      name: start_after
      in: query
      description: Pagination cursor to return list objects after given pagination cursor.
      schema:
        type: string
      example: bff6a669-a469-409d-8c94-dcf92258043a
    EndBefore:
      name: end_before
      in: query
      description: Pagination cursor to return list objects before given pagination cursor.
      schema:
        type: string
      example: 7daa40ad-303b-40a2-89df-a9760400cde7
    WebhookID:
      name: webhook_id
      in: path
      description: The ID of the webhook.
      required: true
      schema:
        $ref: '#/components/schemas/WebhookID'
    IdempotencyKeyRequired:
      name: idempotency-key
      in: header
      required: true
      description: A shallow unique ID that serves as a deduping mechanism. For mutable operations, this header is MANDATORY.
      schema:
        $ref: '#/components/schemas/IdempotencyKey'
    IfMatch:
      name: If-Match
      description: The `If-Match` header contains a string that identifies the expected  version state of a resource, represented as an `ETag` value.  It serves as a mechanism for optimistic locking, ensuring that a resource  is updated or deleted only if its current state matches the specified  `ETag` value, thereby preventing unintended overwrites. The `ETag` value should always be wrapped in double quotes, whether it is part of a weak `ETag` or standalone.
      in: header
      schema:
        type: string
        format: etag
        example: W/"1234"
    Traceparent:
      name: traceparent
      required: false
      in: header
      schema:
        $ref: '#/components/schemas/Traceparent'
    Tracestate:
      name: tracestate
      required: false
      in: header
      schema:
        $ref: '#/components/schemas/Tracestate'
    IdempotencyKeyULID:
      name: idempotency-key
      in: header
      required: true
      description: A mandatory header representing a shallow unique ID that serves as a deduplication mechanism.  Used for mutable operations.
      schema:
        $ref: '#/components/schemas/IdempotencyKeyULID'
    TemplateID:
      name: template_id
      in: path
      schema:
        $ref: '#/components/schemas/TemplateID'
      required: true
      description: The ID of the template.
    LocaleCodeFilter:
      name: locale
      in: query
      description: Filter by question locale code.
      schema:
        $ref: '#/components/schemas/LocaleCode'
      example: jpn_jp
    BusinessUnitID:
      in: path
      name: business_unit_id
      schema:
        $ref: '#/components/schemas/BusinessUnitID'
      required: true
      description: Uniquely identifies a business unit.
    CountryCode:
      in: query
      name: country_code
      schema:
        type: string
      required: true
      example: US
      description: Country code to find the rate card for.
    IsSyntheticTraffic:
      name: is-synthetic-traffic
      in: header
      required: false
      schema:
        $ref: '#/components/schemas/IsSyntheticTraffic'
    RunAsOf:
      name: run-as-of
      in: header
      required: false
      description: Used to synthesize usage of date time in non prod environments.
      schema:
        $ref: '#/components/schemas/RunAsOf'
    Order:
      name: order
      in: query
      description: |
        The order in which to return the list objects.
        Default is `desc`, which returns objects in descending created_at order.
      schema:
        type: string
        enum:
          - desc
          - asc
        default: desc
    ProfilingTemplatesScope:
      name: scope
      in: query
      description: Filter templates by scope. If scope is not provided, both global and account templates will be returned.
      schema:
        type: string
        enum:
          - global
          - account
        example: account
    ProfilingTemplatesLocales:
      name: locales
      in: query
      description: |
        Comma-separated list of locales to filter templates by. If multiple locales are provided,
        templates that match any of the locales will be returned (OR logic).
      schema:
        type: string
        example:
          - eng_us
          - eng_us,jpn_jp
    ProfileTemplateID:
      name: profile_template_id
      in: path
      schema:
        $ref: '#/components/schemas/ProfileTemplateID'
      required: true
      description: The ID of the template.
    ProjectManagerIDFilter:
      name: project_manager_id
      in: query
      description: Project Manager ID filter query parameter.
      schema:
        $ref: '#/components/schemas/UserID'
    ProjectStatusFilter:
      name: status
      in: query
      description: Project Status filter query parameter.
      schema:
        $ref: '#/components/schemas/ProjectStatus'
    ProjectNameFilter:
      name: name
      in: query
      deprecated: true
      description: |
        Filter by the project name. This has been deprecated in favour of the `search_string` query parameter. If only `name` is supplied, it will be used as if `search_string` has been supplied. If both `name` and `search_string` are supplied, `name` will be ignored.
      schema:
        type: string
        example: Test Project
    ProjectSearchString:
      name: search_string
      in: query
      description: |
        Search for projects by the project's name, the project's human readable ID, or any of the human readable ID's of any of the target groups contained within the project.
      schema:
        type: string
        example: Test Project
    ProjectID:
      name: project_id
      description: The character string representing a unique project ID (ULID format).
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/ProjectID'
    JobID:
      name: job_id
      description: The character string representing a unique job ID.
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/JobID'
    TargetGroupExclusionStatus:
      name: exclusion_status
      in: query
      description: Only return target groups with the specified exclusion status.
      schema:
        type: boolean
        example: false
    TargetGroupName:
      name: name
      in: query
      deprecated: true
      description: |
        The (partial) name of the target group to match against. Supports partial and stemmed matching. This query parameter is deprecated and replaced by the `search_string` parameter. If only the `name` parameter is supplied, it will be used as if it was the `search_string`. If both `name` and `search_string` are supplied, `name` will be ignored.
      schema:
        type: string
        example: My Target Gr
    TargetGroupSearchString:
      name: search_string
      in: query
      description: |
        Search string to match against. The string will be used to search based on the target group's name and/or the target group's human readable ID. Supports partial matching for target group name and human readable ID. Also supports English language stemmed matching for target group name.
      schema:
        type: string
        example: My Target Gr
    TargetGroupHumanReadableIds:
      name: human_readable_ids
      in: query
      description: |
        An array of target group human readable ID's to filter by. When there are no other filter or search parameters supplied, the call will return a list of target groups that match these ID's.
      schema:
        type: array
        items:
          $ref: '#/components/schemas/TargetGroupHumanReadableID'
    TargetGroupStatus:
      name: status
      in: query
      description: Target Group status(es) to match against.
      schema:
        type: array
        items:
          $ref: '#/components/schemas/TargetGroupStatus'
    TargetGroupCountry:
      name: country
      in: query
      description: Target Group country or countries to match against.
      schema:
        type: array
        items:
          type: string
          pattern: ^[a-z]{2}$
  example: us
  TargetGroupLanguage:
  name: language
  in: query
  description: Target Group language(s) to match against.
  schema:
  type: array
  items:
  type: string
  pattern: ^[a-z]{3}$
          example: eng
    IdempotencyKey:
      name: idempotency-key
      in: header
      required: false
      description: A shallow unique ID that serves as a deduping mechanism. For mutable operations, this header is MANDATORY.
      schema:
        $ref: '#/components/schemas/IdempotencyKey'
    TargetGroupID:
      name: target_group_id
      description: The character string representing a unique target group ID (ULID format).
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/TargetGroupID'
    AggregationInterval:
      name: aggregation_interval
      description: An ISO-8601 formatted interval which is used to aggregate a time series.
      in: query
      schema:
        type: string
      example: P1DT5H
    IfNoneMatch:
      name: If-None-Match
      description: The `If-None-Match` header contains a string that identifies a  version state of a resource, represented as an `ETag` value.  It serves as a mechanism for optimistic locking, ensuring that a resource  is updated or deleted only if its current state does not match the specified  `ETag` value, thereby preventing unintended overwrites. Using `*` will match any version state.
      in: header
      schema:
        type: string
        format: etag
        example: 1
    FieldingRunID:
      name: fielding_run_id
      description: The character string representing a unique fielding run ID.
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/FieldingRunID'
    ProfileID:
      name: profile_id
      in: path
      required: true
      description: the unique ID of a profile
      schema:
        $ref: '#/components/schemas/ProfileID'
    TargetGroupFillingGoal:
      name: target_group_filling_goal
      in: query
      description: Prescribed filling goal for a target group
      required: true
      schema:
        type: integer
        example: 100
        minimum: 1
        maximum: 10000
    FileName:
      name: name
      in: query
      schema:
        $ref: '#/components/schemas/FileName'
    Status:
      in: query
      name: status
      schema:
        type: string
      description: The character string representing search based on reversal file status.
    SubmittedByUserID:
      in: query
      name: submitted_by_user_id
      schema:
        $ref: '#/components/schemas/UserID'
      description: Uniquely identifies a user.
    NextCursor:
      in: query
      name: next_cursor
      schema:
        $ref: '#/components/schemas/NextCursorULID'
    RequestID:
      name: request_id
      in: path
      required: true
      description: Request ID path parameter that uniquely identifies a reconciliation record.
      schema:
        $ref: '#/components/schemas/RequestID'
    parameters-TargetGroupID:
      name: target_group_id
      in: path
      required: true
      description: Target group ID path parameter that uniquely identifies a target group.
      schema:
        $ref: '#/components/schemas/TargetGroupID'
    SessionMonth:
      name: session_month
      in: query
      required: true
      description: Session month in YYYYMM format
      schema:
        type: string
        example: '202412'
    ReconTGName:
      name: name
      in: query
      required: false
      description: Filter by target group name
      schema:
        type: string
    ReconTGStatus:
      name: status
      in: query
      required: false
      description: Filter by target group status
      schema:
        type: string
    ReconProjectName:
      name: project_name
      in: query
      required: false
      description: Filter by project name
      schema:
        type: string
    ReconProjectManagerID:
      name: project_manager_id
      in: query
      required: false
      description: Filter by project manager ID
      schema:
        type: string
    Authorization:
      name: Authorization
      description: LAS access token containing LAS user id of requestor. Should be of form Bearer {{access token}}
      in: header
      required: true
      schema:
        $ref: '#/components/schemas/Authorization'
    ReportTypeQuery:
      name: report_type
      in: query
      required: false
      schema:
        $ref: '#/components/schemas/ReportType'
    ReportId:
      name: report_id
      in: path
      description: the unique ID of a report
      required: true
      schema:
        $ref: '#/components/schemas/ReportId'
    ReportType:
      name: report_type
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/ReportType'
    ReportFileName:
      name: file
      in: query
      required: true
      schema:
        $ref: '#/components/schemas/ReportFileName'
    QuestionSearchFilter:
      name: search
      in: query
      description: Search for a question by question name or text.
      schema:
        type: string
      example: Gender
    QuestionCategoryFilter:
      name: category_id
      in: query
      description: Filter by question category ID.
      schema:
        $ref: '#/components/schemas/QuestionCategoryID'
    QuestionScopeFilter:
      name: type
      in: query
      description: Filter by question scope.
      schema:
        $ref: '#/components/schemas/QuestionScope'
      example: custom
    QuestionsAccountID:
      name: account_id
      in: query
      description: The account id for the user
      required: true
      schema:
        $ref: '#/components/schemas/AccountID'
    QuestionsTranslationIDs:
      name: id
      in: query
      description: List of comma separated question IDs.
      schema:
        type: string
        example: 42,43,97
    QuestionsTranslationLocale:
      name: locale
      in: query
      description: Locale of target group in <language 1st 3 chars>_<country 2 char abbreviation> format.
      required: true
      schema:
        type: string
        example: eng_us
    QuestionsTranslationTranslationLanguage:
      name: translation_language
      in: query
      description: Request language to translate into.
      schema:
        type: string
        example: spa
    QuestionsTranslationQuery:
      name: query
      in: query
      description: Text filter on the results set.
      schema:
        type: string
        example: Filtering response elements by this text
    QuestionsTranslationLimit:
      name: limit
      in: query
      description: Limit number of questions returned in response.
      schema:
        type: integer
        default: 100
        example: 20
        minimum: 1
        maximum: 100
    QuestionsTranslationAllowCustomQuals:
      name: allow_custom_quals
      in: query
      description: Whether to include also custom qualifications.
      schema:
        type: boolean
        example: true
    QuestionsTranslationAllowForeignQuals:
      name: allow_foreign_quals
      in: query
      description: Parameter to allow borrowing qualifications from other locales, i.e. include questions of all locales.
      schema:
        type: boolean
        example: false
    QuestionsTranslationNoFilter:
      name: no_filter
      in: query
      description: Whether to skip filtering questions based on support from the model.
      schema:
        type: boolean
        example: true
    QuestionsTranslationStartAfter:
      name: start_after
      in: query
      description: Used for pagination to iterate to next page.
      schema:
        type: integer
        example: 42
    QuestionsTranslationEndBefore:
      name: end_before
      in: query
      description: Used for pagination to traverse to previous page.
      schema:
        type: integer
        example: 97
    QuestionsTranslationClassificationFilter:
      name: classification_filter
      in: query
      description: A comma separated list of classification codes to filter the results.
      schema:
        type: string
        example: DEM,HOM
    QuestionsTranslationModel:
      name: model
      in: query
      description: Selected model.
      schema:
        type: string
        example: profem
    QuestionsTranslationVersion:
      name: version
      in: query
      description: Selected model version.
      schema:
        type: string
        default: default
        example: beta
    QuestionID:
      name: question_id
      in: path
      required: true
      description: Question ID path parameter that uniquely identifies a question.
      schema:
        $ref: '#/components/schemas/QuestionID'
    ProfileIDV2:
      name: profile_id
      description: The character string representing a unique profile ID (ULID format).
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/ProfileIDV2'
    AllocationId:
      name: allocation_id
      description: Uniquely identifies a supply group allocation.
      in: path
      required: true
      schema:
        type: integer
        format: int32
        minimum: 0
        example: 101
  schemas:
    AccountsList:
      type: object
      description: A list of all accounts available for authenticated user.
      readOnly: true
      properties:
        accounts:
          type: array
          description: A list of user accounts.
          items:
            type: object
            properties:
              id:
                type: integer
                description: A unique identifier for an account.
              name:
                type: string
                description: The name of the account.
          example:
            - id: 1
              name: Acme Inc.
            - id: 2
              name: Globex Corp.
    Error:
      type: object
      description: An error is returned to inform the client that the API request failed.
      required:
        - object
        - detail
      properties:
        id:
          type: string
          format: uuid
          description: unique identifier of the error
        object:
          type: string
          description: A short informative string identifying the type of the error
          pattern: ^([a-z]*_)*([a-z]*)$
  detail:
  type: string
  description: An error message provides a concise overview of the cause of the error.
  AccountID:
  description: The account's unique identifier.
  type: integer
  format: int32
  example: 101
  BusinessUnit:
  type: object
  description: Business unit details.
  readOnly: true
  properties:
  id:
  type: integer
  description: Unique identifier of the business unit.
  example: 1234
  name:
  type: string
  description: Human readable name of the business unit.
  example: Example
  currency_code:
  type: string
  description: The business unit currency code.
  example: GBP
  pricing_models:
  type: array
  description: Contains available pricing models for the business unit.
  items:
  type: string
  description: Pricing model assigned to the business unit.
  enum: - rate_card - dynamic
  example: rate_card
  ClientListItem:
  type: object
  description: Client details.
  readOnly: true
  properties:
  id:
  type: integer
  description: Unique identifier of the client.
  example: 1234
  name:
  type: string
  description: Human readable name of the client.
  example: Acme Inc
  UserID:
  type: string
  format: uuid
  description: An unique identifier for a user.
  example: b551326b-ac9d-4d32-8823-4f025787dab9
  ServiceClientsList:
  type: object
  description: A list of all service clients for a specific account.
  readOnly: true
  properties:
  users:
  type: array
  description: A list of service clients.
  items:
  type: object
  properties:
  id:
  $ref: '#/components/schemas/UserID'
  email:
  type: string
  description: The email address of the service client.
  name:
  type: string
  description: The name of the service client.
  example: - id: 43292405-363e-4fa3-85a6-6e74a49fab2e
  email: jane.doe@cint.com
  name: Jane Doe - id: 54736158-e90e-404c-bc32-4d938f8a9cfa
  email: john.doe@cint.com
  name: John Doe
  UsersList:
  type: object
  description: A list of all users for a specific account.
  readOnly: true
  properties:
  users:
  type: array
  description: A list of users.
  items:
  type: object
  properties:
  id:
  $ref: '#/components/schemas/UserID'
  email:
  type: string
  description: The email address of the user.
  name:
  type: string
  description: The name of the user.
  example: - id: 43292405-363e-4fa3-85a6-6e74a49fab2e
  email: jane.doe@cint.com
  name: Jane Doe - id: 54736158-e90e-404c-bc32-4d938f8a9cfa
  email: john.doe@cint.com
  name: John Doe
  UserAccountBusinessUnit:
  type: object
  description: A response containing the business unit of the user's account.
  properties:
  business_unit_id:
  type: integer
  description: Unique identifier of the business unit.
  example: 1234
  WebhookID:
  type: string
  format: uuid
  description: The ID of the webhook.
  example: 7b8fe28a-7b60-4145-946b-fa1b68ae5de7
  WebhookURL:
  type: string
  format: url
  description: The URL of the webhook.
  example: https://example.com/webhook
  WebhookEvents:
  type: array
  description: A list of events that trigger the webhook.
  items:
  type: string
  description: Domain event that trigger webhook.
  enum: - survey_completed - survey_paused
  example: - survey_completed - survey_paused
  WebhookCreatedAt:
  type: string
  format: date-time
  description: The timestamp the webhook was updated at (RFC3339 UTC format, 3 fractional digits).
  example: '2023-01-01T23:00:00.000Z'
  Webhook:
  type: object
  description: A response containing the details of the webhook.
  properties:
  id:
  $ref: '#/components/schemas/WebhookID'
  url:
  $ref: '#/components/schemas/WebhookURL'
  events:
  $ref: '#/components/schemas/WebhookEvents'
  created_at:
  $ref: '#/components/schemas/WebhookCreatedAt'
  updated_at:
  $ref: '#/components/schemas/WebhookCreatedAt'
  NextCursor:
  description: |
  An ID of the next list of items and indicator
  that there are more items than currently viewable.
  type: string
  nullable: true
  example: bff6a669-a469-409d-8c94-dcf92258043a
  WebhooksList:
  type: object
  description: A list of all webhooks for a specific account.
  properties:
  webhooks:
  type: array
  description: A list of webhooks.
  items:
  $ref: '#/components/schemas/Webhook'
  next_cursor:
  $ref: '#/components/schemas/NextCursor'
  invalid_param:
  type: object
  properties:
  name:
  type: string
  reason:
  type: string
  required: - name - reason
  InvalidParametersError:
  type: object
  description: An error with information regarding fields that are not valid.
  required: - invalid_params
  properties:
  invalid_params:
  type: array
  items:
  $ref: '#/components/schemas/invalid_param'
  InvalidParamsBadRequestError:
  type: object
  description: An error with information regarding fields that are not valid.
  allOf: - $ref: '#/components/schemas/Error' - $ref: '#/components/schemas/InvalidParametersError'
  WebhookSecret:
  type: string
  format: base64
  description: |-
  The secret key used to sign the payload of webhook calls. This key enables the webhook consumer
  to verify the authenticity of the webhook request. The secret is a 32-byte randomly generated value, Base64-encoded.

                                                Each webhook request includes a `Cint-Signature` header with two components:
                                                - `t` (timestamp): A Unix timestamp representing the time of the webhook call.
                                                - `v1` (signature v1): An HMAC SHA256 hash of the payload, generated by signing it with the secret key.

                                                The payload used to create the signature is the concatenation of the timestamp (`t`) and the request body, separated by a period (`.`). For example:
                                                - Payload: `1732526080.{"foo":"bar"}`

                                                Example of `Cint-Signature` header:

                                                ```
                                                Cint-Signature: t=1732526080,v1=6532d4777122acc32cd388763fc0c0ba8732698d09cf99eea086e5a86f8d3ebe
                                                ```

                                                To verify the signature, you can use the following CLI command:

                                                ```
                                                $ PAYLOAD='1732526080.{"foo":"bar"}'
                                                $ SECRET=FP7UPZpATKBcYJj4va95PYud+a3gCidRERiLO+9MoFE=
                                                $ echo -n $PAYLOAD | openssl dgst -sha256 -hmac $SECRET
                                                # => (stdin)= 6532d4777122acc32cd388763fc0c0ba8732698d09cf99eea086e5a86f8d3ebe
                                                ```
                                              example: FP7UPZpATKBcYJj4va95PYud+a3gCidRERiLO+9MoFE=
                                            WebhookUpdatedAt:
                                              type: string
                                              format: date-time
                                              description: The timestamp the webhook was updated at (RFC3339 UTC format, 3 fractional digits).
                                              example: '2023-01-01T23:00:00.000Z'
                                            WebhookCreated:
                                              type: object
                                              description: A response containing the details of the webhook.
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/WebhookID'
                                                url:
                                                  $ref: '#/components/schemas/WebhookURL'
                                                events:
                                                  $ref: '#/components/schemas/WebhookEvents'
                                                secret:
                                                  $ref: '#/components/schemas/WebhookSecret'
                                                created_at:
                                                  $ref: '#/components/schemas/WebhookCreatedAt'
                                                updated_at:
                                                  $ref: '#/components/schemas/WebhookUpdatedAt'
                                            ETag:
                                              type: string
                                              description: The `ETag` header provides a unique identifier, that represents the current version state of a particular resource.
                                              example: W/"1234"
                                            IdempotencyKey:
                                              type: string
                                              description: |-
                                                A shallow unique ID that serves as a deduping mechanism. For mutable operations, this header is MANDATORY.
                                                We suggest using UUIDv4, or another random string with enough entropy to avoid collisions.
                                              maxLength: 255
                                              example:
                                                - 96C65204-90C2-4DCB-9393-B8226DD50C76
                                                - 01BTGNYV6HRNK8K8VKZASZCFP0
                                            WebhookSecretRegenerated:
                                              type: object
                                              description: A response containing the details of the webhook.
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/WebhookID'
                                                url:
                                                  $ref: '#/components/schemas/WebhookURL'
                                                events:
                                                  $ref: '#/components/schemas/WebhookEvents'
                                                secret:
                                                  $ref: '#/components/schemas/WebhookSecret'
                                                created_at:
                                                  $ref: '#/components/schemas/WebhookCreatedAt'
                                                updated_at:
                                                  $ref: '#/components/schemas/WebhookUpdatedAt'
                                            WebhookListEvents:
                                              type: object
                                              description: A response containing a list of valid events for webhooks.
                                              properties:
                                                events:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: Name of the event that is valid for a webhook type notification.
                                            CountryListItem:
                                              type: object
                                              description: Country details.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: integer
                                                  description: Unique identifier of the country.
                                                  example: 243
                                                code:
                                                  type: string
                                                  description: Unique text code of the country.
                                                  example: GB
                                                name:
                                                  type: string
                                                  description: Human readable name of the country.
                                                  example: United Kingdom
                                            Traceparent:
                                              type: string
                                              description: The traceparent header carries essential trace context information. This includes the trace ID and parent span ID  as defined by the W3C trace context specification. It is used to pinpoint the position of an incoming request within  the trace graph, facilitating the tracking of distributed operations.
                                              example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
                                            Tracestate:
                                              type: string
                                              description: The tracestate header provides additional contextual information to the traceparent header.  This enriches the tracing context and offers more fine-grained control
                                              example: ot=foo:bar;k1:13
                                            TemplateID:
                                              type: string
                                              description: A unique identifier for the template.
                                              format: uuid
                                              example: 12345678-1234-1234-1234-123456789012
                                            GetAccountAllocationTemplateAssociation:
                                              type: object
                                              title: Account allocation template association.
                                              required:
                                                - template_id
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                            UpdateAccountAllocationTemplateAssociation:
                                              type: object
                                              title: Set account allocation template association request object.
                                              required:
                                                - template_id
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                            LastModifiedAt:
                                              type: string
                                              format: datetime
                                              description: The last time the template was modified
                                              example: '2024-06-18T14:23:45Z'
                                            AccountAllocationTemplateListItem:
                                              type: object
                                              title: Account allocation template list item.
                                              required:
                                                - template_id
                                                - name
                                                - last_modified_at
                                                - last_modified_by
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                                name:
                                                  type: string
                                                  description: The name of the account allocation template.
                                                last_modified_at:
                                                  $ref: '#/components/schemas/LastModifiedAt'
                                                last_modified_by:
                                                  $ref: '#/components/schemas/UserID'
                                            ListAccountAllocationTemplatesResponse:
                                              type: object
                                              required:
                                                - has_more
                                                - templates
                                                - next_cursor
                                              properties:
                                                templates:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/AccountAllocationTemplateListItem'
                                                has_more:
                                                  type: boolean
                                                  description: If there are further results to be shown using the returned next cursor or previous cursor, this will be true, otherwise false.
                                                next_cursor:
                                                  type: string
                                                  description: Provides the string to use as the "start_after" value of the next request. Empty value if no further results.
                                            IdempotencyKeyULID:
                                              description: A shallow unique ID that serves as a deduplication mechanism  For mutable operations.
                                              type: string
                                              format: ulid
                                              example: 01JCDRR74NW2SSGN567A766VAN
                                            AllocationTemplateExchangeSupplier:
                                              type: object
                                              title: Exchange
                                              required:
                                                - type
                                                - percentage_max
                                                - percentage_min
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `exchange`.
                                                  enum:
                                                    - exchange
                                                percentage_max:
                                                  type: integer
                                                  nullable: false
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the maximum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 90
                                                percentage_min:
                                                  type: integer
                                                  nullable: true
                                                  description: Controls the minimum amount of fills from this supply allocation group. The value is `inclusive`
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 0
                                            AllocationTemplateSupplier:
                                              type: object
                                              required:
                                                - supplier_id
                                              properties:
                                                supplier_id:
                                                  type: integer
                                                  description: The ID of the supplier
                                                  minimum: 0
                                                  example: 420
                                            AllocationTemplateGroupSupplier:
                                              type: object
                                              title: Group
                                              required:
                                                - type
                                                - name
                                                - percentage_min
                                                - percentage_max
                                                - suppliers
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `group`.
                                                  enum:
                                                    - group
                                                name:
                                                  type: string
                                                  example: My happy allocation group
                                                percentage_max:
                                                  type: integer
                                                  nullable: false
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the maximum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 90
                                                percentage_min:
                                                  type: integer
                                                  nullable: true
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the minimum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 0
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/AllocationTemplateSupplier'
                                            AllocationTemplateBlockedSupplier:
                                              type: object
                                              title: Blocked
                                              required:
                                                - type
                                                - suppliers
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `blocked`.
                                                  enum:
                                                    - blocked
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/AllocationTemplateSupplier'
                                            AllocationTemplateCreateRequest:
                                              type: object
                                              required:
                                                - name
                                                - supply_allocations
                                              properties:
                                                name:
                                                  type: string
                                                  minLength: 3
                                                  maxLength: 128
                                                supply_allocations:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/AllocationTemplateExchangeSupplier'
                                                    - $ref: '#/components/schemas/AllocationTemplateGroupSupplier'
                                                    - $ref: '#/components/schemas/AllocationTemplateBlockedSupplier'
                                            LocaleCode:
                                              type: string
                                              description: Unique text code of the locale.
                                              example: eng_us
                                            TemplateSupplierResponse:
                                              type: object
                                              properties:
                                                supplier_id:
                                                  type: integer
                                                  description: The ID of the supplier
                                                  minimum: 0
                                                  example: 420
                                                name:
                                                  type: string
                                                  description: The name of the supplier.
                                                  minLength: 1
                                                  example: Clix Sense
                                                type:
                                                  type: string
                                                  description: The type of the supplier.
                                                  example: loyalty_panels
                                                  enum:
                                                    - loyalty_panels
                                                    - non_panel_or_affiliate
                                                    - survey_panels
                                            responses-AllocationTemplateExchangeSupplier:
                                              type: object
                                              title: Exchange
                                              required:
                                                - type
                                                - percentage_max
                                                - percentage_min
                                                - suppliers
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `exchange`.
                                                  enum:
                                                    - exchange
                                                percentage_max:
                                                  type: integer
                                                  nullable: false
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the maximum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 44
                                                percentage_min:
                                                  type: integer
                                                  nullable: true
                                                  description: Controls the minimum amount of fills from this supply allocation group. The value is `inclusive`
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 78
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TemplateSupplierResponse'
                                            responses-AllocationTemplateGroupSupplier:
                                              type: object
                                              title: Group
                                              required:
                                                - type
                                                - name
                                                - percentage_min
                                                - percentage_max
                                                - suppliers
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `group`.
                                                  enum:
                                                    - group
                                                name:
                                                  type: string
                                                  example: My happy allocation group
                                                percentage_max:
                                                  type: integer
                                                  nullable: false
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the maximum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 44
                                                percentage_min:
                                                  type: integer
                                                  nullable: true
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Controls the minimum amount of fills from this supply allocation group. The value is `inclusive`.
                                                  example: 78
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TemplateSupplierResponse'
                                            responses-AllocationTemplateBlockedSupplier:
                                              type: object
                                              title: Blocked
                                              required:
                                                - type
                                                - suppliers
                                              properties:
                                                type:
                                                  type: string
                                                  description: object field to distinguish between different types of supply allocations. always is `blocked`.
                                                  enum:
                                                    - blocked
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TemplateSupplierResponse'
                                            GetAccountAllocationTemplateByTemplateIdResponse:
                                              type: object
                                              required:
                                                - template_id
                                                - name
                                                - supply_allocations
                                                - last_modified_at
                                                - last_modified_by
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                                name:
                                                  type: string
                                                  description: The name of the account allocation template.
                                                supply_allocations:
                                                  type: array
                                                  items:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateExchangeSupplier'
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateGroupSupplier'
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateBlockedSupplier'
                                                last_modified_at:
                                                  $ref: '#/components/schemas/LastModifiedAt'
                                                last_modified_by:
                                                  $ref: '#/components/schemas/UserID'
                                            AllocationTemplateUpdateRequest:
                                              type: object
                                              required:
                                                - name
                                                - supply_allocations
                                              properties:
                                                name:
                                                  type: string
                                                  minLength: 3
                                                  maxLength: 128
                                                supply_allocations:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/AllocationTemplateExchangeSupplier'
                                                    - $ref: '#/components/schemas/AllocationTemplateGroupSupplier'
                                                    - $ref: '#/components/schemas/AllocationTemplateBlockedSupplier'
                                            BusinessUnitID:
                                              type: string
                                              description: Determines the currency used for the Target Group.
                                              example: '1234'
                                            SupplierInfo:
                                              type: object
                                              properties:
                                                supplier_id:
                                                  type: string
                                                  example: '13512'
                                                supplier_name:
                                                  type: string
                                                  example: Test supplier
                                            OpenExchangeAllocationGroup:
                                              type: object
                                              properties:
                                                group_name:
                                                  type: string
                                                  example: Test group
                                                min_percentage:
                                                  type: integer
                                                  example: 0
                                                max_percentage:
                                                  type: integer
                                                  example: 100
                                                suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/SupplierInfo'
                                            OpenExchangeAllocations:
                                              type: object
                                              properties:
                                                exchange_suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/SupplierInfo'
                                                blocked_suppliers:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/SupplierInfo'
                                                exchange_min_percentage:
                                                  type: integer
                                                  example: 0
                                                exchange_max_percentage:
                                                  type: integer
                                                  example: 100
                                                groups:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/OpenExchangeAllocationGroup'
                                            RateCard:
                                              type: object
                                              description: The CPI is derived from the rate card (also known as the pricing table), using the Estimated Length of Interview (LOI) and Incidence Rate (IR) of your Target Group. It will include the Initial Volume Discount if your Project qualifies for one.
                                              required:
                                                - country_code
                                                - token
                                                - rate_card_data
                                              properties:
                                                country_code:
                                                  type: string
                                                  description: String representing the country code.
                                                  example: US
                                                token:
                                                  type: string
                                                  description: Rate card token.
                                                  example: UkNUPUNPVU5UUlk6UkNWPTE2OkNDPVVT
                                                rate_card_data:
                                                  type: object
                                                  properties:
                                                    data_format:
                                                      type: string
                                                      enum:
                                                        - loi_ir_matrix
                                                      example: loi_ir_matrix
                                                    length_of_interview_minutes:
                                                      type: array
                                                      minItems: 1
                                                      items:
                                                        type: number
                                                        format: int32
                                                        minimum: 1
                                                      example:
                                                        - 3
                                                        - 6
                                                        - 10
                                                        - 15
                                                        - 20
                                                        - 25
                                                        - 30
                                                        - 35
                                                        - 40
                                                        - 45
                                                        - 50
                                                        - 55
                                                        - 60
                                                    incidence_rate_percents:
                                                      type: array
                                                      minItems: 1
                                                      items:
                                                        type: number
                                                        format: int32
                                                        minimum: 0
                                                        maximum: 100
                                                      example:
                                                        - 75
                                                        - 50
                                                        - 30
                                                        - 20
                                                        - 15
                                                        - 10
                                                        - 7
                                                        - 5
                                                        - 3
                                                        - 1
                                                    pricing_table_currency_code:
                                                      type: string
                                                      description: Represents the currency code for the pricing table.
                                                      example: USD
                                                    pricing_table_data:
                                                      type: array
                                                      minItems: 1
                                                      items:
                                                        type: array
                                                        minItems: 1
                                                        items:
                                                          type: number
                                                          format: int
                                                          minimum: 0
                                                      example:
                                                        - - 320
                                                          - 373
                                                          - 495
                                                          - 670
                                                          - 898
                                                          - 1248
                                                          - 1895
                                                          - 2770
                                                          - 3470
                                                          - 4695
                                                        - - 374
                                                          - 427
                                                          - 549
                                                          - 724
                                                          - 952
                                                          - 1302
                                                          - 1949
                                                          - 2824
                                                          - 3524
                                                          - 4749
                                                        - - 434
                                                          - 487
                                                          - 609
                                                          - 784
                                                          - 1012
                                                          - 1362
                                                          - 2009
                                                          - 2884
                                                          - 3584
                                                          - 4809
                                                        - - 494
                                                          - 547
                                                          - 669
                                                          - 844
                                                          - 1072
                                                          - 1422
                                                          - 2069
                                                          - 2944
                                                          - 3644
                                                          - 4869
                                                        - - 554
                                                          - 607
                                                          - 729
                                                          - 904
                                                          - 1132
                                                          - 1482
                                                          - 2129
                                                          - 3004
                                                          - 3704
                                                          - 4929
                                                        - - 614
                                                          - 667
                                                          - 789
                                                          - 964
                                                          - 1192
                                                          - 1542
                                                          - 2189
                                                          - 3064
                                                          - 3764
                                                          - 4989
                                                        - - 739
                                                          - 791
                                                          - 914
                                                          - 1089
                                                          - 1316
                                                          - 1666
                                                          - 2314
                                                          - 3189
                                                          - 3889
                                                          - 5114
                                                        - - 849
                                                          - 902
                                                          - 1024
                                                          - 1199
                                                          - 1427
                                                          - 1777
                                                          - 2424
                                                          - 3299
                                                          - 3999
                                                          - 5224
                                                        - - 972
                                                          - 1024
                                                          - 1147
                                                          - 1322
                                                          - 1549
                                                          - 1899
                                                          - 2547
                                                          - 3422
                                                          - 4122
                                                          - 5347
                                                        - - 1056
                                                          - 1108
                                                          - 1231
                                                          - 1406
                                                          - 1633
                                                          - 1983
                                                          - 2631
                                                          - 3506
                                                          - 4206
                                                          - 5431
                                                        - - 1140
                                                          - 1192
                                                          - 1315
                                                          - 1490
                                                          - 1717
                                                          - 2067
                                                          - 2715
                                                          - 3590
                                                          - 4290
                                                          - 5515
                                                        - - 1224
                                                          - 1276
                                                          - 1399
                                                          - 1574
                                                          - 1801
                                                          - 2151
                                                          - 2799
                                                          - 3674
                                                          - 4374
                                                          - 5599
                                                        - - 1308
                                                          - 1360
                                                          - 1483
                                                          - 1658
                                                          - 1885
                                                          - 2235
                                                          - 2883
                                                          - 3758
                                                          - 4458
                                                          - 5683
                                            IsSyntheticTraffic:
                                              type: boolean
                                              default: false
                                              description: Boolean value representing whether request is the product of synthetic traffic. By default, set to false.
                                            RunAsOf:
                                              type: integer
                                              description: Used to synthesize usage of date time in non prod environments.
                                            QuestionID:
                                              type: integer
                                              description: Question identifier
                                              example: 12413
                                            ApplyProfileRangedConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `range_conditions_details`.
                                                  enum:
                                                    - range_conditions_details
                                                  example: range_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                      min:
                                                        type: integer
                                                      max:
                                                        type: integer
                                                    required:
                                                      - text
                                                      - min
                                                      - max
                                            ApplyProfileSelectionsConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `selection_conditions_details`.
                                                  enum:
                                                    - selection_conditions_details
                                                  example: selection_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                      option:
                                                        type: string
                                                    required:
                                                      - text
                                                      - option
                                            ApplyProfileZipConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `zip_conditions_details`.
                                                  enum:
                                                    - zip_conditions_details
                                                  example: zip_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      zip_codes:
                                                        type: array
                                                        items:
                                                          type: string
                                                      allow_all_zip:
                                                        type: boolean
                                                    required:
                                                      - zip_codes
                                                      - allow_all_zip
                                            ApplyProfileRequestUngroupedQuota:
                                              type: object
                                              properties:
                                                index:
                                                  type: integer
                                                quota_percentage:
                                                  type: integer
                                                quota_nominal:
                                                  type: integer
                                              required:
                                                - index
                                                - quota_percentage
                                                - quota_nominal
                                            ApplyProfileRequestGroupedQuota:
                                              type: object
                                              properties:
                                                indexes:
                                                  type: array
                                                  items:
                                                    type: integer
                                                name:
                                                  type: string
                                                quota_percentage:
                                                  type: integer
                                                quota_nominal:
                                                  type: integer
                                              required:
                                                - indexes
                                                - name
                                                - quota_percentage
                                                - quota_nominal
                                            ApplyProfileRequestQuotas:
                                              type: object
                                              properties:
                                                ungrouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ApplyProfileRequestUngroupedQuota'
                                                grouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ApplyProfileRequestGroupedQuota'
                                              required:
                                                - ungrouped
                                                - grouped
                                            GenerateDraftInterlockRequest:
                                              type: object
                                              properties:
                                                locale:
                                                  type: string
                                                target_group_filling_goal:
                                                  type: integer
                                                profile_adjustment_type:
                                                  type: string
                                                start_at:
                                                  type: string
                                                  description: Starting timestamp of the suggested time range.
                                                  format: date-time
                                                  example: '2024-12-31T23:59:59.990Z'
                                                end_at:
                                                  type: string
                                                  description: Ending timestamp of the suggested time range.
                                                  format: date-time
                                                  example: '2025-12-31T23:59:59.992Z'
                                                collects_pii:
                                                  type: boolean
                                                  example: true
                                                profiles:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      question_id:
                                                        $ref: '#/components/schemas/QuestionID'
                                                      name:
                                                        type: string
                                                      quotas_enabled:
                                                        type: boolean
                                                      conditions:
                                                        oneOf:
                                                          - $ref: '#/components/schemas/ApplyProfileRangedConditions'
                                                          - $ref: '#/components/schemas/ApplyProfileSelectionsConditions'
                                                          - $ref: '#/components/schemas/ApplyProfileZipConditions'
                                                      quotas:
                                                        $ref: '#/components/schemas/ApplyProfileRequestQuotas'
                                            ApplyProfileResponseConditionDetail:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                text:
                                                  type: string
                                                text_translated:
                                                  type: string
                                                min:
                                                  type: integer
                                                max:
                                                  type: integer
                                                option:
                                                  type: string
                                                zip_codes:
                                                  type: array
                                                  items:
                                                    type: string
                                                allow_all_zip:
                                                  type: boolean
                                              required:
                                                - id
                                                - text
                                                - text_translated
                                                - min
                                                - max
                                                - option
                                                - zip_codes
                                                - allow_all_zip
                                            ApplyProfileResponseConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                  enum:
                                                    - range_conditions_details
                                                    - selection_conditions_details
                                                    - zip_conditions_details
                                                  example: range_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ApplyProfileResponseConditionDetail'
                                            DraftProfileResponseUngroupedQuota:
                                              type: object
                                              properties:
                                                index:
                                                  type: integer
                                                quota_percentage:
                                                  type: integer
                                                quota:
                                                  type: integer
                                                filling_goal:
                                                  type: integer
                                              required:
                                                - index
                                                - quota_percentage
                                                - quota
                                                - filling_goal
                                            DraftProfileResponseGroupedQuota:
                                              type: object
                                              properties:
                                                name:
                                                  type: string
                                                indexes:
                                                  type: array
                                                  items:
                                                    type: integer
                                                quota_percentage:
                                                  type: integer
                                                quota:
                                                  type: integer
                                                filling_goal:
                                                  type: integer
                                                prescreens:
                                                  type: integer
                                                completes:
                                                  type: integer
                                              required:
                                                - name
                                                - indexes
                                                - quota_percentage
                                                - quota
                                                - filling_goal
                                            DraftProfileResponseQuotas:
                                              type: object
                                              properties:
                                                ungrouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/DraftProfileResponseUngroupedQuota'
                                                grouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/DraftProfileResponseGroupedQuota'
                                              required:
                                                - ungrouped
                                                - grouped
                                            DraftInterlockProfilesResponse:
                                              type: array
                                              description: Array of interlocked profiles.
                                              items:
                                                type: object
                                                properties:
                                                  id:
                                                    type: string
                                                    description: Unique identifier of interlocked profile
                                                    example: 01J82QX46HS1QBAG8D14KBQP26
                                                  name:
                                                    type: string
                                                    description: Name of the interlocked Profile
                                                    example: GENDER, AGE
                                                  quotas_enabled:
                                                    type: boolean
                                                    description: Denotes whether quotas are enabled. For generate draft interlock, this will be defaulted to true.
                                                    example: true
                                                  depends_on_questions:
                                                    type: array
                                                    description: Array of question id's used to create interlocked profile. First element is considered as parent profile.
                                                    items:
                                                      type: integer
                                                  quotas:
                                                    type: object
                                                    description: Quotas for interlocked profile.
                                                    properties:
                                                      ungrouped:
                                                        type: array
                                                        description: Array of ungrouped quotas which relate to interlock condition
                                                        items:
                                                          type: object
                                                          properties:
                                                            id:
                                                              type: string
                                                              format: ulid
                                                              description: Unique identifier to represent quota
                                                              example: 01J82QX46HS1QBAG8D14KBQP2D
                                                            quota_percentage:
                                                              type: integer
                                                              example: 9
                                                            quota:
                                                              type: number
                                                              example: 906
                                                            filling_goal:
                                                              type: number
                                                              example: 906
                                                            condition:
                                                              type: object
                                                              properties:
                                                                id:
                                                                  type: string
                                                                  format: ulid
                                                                  description: Unique identifier to represent condition
                                                                  example: 01J82QX46HS1QBAG8D14KBQP2D
                                                                text:
                                                                  type: string
                                                                  example: 15-19, Male
                                                                translated_text:
                                                                  type: string
                                                                  example: 15-19, Male
                                                                option:
                                                                  type: string
                                                                  example: '1'
                                                  profiles:
                                                    type: array
                                                    items:
                                                      type: object
                                                      properties:
                                                        id:
                                                          type: string
                                                          description: Profile identifier
                                                          example: '1000'
                                                        question_id:
                                                          type: integer
                                                          description: the identifier for the underlying question from the profiling library
                                                          example: 42
                                                        name:
                                                          type: string
                                                          description: the name of the profile
                                                          example: AGE
                                                        description:
                                                          type: string
                                                          description: a short summary of the profile
                                                          example: What is your age?
                                                        translated_description:
                                                          type: string
                                                          description: translated description of question
                                                          example: string
                                                        conditions:
                                                          $ref: '#/components/schemas/ApplyProfileResponseConditions'
                                                        quotas:
                                                          $ref: '#/components/schemas/DraftProfileResponseQuotas'
                                            BadRequestErrorResponseDemographics:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                                invalid_params:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                      reason:
                                                        type: string
                                                    required:
                                                      - name
                                                      - reason
                                              required:
                                                - object
                                                - detail
                                            UnauthorizedErrorResponseDemographics:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                            ForbiddenErrorResponseDemographics:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                            NotFoundErrorResponseDemographics:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                            InternalErrorResponseDemographics:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                                errors:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                      reason:
                                                        type: string
                                                    required:
                                                      - name
                                                      - reason
                                              required:
                                                - object
                                                - detail
                                            PanelDistributionDraftRequest:
                                              type: object
                                              description: Panel distribution prediction request.
                                              properties:
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                start_at:
                                                  title: The Target Group start date
                                                  type: string
                                                  format: date-time
                                                  example: '2023-10-09T12:00:00Z'
                                                end_at:
                                                  title: The Target Group end date
                                                  type: string
                                                  format: date-time
                                                  example: '2023-10-09T12:00:00Z'
                                                profile:
                                                  type: object
                                                  description: The profile details contain a question ID and conditions for which the panel distribution is to be obtained.
                                                  properties:
                                                    question_id:
                                                      $ref: '#/components/schemas/QuestionID'
                                                    conditions:
                                                      oneOf:
                                                        - type: object
                                                          properties:
                                                            object:
                                                              type: string
                                                              description: Differentiates between various condition types. In the case of Range Conditions, it is always  `range_conditions`.
                                                              enum:
                                                                - range_conditions
                                                              example: range_conditions
                                                            data:
                                                              type: array
                                                              items:
                                                                type: object
                                                                properties:
                                                                  min:
                                                                    type: integer
                                                                    description: The minimum numeric value (inclusive).
                                                                    example: 18
                                                                  max:
                                                                    type: integer
                                                                    description: The maximum numeric value (inclusive).
                                                                    example: 24
                                                        - type: object
                                                          properties:
                                                            object:
                                                              type: string
                                                              description: Differentiates between various condition types. In the case of Selection Conditions, it is always `selection_conditions`.
                                                              enum:
                                                                - selection_conditions
                                                              example: selection_conditions
                                                            data:
                                                              type: array
                                                              items:
                                                                type: string
                                                                description: ID of the selections
                                                          example:
                                                            object: selection_conditions
                                                            data:
                                                              - '1'
                                                              - '2'
                                                              - '3'
                                                    quotas:
                                                      $ref: '#/components/schemas/ApplyProfileRequestQuotas'
                                                  required:
                                                    - conditions
                                              required:
                                                - locale
                                                - start_at
                                                - end_at
                                            ApplyProfileResponseUngroupedQuota:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                conditions:
                                                  type: array
                                                  items:
                                                    type: string
                                                quota:
                                                  type: integer
                                                filling_goal:
                                                  type: integer
                                                prescreens:
                                                  type: integer
                                                completes:
                                                  type: integer
                                              required:
                                                - id
                                                - conditions
                                                - quota
                                                - filling_goal
                                                - prescreens
                                                - completes
                                            ApplyProfileResponseGroupedQuota:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                name:
                                                  type: string
                                                conditions:
                                                  type: array
                                                  items:
                                                    type: string
                                                quota:
                                                  type: integer
                                                filling_goal:
                                                  type: integer
                                                prescreens:
                                                  type: integer
                                                completes:
                                                  type: integer
                                              required:
                                                - id
                                                - name
                                                - conditions
                                                - quota
                                                - filling_goal
                                                - prescreens
                                                - completes
                                            ApplyProfileResponseQuotas:
                                              type: object
                                              properties:
                                                ungrouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ApplyProfileResponseUngroupedQuota'
                                                grouped:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ApplyProfileResponseGroupedQuota'
                                              required:
                                                - ungrouped
                                                - grouped
                                            ApplyProfilesResponse:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  description: Array of profiles
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: string
                                                        description: Profile identifier
                                                        example: '1000'
                                                      question_id:
                                                        type: integer
                                                        description: the identifier for the underlying question from the profiling library
                                                        example: 42
                                                      name:
                                                        type: string
                                                        description: the name of the profile
                                                        example: AGE
                                                      description:
                                                        type: string
                                                        description: a short summary of the profile
                                                        example: What is your age?
                                                      translated_description:
                                                        type: string
                                                        description: translated description of question
                                                        example: string
                                                      conditions:
                                                        $ref: '#/components/schemas/ApplyProfileResponseConditions'
                                                      quotas:
                                                        $ref: '#/components/schemas/ApplyProfileResponseQuotas'
                                            ClientErrorDemandAPI:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                title:
                                                  type: string
                                                detail:
                                                  type: string
                                                invalid_params:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                      reason:
                                                        type: string
                                                    required:
                                                      - name
                                                      - reason
                                                instance:
                                                  type: string
                                                type:
                                                  type: string
                                              required:
                                                - object
                                                - detail
                                            InternalErrorDemandAPI:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                detail:
                                                  type: string
                                                errors:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                      reason:
                                                        type: string
                                                    required:
                                                      - name
                                                      - reason
                                              required:
                                                - object
                                                - detail
                                            ProfileTemplateID:
                                              type: string
                                              description: A unique identifier for the template.
                                              format: uuid
                                              example: 12345678-1234-1234-1234-123456789012
                                            ProfileTemplateScopeless:
                                              type: object
                                              properties:
                                                name:
                                                  type: string
                                                  description: A name for the template.
                                                  example: My Template
                                                description:
                                                  type: string
                                                  description: A description for the template.
                                                  example: My Template Description
                                                label:
                                                  type: string
                                                  description: A label for the template.
                                                  example: My Template Label
                                                locales:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/LocaleCode'
                                            ProfileTemplateOverview:
                                              allOf:
                                                - $ref: '#/components/schemas/ProfileTemplateScopeless'
                                                - properties:
                                                    scope:
                                                      type: string
                                                      description: |-
                                                        The scope of the profiling templates. Can be either `global` or `account`.
                                                        - global: The profiling templates are common for all accounts. - account: The profiling templates are available only for the endpoint account.
                                                      enum:
                                                        - global
                                                        - account
                                                      example: global
                                            ProfileTemplateListItem:
                                              type: object
                                              allOf:
                                                - properties:
                                                    id:
                                                      $ref: '#/components/schemas/ProfileTemplateID'
                                                - $ref: '#/components/schemas/ProfileTemplateOverview'
                                            ProfileTemplatesList:
                                              type: object
                                              properties:
                                                templates:
                                                  type: array
                                                  description: List of templates items.
                                                  items:
                                                    $ref: '#/components/schemas/ProfileTemplateListItem'
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                            RegularProfileRangeConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `range_conditions_details_template`.
                                                  enum:
                                                    - range_conditions_details_template
                                                  example: range_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                                      min:
                                                        type: integer
                                                        description: The minimum numeric value (inclusive).
                                                      max:
                                                        type: integer
                                                        description: The maximum numeric value (inclusive).
                                              example:
                                                object: range_conditions_details_template
                                                data:
                                                  - text: 18 to 24 years old
                                                    min: 18
                                                    max: 24
                                                  - text: 25 to 35 years old
                                                    min: 25
                                                    max: 35
                                                  - text: 36 to 46 years old
                                                    min: 36
                                                    max: 45
                                            SelectionConditionItem:
                                              type: object
                                              properties:
                                                option:
                                                  type: string
                                                  description: |
                                                    The number option for the answer of the question
                                                    relating to the condition.
                                              example:
                                                option: '-73'
                                            RegularProfileSelectionConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `selection_conditions_details_template`.
                                                  enum:
                                                    - selection_conditions_details_template
                                                  example: selection_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/SelectionConditionItem'
                                            ZipConditionItem:
                                              type: object
                                              properties:
                                                zip_codes:
                                                  type: array
                                                  description: |
                                                    The number option for the answer of the question
                                                    relating to the condition.
                                                  items:
                                                    type: string
                                                allow_all_zip:
                                                  type: boolean
                                                  description: |
                                                    If true, the profile will allow all zip codes. If false,
                                                    the profile will only allow the zip codes specified in the data field.
                                                  example: true
                                              example:
                                                zip_codes:
                                                  - '40202'
                                                  - '50309'
                                                allow_all_zip: false
                                            RegularProfileZipConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `zip_conditions_details_template`.
                                                  enum:
                                                    - zip_conditions_details_template
                                                  example: zip_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ZipConditionItem'
                                            SingularRegularQuotaTemplate:
                                              type: object
                                              properties:
                                                index:
                                                  type: integer
                                                  description: The index of the condition as reference to the item from the list of conditions.
                                                  minimum: 0
                                                  example: 0
                                                quota_percentage:
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                                  description: The quota percentage for the template.
                                                  example: 40
                                            GroupedRegularQuotaTemplate:
                                              type: object
                                              properties:
                                                indexes:
                                                  type: array
                                                  description: The indexes of the condition as reference to the item from the list of conditions.
                                                  items:
                                                    type: integer
                                                    minimum: 0
                                                  example:
                                                    - 1
                                                    - 2
                                                name:
                                                  type: string
                                                  description: The name of the group of conditions.
                                                  maxLength: 64
                                                  example: Group 1
                                                quota_percentage:
                                                  type: integer
                                                  description: The quota percentage for the template.
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 40
                                            TemplateRegularProfiles:
                                              type: array
                                              description: List of regular profiles.
                                              items:
                                                type: object
                                                properties:
                                                  question_id:
                                                    type: integer
                                                    description: The identifier for the underlying question from the profiling library.
                                                    example: 42
                                                  name:
                                                    type: string
                                                    description: The name of the profile.
                                                    example: Age
                                                  description:
                                                    type: string
                                                    description: A short summary of the profile.
                                                    example: What is your age?
                                                  conditions:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/RegularProfileRangeConditionsTemplate'
                                                      - $ref: '#/components/schemas/RegularProfileSelectionConditionsTemplate'
                                                      - $ref: '#/components/schemas/RegularProfileZipConditionsTemplate'
                                                  quotas:
                                                    type: object
                                                    properties:
                                                      ungrouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SingularRegularQuotaTemplate'
                                                      grouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/GroupedRegularQuotaTemplate'
                                            ProfileTemplateRequest:
                                              allOf:
                                                - $ref: '#/components/schemas/ProfileTemplateScopeless'
                                                - properties:
                                                    profiles:
                                                      $ref: '#/components/schemas/TemplateRegularProfiles'
                                                - required:
                                                    - name
                                                    - locales
                                                    - profiles
                                            ProfileTemplateResponse:
                                              type: object
                                              allOf:
                                                - properties:
                                                    id:
                                                      $ref: '#/components/schemas/ProfileTemplateID'
                                                - $ref: '#/components/schemas/ProfileTemplateOverview'
                                                - properties:
                                                    profiles:
                                                      $ref: '#/components/schemas/TemplateRegularProfiles'
                                            ProjectStatus:
                                              type: string
                                              enum:
                                                - active
                                                - inactive
                                              description: Project Status.
                                              example: active
                                            ProjectHumanReadableID:
                                              description: The project's human readable ID. These ID's are scoped to within an account.
                                              type: string
                                              minLength: 6
                                              maxLength: 6
                                              example: FT354J
                                            TargetGroupHumanReadableID:
                                              description: The target group's human readable ID. These ID's are scoped to within an account.
                                              type: string
                                              minLength: 7
                                              maxLength: 7
                                              example: 9NRV3B9
                                            ProjectStatistics:
                                              type: object
                                              required:
                                                - filling_goal
                                                - current_completes
                                                - current_prescreens
                                                - incidence_rate_median
                                                - length_of_interview_median_seconds
                                                - conversion_rate_average
                                                - drop_off_rate_average
                                              properties:
                                                filling_goal:
                                                  type: integer
                                                  format: int32
                                                  description: The filling goal is used to indicate the desired number of completes  on a survey.
                                                  minimum: 0
                                                  example: 1000
                                                current_completes:
                                                  type: integer
                                                  format: int32
                                                  description: Current number of completes for the Target Group.
                                                  minimum: 0
                                                  example: 412
                                                current_prescreens:
                                                  type: integer
                                                  format: int32
                                                  description: Current number of prescreens for the Target Group.
                                                  minimum: 0
                                                  example: 546
                                                incidence_rate_median:
                                                  type: number
                                                  format: float
                                                  description: Current median incidence rate of the Project.
                                                  minimum: 0
                                                  maximum: 1
                                                  example: 0.05
                                                length_of_interview_median_seconds:
                                                  type: integer
                                                  format: int32
                                                  description: Current median length of interview of the Project in seconds.
                                                  minimum: 0
                                                  example: 1
                                                conversion_rate_average:
                                                  type: number
                                                  format: float
                                                  description: Current average conversion rate of the Project.
                                                  minimum: 0
                                                  maximum: 1
                                                  example: 0.05
                                                drop_off_rate_average:
                                                  type: number
                                                  format: float
                                                  description: Current average drop-off rate of the Project.
                                                  minimum: 0
                                                  maximum: 1
                                                  example: 0.05
                                            ProjectListItem:
                                              type: object
                                              description: An individual Target Group in a list of Target Groups, with basic information and statistics.
                                              required:
                                                - id
                                                - account_id
                                                - name
                                                - status
                                                - last_activity_at
                                                - target_group_count
                                                - statistics
                                              properties:
                                                id:
                                                  type: string
                                                  pattern: ^[0-9A-Z]{26}$
                                                  description: ULID identifier of the Project.
                                                  example: 01HD6WD8W4G8FMTFCX0JPR8TXN
                                                human_readable_id:
                                                  $ref: '#/components/schemas/ProjectHumanReadableID'
                                                account_id:
                                                  $ref: '#/components/schemas/AccountID'
                                                purchase_order_number:
                                                  type: string
                                                  description: Purchase order number assigned to the project.
                                                  minLength: 3
                                                  maxLength: 128
                                                  example: PO-1234
                                                name:
                                                  type: string
                                                  description: Name of the Project.
                                                  example: Test Project
                                                highlighted_name:
                                                  type: string
                                                  description: |
                                                    The name of the project, with parts that matched the search string being highlighted between HTML emphasis tags. If there was no search string, or the search string matched this project based on the identifier (and not based on the name), this property will be omitted.
                                                  example: <em>Test</em> Project
                                                target_group_human_readable_ids:
                                                  type: array
                                                  description: |
                                                    If the search string matched one or more of the ID's of target groups contained within the project, those target groups will be listed here. If no such matches were found, this property will be omitted.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupHumanReadableID'
                                                target_group_count:
                                                  type: integer
                                                  format: int32
                                                  minimum: 0
                                                  maximum: 1000
                                                  example: 1
                                                  description: Count of all the target groups belonging to this project.
                                                status:
                                                  $ref: '#/components/schemas/ProjectStatus'
                                                last_activity_at:
                                                  type: string
                                                  format: date-time
                                                  description: Indicates the last activity on Project (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                statistics:
                                                  $ref: '#/components/schemas/ProjectStatistics'
                                            ProjectsList:
                                              type: object
                                              description: Paginated list of Target Groups.
                                              required:
                                                - projects
                                                - url
                                                - has_more
                                              properties:
                                                projects:
                                                  type: array
                                                  description: Array of Project list items, representing the results of the query.
                                                  items:
                                                    $ref: '#/components/schemas/ProjectListItem'
                                                url:
                                                  type: string
                                                  description: URL which produced this list (without query parameters).
                                                  example: /accounts/543587/projects
                                                has_more:
                                                  type: boolean
                                                  description: If there are further results to be shown using the returned next cursor or previous cursor, this will be true, otherwise false.
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                            ProjectInfo:
                                              type: object
                                              description: Initial Project Setup
                                              properties:
                                                name:
                                                  type: string
                                                  description: Name of the project used to describe the project
                                                  minLength: 5
                                                  maxLength: 128
                                                  example: A Project
                                                project_manager_id:
                                                  type: string
                                                  format: uuid
                                                  example: 96C65204-90C2-4DCB-9393-B8226DD50C76
                                                  description: Project manager ID.
                                                purchase_order_number:
                                                  type: string
                                                  description: |
                                                    Purchase order number assigned to the project. It is not possible to remove the purchase_order_number once it is set; however, it can be changed to a different PO number.
                                                  minLength: 3
                                                  maxLength: 128
                                                  example: PO-1234
                                              required:
                                                - name
                                                - project_manager_id
                                            ProjectIDResponse:
                                              type: object
                                              description: Response containing only the project ID.
                                              properties:
                                                id:
                                                  type: string
                                                  format: ulid
                                                  example: 01GV070G3SJECZAGE3Q3J6FV56
                                            ProjectID:
                                              description: The character string representing a unique project ID (ULID format).
                                              type: string
                                              pattern: ^[0-9A-Z]{26}$
                                              example: 01BTGNYV6HRNK8K8VKZASZCFP0
                                            ProjectDetails:
                                              type: object
                                              description: Project details
                                              required:
                                                - id
                                                - name
                                                - project_manager_id
                                                - account_id
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/ProjectID'
                                                human_readable_id:
                                                  $ref: '#/components/schemas/ProjectHumanReadableID'
                                                name:
                                                  type: string
                                                  description: Name of the Project.
                                                  example: Test Project
                                                project_manager_id:
                                                  description: Project manager ID.
                                                  allOf:
                                                    - $ref: '#/components/schemas/UserID'
                                                account_id:
                                                  $ref: '#/components/schemas/AccountID'
                                                purchase_order_number:
                                                  type: string
                                                  description: Purchase order number assigned to the project.
                                                  example: PO-1234
                                            ProjectInfoUpdate:
                                              type: object
                                              description: Details to update on an existing project
                                              required:
                                                - name
                                                - project_manager_id
                                              properties:
                                                name:
                                                  type: string
                                                  description: Name of the project used to describe the project
                                                  minLength: 5
                                                  maxLength: 128
                                                  example: A Project
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                purchase_order_number:
                                                  type: string
                                                  description: |
                                                    Purchase order number assigned to the project. It is not possible to remove the purchase_order_number once it is set; however, it can be changed to a different PO number.
                                                    If the PO number is not provided in the request, it will remain unchanged.
                                                  minLength: 3
                                                  maxLength: 128
                                                  example: PO-1234
                                            TargetGroupID:
                                              description: The character string representing a unique project ID (ULID format).
                                              type: string
                                              pattern: ^[0-9A-Z]{26}$
                                              example: 01BTGNYV6HRNK8K8VKZASZCFP1
                                            TargetGroupIds:
                                              type: array
                                              description: List of target group IDs.
                                              items:
                                                $ref: '#/components/schemas/TargetGroupID'
                                            CreateBulkCompleteTargetGroupJobRequest:
                                              type: object
                                              description: Request body for creating a bulk complete target groups job.
                                              properties:
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            JobID:
                                              description: The character string representing a unique job ID.
                                              type: string
                                              example: 01BTGNYV6HRNK8K8VKZASZCFP1
                                            BulkJobStatus:
                                              type: string
                                              enum:
                                                - Completed
                                                - Failed
                                                - Processing
                                            TargetGroupName:
                                              type: string
                                              description: Name of the Target Group.
                                              example: Test Target Group
                                            BulkUpdatedTargetGroups:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      target_group_id:
                                                        $ref: '#/components/schemas/TargetGroupID'
                                                      target_group_name:
                                                        $ref: '#/components/schemas/TargetGroupName'
                                                has_more:
                                                  type: boolean
                                                  enum:
                                                    - false
                                            BulkJobFailureReason:
                                              type: object
                                              properties:
                                                code:
                                                  type: string
                                                  example: TargetGroupNotFound
                                                description:
                                                  type: string
                                                  example: Target group not found.
                                            BulkFailedTargetGroups:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      target_group_id:
                                                        $ref: '#/components/schemas/TargetGroupID'
                                                      target_group_name:
                                                        $ref: '#/components/schemas/TargetGroupName'
                                                      failure_reason:
                                                        $ref: '#/components/schemas/BulkJobFailureReason'
                                                has_more:
                                                  type: boolean
                                                  enum:
                                                    - false
                                            GetBulkCompleteTargetGroupJobResponse:
                                              type: object
                                              description: Bulk complete target groups job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            CreateBulkDuplicateTargetGroupsJobRequestItem:
                                              type: object
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/TargetGroupID'
                                                new_name:
                                                  type: string
                                                  description: The name that the new target group should have. The existing target group's name will be used if omitted.
                                                  example: My New Target Group
                                            CreateBulkLaunchTargetGroupJobRequest:
                                              type: object
                                              description: Request body for creating a bulk launch target groups job.
                                              properties:
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            GetBulkLaunchTargetGroupJobResponse:
                                              type: object
                                              description: Bulk launch target groups job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            CreateBulkPauseTargetGroupJobRequest:
                                              type: object
                                              description: Request body for creating a bulk pause target groups job.
                                              properties:
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            GetBulkPauseTargetGroupJobResponse:
                                              type: object
                                              description: Bulk pause target groups job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            CreateBulkRelaunchTargetGroupJobRequest:
                                              type: object
                                              description: Request body for creating a bulk relaunch target groups job.
                                              properties:
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            GetBulkRelaunchTargetGroupJobResponse:
                                              type: object
                                              description: Bulk relaunch target groups job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            CreateBulkResumeTargetGroupJobRequest:
                                              type: object
                                              description: Request body for creating a bulk resume target groups job.
                                              properties:
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            GetBulkResumeTargetGroupJobResponse:
                                              type: object
                                              description: Bulk resume target groups job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            CreateBulkUpdateTargetGroupProjectManagerJobRequest:
                                              type: object
                                              description: Request body for creating a bulk update target group project managers job.
                                              properties:
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            GetBulkUpdateTargetGroupProjectManagerJobResponse:
                                              type: object
                                              description: Bulk update target group project managers job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                status:
                                                  $ref: '#/components/schemas/BulkJobStatus'
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                updated_target_groups:
                                                  $ref: '#/components/schemas/BulkUpdatedTargetGroups'
                                                failed_target_groups:
                                                  $ref: '#/components/schemas/BulkFailedTargetGroups'
                                            TargetGroupSearchString:
                                              type: string
                                              description: |
                                                Search string to match against. The string will be used to search based on the target group's name and/or the target group's human readable ID. Supports partial matching for target group name and human readable ID. Also supports English language stemmed matching for target group name.
                                              example: My Target Gr
                                            TargetGroupStatus:
                                              type: string
                                              enum:
                                                - draft
                                                - scheduled
                                                - live
                                                - paused
                                                - completed
                                                - archived
                                              description: Target Group Status.
                                              example: draft
                                            schemas-TargetGroupStatus:
                                              type: array
                                              items:
                                                $ref: '#/components/schemas/TargetGroupStatus'
                                            TargetGroupCountry:
                                              type: array
                                              items:
                                                type: string
                                                pattern: ^[a-z]{2}$
                                                example: us
                                            TargetGroupLanguage:
                                              type: array
                                              items:
                                                type: string
                                                pattern: ^[a-z]{3}$
                                                example: eng
                                            ComputeTargetGroupTransitionsFilters:
                                              type: object
                                              description: Filters for computing target group transitions.
                                              properties:
                                                status:
                                                  $ref: '#/components/schemas/schemas-TargetGroupStatus'
                                                country:
                                                  $ref: '#/components/schemas/TargetGroupCountry'
                                                language:
                                                  $ref: '#/components/schemas/TargetGroupLanguage'
                                            ComputeTargetGroupTransitionsRequest:
                                              type: object
                                              description: Request body for computing target group transitions.
                                              properties:
                                                search_string:
                                                  $ref: '#/components/schemas/TargetGroupSearchString'
                                                filters:
                                                  $ref: '#/components/schemas/ComputeTargetGroupTransitionsFilters'
                                                included_target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                                excluded_target_group_ids:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                            ComputeTargetGroupTransitionsResponse:
                                              type: object
                                              description: Matching target group Id with their possible transitions.
                                              properties:
                                                target_groups:
                                                  $ref: '#/components/schemas/TargetGroupIds'
                                                is_launch_allowed:
                                                  type: boolean
                                                is_pause_allowed:
                                                  type: boolean
                                                is_resume_allowed:
                                                  type: boolean
                                                is_relaunch_allowed:
                                                  type: boolean
                                                is_finish_allowed:
                                                  type: boolean
                                            TargetGroupExclusionStatusPair:
                                              type: object
                                              properties:
                                                target_group_id:
                                                  type: string
                                                  description: The ID of the target group to which the exclusion policy should be applied
                                                  example: 01HC2Z6TM8C4F3Y5CA6S2JR475
                                                exclusion_enabled:
                                                  type: boolean
                                                  description: Whether or not the associated target group should have exclusion enabled within this Exclusion Container
                                                  example: true
                                            SurveyGroupID:
                                              type: string
                                              description: The ID of the legacy survey group for this Exclusions Container. In the immediate, this maps directly to ExclusionID. This field will be phased out as our architecture matures
                                              example: '18095'
                                            ExclusionID:
                                              type: string
                                              description: The ID for the given exclusion policy that this container is attached to
                                              example: 01H2TX5XWNGPFPBWZCKBDBELKE
                                            OriginId:
                                              type: string
                                              description: the ID of the entity that serves as the "container" for exclusions. For instance, if the Origin Type is "Project", then Origin ID would be Project ID
                                              example: 01H2TX5XWNGPFPBWZCKBDBEPBN
                                            OriginType:
                                              type: string
                                              description: The type of "exclusion container". For instance, Project, Tracker
                                              example: project
                                            CreateDate:
                                              type: string
                                              format: datetime
                                              description: The time that this exclusions container was created
                                              example: '2024-06-18T14:23:45Z'
                                            ExclusionEnabled:
                                              type: boolean
                                              description: Indicates whether or not a given Target Group should exclude respondents from other Target Groups within the Project
                                            ProjectOverview:
                                              type: object
                                              description: Get an overview of a project
                                              required:
                                                - id
                                                - human_readable_id
                                                - account_id
                                                - status
                                                - statistics
                                                - project_manager_id
                                                - created_at
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/ProjectID'
                                                human_readable_id:
                                                  $ref: '#/components/schemas/ProjectHumanReadableID'
                                                name:
                                                  type: string
                                                  description: Name of the Project.
                                                  example: Test Project
                                                account_id:
                                                  $ref: '#/components/schemas/AccountID'
                                                status:
                                                  $ref: '#/components/schemas/ProjectStatus'
                                                statistics:
                                                  $ref: '#/components/schemas/ProjectStatistics'
                                                project_manager_id:
                                                  description: Project manager ID.
                                                  allOf:
                                                    - $ref: '#/components/schemas/UserID'
                                                purchase_order_number:
                                                  type: string
                                                  description: Purchase order number assigned to the project.
                                                  example: PO-1234
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  description: Date and time when the project was created (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                            ExclusionEntityType:
                                              type: string
                                              description: Indicates the entity type of the excluded element, for example RID (Respondent ID)
                                              example: RID
                                            ExclusionEntityID:
                                              type: string
                                              description: Indicates the entity identifier of the excluded element
                                              example: 5a3b2ada-0066-4dcb-afdd-7302be78ce9e
                                            ExclusionEntityList:
                                              type: object
                                              properties:
                                                entity_type:
                                                  $ref: '#/components/schemas/ExclusionEntityType'
                                                entity_ids:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ExclusionEntityID'
                                            TargetGroupExclusionObject:
                                              type: object
                                              properties:
                                                enabled:
                                                  type: boolean
                                                  description: Whether or not the project level exclusion policy is enabled
                                                  example: true
                                                list:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ExclusionEntityList'
                                            FillingStrategy:
                                              type: string
                                              enum:
                                                - automated
                                                - prescreens
                                                - completes
                                              description: Target group filling strategy.
                                              example: completes
                                            TargetGroupProgress:
                                              type: object
                                              description: Measurement of the type and progress of the Target Group. A Target Group is considered fulfilled when the `filling_goal` has been reached.
                                              required:
                                                - current_completes
                                                - current_prescreens
                                                - filling_goal
                                                - filling_strategy
                                              properties:
                                                current_completes:
                                                  type: integer
                                                  format: int32
                                                  description: Completes collected in the Target Group so far.
                                                  minimum: 0
                                                  example: 1
                                                current_prescreens:
                                                  type: integer
                                                  format: int32
                                                  description: Prescreens collected in the Target Group so far.
                                                  minimum: 0
                                                  example: 1
                                                filling_goal:
                                                  type: integer
                                                  format: int32
                                                  description: The limit of completes or prescreens to be collected in the Target Group.
                                                  minimum: 1
                                                  example: 1
                                                filling_strategy:
                                                  $ref: '#/components/schemas/FillingStrategy'
                                            ReasonCode:
                                              type: string
                                              example: 2131
                                            TargetGroupStatisticIssueReason:
                                              type: object
                                              properties:
                                                code:
                                                  $ref: '#/components/schemas/ReasonCode'
                                                description:
                                                  type: string
                                                  example: Statistic outside of normal range.
                                              required:
                                                - code
                                                - description
                                            TargetGroupStatisticsIssueType:
                                              type: string
                                              description: The type of issue.
                                              enum:
                                                - warning
                                                - error
                                              example: warning
                                            TargetGroupStatisticsIssuesSuggestion:
                                              type: object
                                              properties:
                                                code:
                                                  $ref: '#/components/schemas/ReasonCode'
                                                description:
                                                  type: string
                                                  example: Lower the quota.
                                              required:
                                                - code
                                                - description
                                            TargetGroupStatisticsIssuesSuggestions:
                                              type: array
                                              description: List of suggestions how to remedy the issues on the statistic.
                                              items:
                                                $ref: '#/components/schemas/TargetGroupStatisticsIssuesSuggestion'
                                            TargetGroupStatisticIssue:
                                              type: object
                                              description: Issue connected to a target group statistic
                                              properties:
                                                reason:
                                                  $ref: '#/components/schemas/TargetGroupStatisticIssueReason'
                                                issue_type:
                                                  $ref: '#/components/schemas/TargetGroupStatisticsIssueType'
                                                suggestions:
                                                  $ref: '#/components/schemas/TargetGroupStatisticsIssuesSuggestions'
                                              required:
                                                - suggestions
                                                - issue_type
                                            StatisticsIssuesArray:
                                              type: array
                                              description: List of issues.
                                              items:
                                                $ref: '#/components/schemas/TargetGroupStatisticIssue'
                                            LastCompleteDate:
                                              type: string
                                              format: date-time
                                              description: The timestamp the Target Groups latest complete was received (RFC3339 UTC format, 3 fractional digits).
                                              example: '2023-01-01T23:00:00.000Z'
                                            CurrencyCode:
                                              type: string
                                              description: |
                                                The three-letter ISO 4217:2015 currency code, in uppercase.
                                                The currency code must be a currency supported by Cint.
                                              example: USD
                                            MonetaryAmount:
                                              type: object
                                              description: Monetary amount.
                                              properties:
                                                value:
                                                  type: string
                                                  description: |
                                                    A decimal encapsulated in a string representing the value in the denomination indicated by the code.
                                                  example: '2.7352'
                                                currency_code:
                                                  $ref: '#/components/schemas/CurrencyCode'
                                                currency_scale:
                                                  allOf:
                                                    - nullable: true
                                                    - type: integer
                                                      description: |
                                                        The number of digits after the decimal separator as defined by ISO 4217:2015.
                                                      example: 2
                                            EarningsPerClick:
                                              type: object
                                              description: Current Cost per Interview multiplied by completes so far, divided by the number of entrants.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            EarningsPerClickPerMinute:
                                              type: object
                                              description: Earnings per Click divided by median length of interview in minutes.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            AverageCostPerInterview:
                                              type: object
                                              description: Average Cost per Interview for the Target Group.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            MedianLengthOfInterviewSeconds:
                                              type: integer
                                              format: int32
                                              description: Current median length of interview of the Target Group in seconds.
                                              minimum: 0
                                              example: 1
                                            IncidenceRate:
                                              type: number
                                              format: float
                                              description: Current incidence rate of the Target Group.
                                              minimum: 0
                                              maximum: 1
                                              example: 0.05
                                            DropOffRate:
                                              type: number
                                              format: float
                                              description: Current drop-off rate of the Target Group.
                                              minimum: 0
                                              maximum: 1
                                              example: 0.05
                                            ConversionRate:
                                              type: number
                                              format: float
                                              description: Current conversion rate of the Target Group.
                                              minimum: 0
                                              maximum: 1
                                              example: 0.05
                                            TargetGroupStatistics:
                                              type: object
                                              description: Statistics relevant for the Target Group, each statistic might include one or more issue descriptors.
                                              required:
                                                - progress
                                              properties:
                                                progress:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/TargetGroupProgress'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                last_complete_date:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/LastCompleteDate'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                earnings_per_click:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/EarningsPerClick'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                earnings_per_click_per_minute:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/EarningsPerClickPerMinute'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                average_cost_per_interview:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/AverageCostPerInterview'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                median_length_of_interview_seconds:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/MedianLengthOfInterviewSeconds'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                incidence_rate:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/IncidenceRate'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                drop_off_rate:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/DropOffRate'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                                conversion_rate:
                                                  type: object
                                                  required:
                                                    - value
                                                    - issues
                                                  properties:
                                                    value:
                                                      $ref: '#/components/schemas/ConversionRate'
                                                    issues:
                                                      $ref: '#/components/schemas/StatisticsIssuesArray'
                                            TargetGroupsListItem:
                                              type: object
                                              description: An individual Target Group in a list of Target Groups, with basic information and statistics.
                                              required:
                                                - id
                                                - name
                                                - locale
                                                - status
                                                - created_at
                                                - statistics
                                                - project_manager_id
                                              properties:
                                                id:
                                                  type: string
                                                  pattern: ^[0-9A-Z]{26}$
                                                  description: ULID identifier of the Target Group.
                                                  example: 01BX5ZZKBKACTAV9WEVGEMMVS1
                                                human_readable_id:
                                                  $ref: '#/components/schemas/TargetGroupHumanReadableID'
                                                name:
                                                  type: string
                                                  description: Name of the Target Group.
                                                  example: Example Target Group
                                                highlighted_name:
                                                  type: string
                                                  description: |
                                                    The name of the target group, with parts that matched the search string being highlighted between HTML emphasis tags. If there was no search string, or the search string matched this target group based on the identifier (and not based on the name), this property will be omitted.
                                                  example: <em>Example</em> Target Group
                                                project_manager_id:
                                                  type: string
                                                  format: uuid
                                                  example: 96C65204-90C2-4DCB-9393-B8226DD50C76
                                                  description: Project manager ID.
                                                exclusion:
                                                  $ref: '#/components/schemas/TargetGroupExclusionObject'
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                status:
                                                  $ref: '#/components/schemas/TargetGroupStatus'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the Target Group was created at (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                updated_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the Target Group was updated at (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                statistics:
                                                  $ref: '#/components/schemas/TargetGroupStatistics'
                                            TargetGroupsList:
                                              type: object
                                              description: Paginated list of Target Groups.
                                              required:
                                                - target_groups
                                                - url
                                                - has_more
                                              properties:
                                                url:
                                                  type: string
                                                  description: URL which produced this list (without query parameters).
                                                  example: /accounts/543587/projects/01BX5ZZKBKACTAV9WEVGEMMVRZ/target-groups
                                                has_more:
                                                  type: boolean
                                                  description: If there are further results to be shown using the returned next cursor or previous cursor, this will be true, otherwise false.
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                                target_groups:
                                                  type: array
                                                  description: Array of Target Group list items, representing the results of the query.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupsListItem'
                                            TargetGroupCollectsPII:
                                              type: boolean
                                              description: Indicates whether or not the target group collects Personally Identifiable Information (PII).
                                              example: true
                                            StudyTypeCode:
                                              type: string
                                              description: Uniquely identifies the Study Type that indicates the Target Group limits and purpose.
                                              default: adhoc
                                              example: diary
                                            IndustryCode:
                                              type: string
                                              description: Uniquely identifies the industry with which this Target Group is associated.
                                              default: other
                                              example: politics
                                            Currency:
                                              type: object
                                              description: Currency information.
                                              properties:
                                                amount:
                                                  type: string
                                                  description: |
                                                    An integer encapsulated in a string representing the value in the smallest currency unit.
                                                    The number of minor units (aka scale aka decimal places) is defined by ISO 4217 Currency Table.
                                                  example: '15'
                                                code:
                                                  $ref: '#/components/schemas/CurrencyCode'
                                            TargetGroupClientCpi:
                                              description: This property can only be defined on a Target Group with dynamic pricing. This property must not be defined on Target Groups with rate card pricing.
                                              allOf:
                                                - $ref: '#/components/schemas/Currency'
                                            TargetGroupClientID:
                                              type: integer
                                              format: int32
                                              description: Client ID associated with the created Target Group
                                              example: 1234
                                              nullable: true
                                            TargetGroupFieldingSpecification:
                                              type: object
                                              description: Contains Target Group fielding details.
                                              required:
                                                - start_at
                                                - end_at
                                              properties:
                                                start_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the Target Group is scheduled to start at (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the Target Group is scheduled to end at (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                            TargetGroupFillingGoal:
                                              type: integer
                                              format: int32
                                              minimum: 0
                                              description: Indicates the new value for filling goal.
                                              example: 750
                                            TargetGroupExpectedLengthOfInterview:
                                              type: integer
                                              format: int32
                                              description: Expected median length of interview of the Target Group.
                                              minimum: 0
                                              example: 1
                                            TargetGroupExpectedIncidenceRate:
                                              type: number
                                              format: float
                                              description: Expected incidence rate of the Target Group.
                                              minimum: 0
                                              maximum: 1
                                              multipleOf: 0.01
                                              example: 0.05
                                            TargetGroupIndustryLockoutCode:
                                              type: string
                                              description: Blocks respondents during a certain timeframe based on whether they've taken a separate Target Group in the same industry.
                                              example: past_30_days
                                            TargetGroupLiveUrl:
                                              description: The link into the study that the respondent gets redirected to upon qualification.
                                              type: string
                                              example: https://example.com/live
                                            TargetGroupTestUrl:
                                              description: The test link into the study that the respondent gets redirected to upon qualification.
                                              type: string
                                              example: https://example.com/test
                                            ModuleDynamicPricing:
                                              title: Dynamic pricing
                                              type: object
                                              description: This module can only be used for Target Groups with dynamic pricing. It does not support Target Groups with rate card pricing. Controls CPI to try achieving 100% fill at the moment of fielding end date as cheaply as possible. Requires at least one of the upper limits (total budget, maximum CPI) to be specified, but not both simultaneously.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - dynamic
                                                  description: Descriptor of the pricing module type.
                                                total_budget:
                                                  description: Maximum monetary amount to be spent for the target number of completes. Only one of `maximum_cpi` or `total_budget` can be specified.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                maximum_cpi:
                                                  description: Maximum CPI to be set on the Target Group. Must be higher than the minimum, if specified. Only one of `maximum_cpi` or `total_budget` can be specified.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                minimum_cpi:
                                                  description: Minimum CPI to be set on the Target Group. Must be lower than the maximum, if specified. Can be overruled by total budget.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                              required:
                                                - type
                                            ModuleRateCardPricing:
                                              title: Rate Card pricing
                                              type: object
                                              description: This module can only be used for Target Groups with rate card pricing. It does not support Target Groups with dynamic pricing.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - rate_card
                                                  description: Descriptor of the pricing module type.
                                                maximum_cpi:
                                                  description: Maximum CPI to be set on the Target Group.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                boost_cpi:
                                                  description: Additional amount to be added to the CPI inferred from the rate card. Respects maximum CPI.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                              required:
                                                - type
                                            ModuleQuotaOverlay:
                                              title: Quota overlay
                                              type: object
                                              description: Manages the way how completes goal is translated to quotas.
                                              properties:
                                                prevent_overfill:
                                                  type: boolean
                                                  description: Applies a translation to prescreen quota filling strategy, that prevents overfills.
                                                  example: true
                                                balance_fill:
                                                  type: boolean
                                                  description: Does not let quotas fill faster than the others within the same demography.
                                                  example: true
                                              required:
                                                - prevent_overfill
                                                - balance_fill
                                            IncrementInterval:
                                              type: string
                                              format: duration
                                              description: |
                                                Positive duration between increment intervals.  Limited to a subset of ISO-8601 duration in format PnDTnHnMnS. The duration must be less than 398 days (13 months).
                                            ModuleLinearPacing:
                                              title: Linear even pacing
                                              type: object
                                              description: Increments quotas in regular intervals between Target Group start date and an end date.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - linear
                                                  description: Descriptor of the pacing module type.
                                                increment_interval:
                                                  $ref: '#/components/schemas/IncrementInterval'
                                              required:
                                                - type
                                                - increment_interval
                                            ModuleAdaptivePacing:
                                              title: Adaptive even pacing
                                              type: object
                                              description: Increments quotas in regular intervals, recalculating steps after each interval to evenly pace  the rest of the Completes Goal until the end date.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - adaptive
                                                  description: Descriptor of the pacing module type.
                                                increment_interval:
                                                  $ref: '#/components/schemas/IncrementInterval'
                                              required:
                                                - type
                                                - increment_interval
                                            ModuleSoftLaunch:
                                              title: Soft launch
                                              type: object
                                              description: Manages a soft launch of a Target Group. During a soft launch, pacing modules are ignored.
                                              properties:
                                                end_at:
                                                  title: Soft launch fielding end date
                                                  type: string
                                                  description: The soft launch will be finished at this date, and the target group paused regardless of the fill.
                                                  format: date-time
                                                  example: '2023-10-09T15:00:00Z'
                                                filling_goal_percentage:
                                                  title: Soft launch percentage of the filling goal
                                                  description: The percentage of the full filling goal to collect during the soft launch phase.
                                                  type: integer
                                                  minimum: 1
                                                  maximum: 100
                                                demographics_strictness_percentage:
                                                  title: Strictness of demography distribution during soft launch.
                                                  description: Controls how strictly should the soft launch demographics distribution follow the distribution in the full launch. A setting of 100% aims to fully match the demography, while 0% allows any distribution.
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                              required:
                                                - end_at
                                                - filling_goal_percentage
                                                - demographics_strictness_percentage
                                            FieldingAssistantModulesAssignment:
                                              title: Fielding Assistant modules assignment
                                              description: Having an assignment enables Fielding Assistant modules on a specified Target Group.  All modules are optional, their omission means they are not enabled.
                                              type: object
                                              properties:
                                                pricing:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/ModuleDynamicPricing'
                                                    - $ref: '#/components/schemas/ModuleRateCardPricing'
                                                quota_overlay:
                                                  $ref: '#/components/schemas/ModuleQuotaOverlay'
                                                pacing:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/ModuleLinearPacing'
                                                    - $ref: '#/components/schemas/ModuleAdaptivePacing'
                                                soft_launch:
                                                  $ref: '#/components/schemas/ModuleSoftLaunch'
                                            TargetGroupInputDraftRegularProfileRangeConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `range_conditions_details_template`.
                                                  enum:
                                                    - range_conditions_details_template
                                                  example: range_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      min:
                                                        type: integer
                                                        description: The minimum numeric value (inclusive).
                                                      max:
                                                        type: integer
                                                        description: The maximum numeric value (inclusive).
                                              example:
                                                object: range_conditions_details_template
                                                data:
                                                  - min: 18
                                                    max: 24
                                                  - min: 25
                                                    max: 35
                                                  - min: 36
                                                    max: 45
                                            TargetGroupInputDraftRegularProfileSelectionConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `selection_conditions_details_template`.
                                                  enum:
                                                    - selection_conditions_details_template
                                                  example: selection_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/SelectionConditionItem'
                                              example:
                                                object: selection_conditions_details_template
                                                data:
                                                  - option: '1'
                                                  - option: '2'
                                                  - option: '3'
                                            TargetGroupInputDraftRegularProfileZipConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `zip_conditions_details_template`.
                                                  enum:
                                                    - zip_conditions_details_template
                                                  example: zip_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ZipConditionItem'
                                              example:
                                                object: zip_conditions_details_template
                                                data:
                                                  - allow_all_zip: true
                                                    zip_codes: []
                                            TargetGroupDraftSingularRegularQuotaTemplate:
                                              type: object
                                              properties:
                                                index:
                                                  type: integer
                                                  description: The index of the condition as reference to the item from the list of conditions.
                                                  minimum: 0
                                                  example: 0
                                                quota_percentage:
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                                  description: The quota value expressed as a percentage for the profile template.
                                                  example: 40
                                                quota_nominal:
                                                  type: integer
                                                  minimum: 0
                                                  description: The quota value expressed as a nominal value for the profile template.
                                                  example: 550
                                            TargetGroupDraftGroupedRegularQuotaTemplate:
                                              type: object
                                              properties:
                                                indexes:
                                                  type: array
                                                  description: The indexes of the condition as reference to the item from the list of conditions.
                                                  items:
                                                    type: integer
                                                    minimum: 0
                                                  example:
                                                    - 1
                                                    - 2
                                                name:
                                                  type: string
                                                  description: The name of the group of conditions.
                                                  maxLength: 64
                                                  example: Group 1
                                                quota_percentage:
                                                  type: integer
                                                  description: The quota percentage for the template.
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 40
                                                quota_nominal:
                                                  type: integer
                                                  minimum: 0
                                                  description: The quota value expressed as a nominal value for the profile template.
                                                  example: 550
                                            TargetGroupInputDraftRegularProfile:
                                              type: array
                                              description: List of regular profiles.
                                              items:
                                                type: object
                                                properties:
                                                  question_id:
                                                    type: integer
                                                    description: The identifier for the underlying question from the profiling library.
                                                    example: 42
                                                  quotas_enabled:
                                                    type: boolean
                                                    description: Indicates whether or not the defined quotas on the profile are enabled
                                                    example: true
                                                  conditions:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/TargetGroupInputDraftRegularProfileRangeConditionsTemplate'
                                                      - $ref: '#/components/schemas/TargetGroupInputDraftRegularProfileSelectionConditionsTemplate'
                                                      - $ref: '#/components/schemas/TargetGroupInputDraftRegularProfileZipConditionsTemplate'
                                                  quotas:
                                                    type: object
                                                    properties:
                                                      ungrouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/TargetGroupDraftSingularRegularQuotaTemplate'
                                                      grouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/TargetGroupDraftGroupedRegularQuotaTemplate'
                                            TargetGroupInputDraftInterlockedProfileConditions:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the condition.
                                                  format: ULID
                                                option:
                                                  type: string
                                                  description: Interlocked option
                                            InputDraftInterlockedParticipantSelectionProfileCondition:
                                              type: object
                                              properties:
                                                option:
                                                  type: string
                                                  description: Question option
                                            InputDraftInterlockedParticipantRangeProfileCondition:
                                              type: object
                                              properties:
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive).
                                                max:
                                                  type: integer
                                                  description: The maximum numeric value (inclusive).
                                            InputDraftInterlockedParticipantZipProfileCondition:
                                              type: object
                                              properties:
                                                zip_codes:
                                                  type: array
                                                  description: |
                                                    The number option for the answer of the question
                                                    relating to the condition.
                                                  items:
                                                    type: string
                                                allow_all_zip:
                                                  type: boolean
                                                  description: |
                                                    If true, the profile will allow all zip codes. If false,
                                                    the profile will only allow the zip codes specified in the data field.
                                                  example: true
                                            TargetGroupInputDraftInterlockedParticipantProfile:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the draft profile.
                                                  format: ULID
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                  example: true
                                                question_id:
                                                  type: integer
                                                  description: The identifier for the underlying question from the profiling library.
                                                  example: 42
                                                interlock_id:
                                                  type: string
                                                  description: The identifier for the interlock that this profile composes.
                                                  format: ULID
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupDraftSingularRegularQuotaTemplate'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupDraftGroupedRegularQuotaTemplate'
                                                conditions:
                                                  type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: |
                                                        Object field to distinguish between different types of control selections.
                                                    data:
                                                      oneOf:
                                                        - $ref: '#/components/schemas/InputDraftInterlockedParticipantSelectionProfileCondition'
                                                        - $ref: '#/components/schemas/InputDraftInterlockedParticipantRangeProfileCondition'
                                                        - $ref: '#/components/schemas/InputDraftInterlockedParticipantZipProfileCondition'
                                            TargetGroupInputDraftInterlockedProfile:
                                              type: object
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the draft profile.
                                                  format: ULID
                                                name:
                                                  type: string
                                                  description: The name of the draft profile.
                                                  example: AGE, GENDER
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                depends_on_questions:
                                                  type: array
                                                  description: Array of questionIDs that this profile depends on.
                                                  items:
                                                    type: integer
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        type: object
                                                        properties:
                                                          id:
                                                            type: string
                                                            format: ULID
                                                            example: 01JABYXDTMNXEKCQQZ5ND4QEAW
                                                          condition:
                                                            $ref: '#/components/schemas/TargetGroupInputDraftInterlockedProfileConditions'
                                                          quota_percentage:
                                                            type: integer
                                                            description: The quota percentage for the template.
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 40
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupInputDraftInterlockedParticipantProfile'
                                            TargetGroupDraftProfilesRequest:
                                              type: object
                                              description: Template profile
                                              required:
                                                - profile_adjustment_type
                                              properties:
                                                profile_adjustment_type:
                                                  type: string
                                                  description: The adjustment type for rationalizing quota values using either nominal or percentage-based calculations.
                                                  example: nominal
                                                  enum:
                                                    - percentage
                                                    - nominal
                                              anyOf:
                                                - properties:
                                                    drafts:
                                                      $ref: '#/components/schemas/TargetGroupInputDraftRegularProfile'
                                                - properties:
                                                    interlocked_profiles:
                                                      type: array
                                                      description: List of interlocked profiles.
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupInputDraftInterlockedProfile'
                                            SupplierId:
                                              type: object
                                              properties:
                                                id:
                                                  type: integer
                                                  minimum: 0
                                                  example: 420
                                              required:
                                                - id
                                            CreateDraftSupplyAllocationGroupRequest:
                                              description: 'A allocation supply group can be of three different types: Group, SystemDefault, Blocked.'
                                              type: array
                                              items:
                                                oneOf:
                                                  - type: object
                                                    title: SupplyAllocationGroupType
                                                    properties:
                                                      percentage_max:
                                                        type: integer
                                                        nullable: false
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                      name:
                                                        type: string
                                                        minLength: 1
                                                        example: Group A
                                                      type:
                                                        type: string
                                                        enum:
                                                          - group
                                                        description: Descriptor of the Group Allocation type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierId'
                                                    required:
                                                      - name
                                                      - type
                                                      - percentage_max
                                                  - type: object
                                                    title: SupplyAllocationExchangeType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - exchange
                                                        description: Descriptor of the Exchange type.
                                                      percentage_max:
                                                        type: integer
                                                        nullable: false
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                    required:
                                                      - type
                                                      - percentage_max
                                                  - type: object
                                                    title: SupplyAllocationBlockedType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - blocked
                                                        description: Descriptor of the Blocked type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierId'
                                                    required:
                                                      - type
                                            CreateDraftTargetGroupRequest:
                                              type: object
                                              description: Request body for creating a target group in draft status.
                                              required:
                                                - name
                                                - business_unit_id
                                                - locale
                                                - project_manager_id
                                                - fielding_specification
                                                - fielding_assistant_assignment
                                                - filling_goal
                                                - profile
                                                - collects_pii
                                              properties:
                                                name:
                                                  $ref: '#/components/schemas/TargetGroupName'
                                                business_unit_id:
                                                  $ref: '#/components/schemas/BusinessUnitID'
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                collects_pii:
                                                  $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                study_type_code:
                                                  $ref: '#/components/schemas/StudyTypeCode'
                                                industry_code:
                                                  $ref: '#/components/schemas/IndustryCode'
                                                cost_per_interview:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                client_cost_per_interview_note:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                client_id:
                                                  $ref: '#/components/schemas/TargetGroupClientID'
                                                fielding_specification:
                                                  $ref: '#/components/schemas/TargetGroupFieldingSpecification'
                                                filling_goal:
                                                  $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                expected_length_of_interview_minutes:
                                                  $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                expected_incidence_rate:
                                                  $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                exclusion:
                                                  $ref: '#/components/schemas/TargetGroupExclusionObject'
                                                industry_lockout_code:
                                                  $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                live_url:
                                                  $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                test_url:
                                                  $ref: '#/components/schemas/TargetGroupTestUrl'
                                                fielding_assistant_assignment:
                                                  $ref: '#/components/schemas/FieldingAssistantModulesAssignment'
                                                profile:
                                                  $ref: '#/components/schemas/TargetGroupDraftProfilesRequest'
                                                supply_allocations:
                                                  $ref: '#/components/schemas/CreateDraftSupplyAllocationGroupRequest'
                                            CreatedDraftTargetGroupResponse:
                                              type: object
                                              description: Response for creating draft target Group.
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/TargetGroupID'
                                            TargetGroupPricingModel:
                                              type: string
                                              description: Denotes the pricing model setting for the target group based on the business unit.
                                              enum:
                                                - ratecard
                                                - dynamic
                                              default: dynamic
                                            TargetGroupDraftRegularProfileRangeConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `range_conditions_details_template`.
                                                  enum:
                                                    - range_conditions_details_template
                                                  example: range_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                                      min:
                                                        type: integer
                                                        description: The minimum numeric value (inclusive).
                                                      max:
                                                        type: integer
                                                        description: The maximum numeric value (inclusive).
                                              example:
                                                object: range_conditions_details_template
                                                data:
                                                  - text: 18 to 24 years old
                                                    min: 18
                                                    max: 24
                                                  - text: 25 to 35 years old
                                                    min: 25
                                                    max: 35
                                                  - text: 36 to 46 years old
                                                    min: 36
                                                    max: 45
                                            TargetGroupDraftRegularProfileSelectionConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `selection_conditions_details_template`.
                                                  enum:
                                                    - selection_conditions_details_template
                                                  example: selection_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                                      option:
                                                        type: string
                                                        description: |
                                                          The number option for the answer of the question
                                                          relating to the condition.
                                              example:
                                                object: selection_conditions_details_template
                                                data:
                                                  - option: '1'
                                                  - option: '2'
                                                  - option: '3'
                                            TargetGroupDraftRegularProfileZipConditionsTemplate:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `zip_conditions_details_template`.
                                                  enum:
                                                    - zip_conditions_details_template
                                                  example: zip_conditions_details_template
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                                      zip_codes:
                                                        type: array
                                                        description: |
                                                          The number option for the answer of the question
                                                          relating to the condition.
                                                        items:
                                                          type: string
                                                      allow_all_zip:
                                                        type: boolean
                                                        description: |
                                                          If true, the profile will allow all zip codes. If false,
                                                          the profile will only allow the zip codes specified in the data field.
                                                        example: true
                                            TargetGroupDraftRegularProfile:
                                              type: array
                                              description: List of regular profiles.
                                              items:
                                                type: object
                                                properties:
                                                  question_id:
                                                    type: integer
                                                    description: The identifier for the underlying question from the profiling library.
                                                    example: 42
                                                  quotas_enabled:
                                                    type: boolean
                                                    description: Indicates whether or not the defined quotas on the profile are enabled
                                                    example: true
                                                  conditions:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/TargetGroupDraftRegularProfileRangeConditionsTemplate'
                                                      - $ref: '#/components/schemas/TargetGroupDraftRegularProfileSelectionConditionsTemplate'
                                                      - $ref: '#/components/schemas/TargetGroupDraftRegularProfileZipConditionsTemplate'
                                                  quotas:
                                                    type: object
                                                    properties:
                                                      ungrouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/TargetGroupDraftSingularRegularQuotaTemplate'
                                                      grouped:
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/TargetGroupDraftGroupedRegularQuotaTemplate'
                                            DraftInterlockedProfileRelatedConditionItem:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  description: the identifier for the condition
                                                option:
                                                  type: string
                                                  description: question option
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive).
                                                max:
                                                  type: integer
                                                zip_codes:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: List of applicable zip codes.
                                                allow_all_zip:
                                                  type: boolean
                                                  description: Flag to allow all zip codes.
                                                text:
                                                  type: string
                                                  description: text description for the condition.
                                                text_translated:
                                                  type: string
                                                  description: translated text description for the condition.
                                            DraftInterlockedProfileRelatedConditions:
                                              type: object
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                conditions:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/DraftInterlockedProfileRelatedConditionItem'
                                            DraftInterlockedProfileConditions:
                                              type: object
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the condition.
                                                  format: ULID
                                                text:
                                                  type: string
                                                  description: The text of the condition. Always in English.
                                                text_translated:
                                                  type: string
                                                  description: Condition text translated into target language.
                                                option:
                                                  type: string
                                                  description: Interlocked option
                                                related_condition:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/DraftInterlockedProfileRelatedConditions'
                                            DraftInterlockedParticipantProfileCondition:
                                              type: object
                                              description: Conditions details for the participant profile.
                                              properties:
                                                text:
                                                  type: string
                                                  description: The text of the condition. Always in English.
                                            DraftInterlockedParticipantSelectionProfileCondition:
                                              allOf:
                                                - $ref: '#/components/schemas/DraftInterlockedParticipantProfileCondition'
                                                - type: object
                                                  properties:
                                                    option:
                                                      type: string
                                                      description: Question option
                                            DraftInterlockedParticipantRangeProfileCondition:
                                              allOf:
                                                - $ref: '#/components/schemas/DraftInterlockedParticipantProfileCondition'
                                                - type: object
                                                  properties:
                                                    min:
                                                      type: integer
                                                      description: The minimum numeric value (inclusive).
                                                    max:
                                                      type: integer
                                                      description: The maximum numeric value (inclusive).
                                            DraftInterlockedParticipantZipProfileCondition:
                                              allOf:
                                                - $ref: '#/components/schemas/DraftInterlockedParticipantProfileCondition'
                                                - type: object
                                                  properties:
                                                    zip_codes:
                                                      type: array
                                                      description: |
                                                        The number option for the answer of the question
                                                        relating to the condition.
                                                      items:
                                                        type: string
                                                    allow_all_zip:
                                                      type: boolean
                                                      description: |
                                                        If true, the profile will allow all zip codes. If false,
                                                        the profile will only allow the zip codes specified in the data field.
                                                      example: true
                                            DraftInterlockedParticipantProfile:
                                              type: object
                                              required:
                                                - id
                                                - interlock_id
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the draft profile.
                                                  format: ULID
                                                name:
                                                  type: string
                                                  description: The name of the draft profile.
                                                  example: AGE, GENDER
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                  example: true
                                                question_id:
                                                  type: integer
                                                  description: The identifier for the underlying question from the profiling library.
                                                  example: 42
                                                description:
                                                  type: string
                                                  description: A short summary of the profile.
                                                  example: What is your age?
                                                description_translated:
                                                  type: string
                                                  description: Profile description in target language.
                                                  example: What is your age?
                                                interlock_id:
                                                  type: string
                                                  description: The identifier for the interlock that this profile composes.
                                                  format: ULID
                                                is_interlocked:
                                                  type: boolean
                                                  description: Flag indicating if the profile is interlocked.
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupDraftSingularRegularQuotaTemplate'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupDraftGroupedRegularQuotaTemplate'
                                                conditions:
                                                  type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: |
                                                        Object field to distinguish between different types of control selections.
                                                    data:
                                                      oneOf:
                                                        - $ref: '#/components/schemas/DraftInterlockedParticipantSelectionProfileCondition'
                                                        - $ref: '#/components/schemas/DraftInterlockedParticipantRangeProfileCondition'
                                                        - $ref: '#/components/schemas/DraftInterlockedParticipantZipProfileCondition'
                                            TargetGroupDraftInterlockedProfile:
                                              type: object
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  type: string
                                                  description: The identifier for the draft profile.
                                                  format: ULID
                                                name:
                                                  type: string
                                                  description: The name of the draft profile.
                                                  example: AGE, GENDER
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                depends_on_questions:
                                                  type: array
                                                  description: Array of questionIDs that this profile depends on.
                                                  items:
                                                    type: integer
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        type: object
                                                        required:
                                                          - id
                                                        properties:
                                                          id:
                                                            type: string
                                                            format: ULID
                                                            example: 01JABYXDTMNXEKCQQZ5ND4QEAW
                                                          condition:
                                                            $ref: '#/components/schemas/DraftInterlockedProfileConditions'
                                                          quota_percentage:
                                                            type: integer
                                                            description: The quota percentage for the template.
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 40
                                                          quota_nominal:
                                                            type: integer
                                                            minimum: 0
                                                            description: The quota value expressed as a nominal value for the profile template.
                                                            example: 550
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/DraftInterlockedParticipantProfile'
                                            TargetGroupDraftProfile:
                                              type: object
                                              description: Template profile
                                              required:
                                                - profile_adjustment_type
                                              properties:
                                                profile_adjustment_type:
                                                  type: string
                                                  description: The adjustment type for rationalizing quota values using either nominal or percentage-based calculations.
                                                  example: nominal
                                                  enum:
                                                    - percentage
                                                    - nominal
                                                drafts:
                                                  $ref: '#/components/schemas/TargetGroupDraftRegularProfile'
                                                interlocked_profiles:
                                                  type: array
                                                  description: List of interlocked profiles.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupDraftInterlockedProfile'
                                            SupplierResponse:
                                              type: object
                                              properties:
                                                id:
                                                  type: integer
                                                  minimum: 0
                                                  example: 420
                                                name:
                                                  type: string
                                                  minLength: 1
                                                  example: Clix Sense
                                                type:
                                                  type: string
                                                  example: loyalty_panels
                                                  enum:
                                                    - loyalty_panels
                                                    - non_panel_affiliate
                                                    - survey_panel
                                            GetDraftSupplyAllocationGroupResponse:
                                              type: array
                                              items:
                                                oneOf:
                                                  - type: object
                                                    title: SupplyAllocationGroupType
                                                    properties:
                                                      name:
                                                        type: string
                                                        minLength: 1
                                                        example: Group A
                                                      percentage_max:
                                                        type: integer
                                                        nullable: false
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                      type:
                                                        type: string
                                                        enum:
                                                          - group
                                                        description: Descriptor of the Group Allocation type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierResponse'
                                                  - type: object
                                                    title: SupplyAllocationExchangeType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - exchange
                                                        description: Descriptor of the Exchange type.
                                                      percentage_max:
                                                        type: integer
                                                        nullable: false
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierResponse'
                                                  - type: object
                                                    title: SupplyAllocationBlockedType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - blocked
                                                        description: Descriptor of the Blocked type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierResponse'
                                            FetchTargetGroupResponse:
                                              type: object
                                              description: Response object for a target group.
                                              properties:
                                                human_readable_id:
                                                  $ref: '#/components/schemas/TargetGroupHumanReadableID'
                                                name:
                                                  $ref: '#/components/schemas/TargetGroupName'
                                                business_unit_id:
                                                  $ref: '#/components/schemas/BusinessUnitID'
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                collects_pii:
                                                  $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                study_type_code:
                                                  $ref: '#/components/schemas/StudyTypeCode'
                                                industry_code:
                                                  $ref: '#/components/schemas/IndustryCode'
                                                pricing_model:
                                                  $ref: '#/components/schemas/TargetGroupPricingModel'
                                                cost_per_interview:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                client_id:
                                                  $ref: '#/components/schemas/TargetGroupClientID'
                                                client_cost_per_interview_note:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                fielding_specification:
                                                  $ref: '#/components/schemas/TargetGroupFieldingSpecification'
                                                filling_goal:
                                                  $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                expected_length_of_interview_minutes:
                                                  $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                expected_incidence_rate:
                                                  $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                exclusion:
                                                  $ref: '#/components/schemas/TargetGroupExclusionObject'
                                                industry_lockout_code:
                                                  $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                live_url:
                                                  $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                test_url:
                                                  $ref: '#/components/schemas/TargetGroupTestUrl'
                                                fielding_assistant_assignment:
                                                  $ref: '#/components/schemas/FieldingAssistantModulesAssignment'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp indicating when the Target Group was created (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                profile:
                                                  $ref: '#/components/schemas/TargetGroupDraftProfile'
                                                supply_allocations:
                                                  $ref: '#/components/schemas/GetDraftSupplyAllocationGroupResponse'
                                            DraftTargetGroupLinks:
                                              type: object
                                              properties:
                                                links:
                                                  type: object
                                                  description: Contains external Target Group related links.
                                                  properties:
                                                    test_client_survey:
                                                      type: string
                                                      format: uri
                                                      example: https://survey.someexamplesurveylink.com/s3/7189709/Example-survey?RID=[%RID%]
                                                      description: The link into the study that the respondent gets redirected to upon qualification.
                                            UpdateDraftSupplyAllocationGroupRequest:
                                              description: 'A allocation supply group can be of three different types: Group, SystemDefault, Blocked.'
                                              type: array
                                              items:
                                                oneOf:
                                                  - type: object
                                                    title: SupplyAllocationGroupType
                                                    properties:
                                                      percentage_max:
                                                        type: integer
                                                        nullable: false
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                      name:
                                                        type: string
                                                        minLength: 1
                                                        example: Group A
                                                      type:
                                                        type: string
                                                        enum:
                                                          - group
                                                        description: Descriptor of the Group Allocation type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierId'
                                                    required:
                                                      - name
                                                      - type
                                                      - percentage_max
                                                  - type: object
                                                    title: SupplyAllocationExchangeType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - exchange
                                                        description: Descriptor of the Exchange type.
                                                      percentage_max:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 44
                                                      percentage_min:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        maximum: 100
                                                        example: 78
                                                    required:
                                                      - type
                                                      - percentage_max
                                                  - type: object
                                                    title: SupplyAllocationBlockedType
                                                    properties:
                                                      type:
                                                        type: string
                                                        enum:
                                                          - blocked
                                                        description: Descriptor of the Blocked type.
                                                      suppliers:
                                                        nullable: true
                                                        type: array
                                                        items:
                                                          $ref: '#/components/schemas/SupplierId'
                                                    required:
                                                      - type
                                            UpdateDraftTargetGroupRequest:
                                              type: object
                                              description: Request body for updating a target group in draft status.
                                              required:
                                                - name
                                                - business_unit_id
                                                - locale
                                                - project_manager_id
                                                - fielding_specification
                                                - fielding_assistant_assignment
                                                - filling_goal
                                                - profile
                                              properties:
                                                project_manager_id:
                                                  description: The project manager
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/UserID'
                                                fielding_specification:
                                                  $ref: '#/components/schemas/TargetGroupFieldingSpecification'
                                                business_unit_id:
                                                  $ref: '#/components/schemas/BusinessUnitID'
                                                collects_pii:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                cost_per_interview:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                client_cost_per_interview_note:
                                                  $ref: '#/components/schemas/TargetGroupClientCpi'
                                                client_id:
                                                  $ref: '#/components/schemas/TargetGroupClientID'
                                                exclusion:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupExclusionObject'
                                                expected_incidence_rate:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                expected_length_of_interview_minutes:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                filling_goal:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                industry_code:
                                                  allOf:
                                                    - $ref: '#/components/schemas/IndustryCode'
                                                industry_lockout_code:
                                                  nullable: true
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                live_url:
                                                  nullable: true
                                                  maxLength: 3000
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                name:
                                                  minLength: 1
                                                  maxLength: 128
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupName'
                                                study_type_code:
                                                  allOf:
                                                    - $ref: '#/components/schemas/StudyTypeCode'
                                                test_url:
                                                  nullable: true
                                                  maxLength: 3000
                                                  allOf:
                                                    - $ref: '#/components/schemas/TargetGroupTestUrl'
                                                fielding_assistant_assignment:
                                                  $ref: '#/components/schemas/FieldingAssistantModulesAssignment'
                                                profile:
                                                  $ref: '#/components/schemas/TargetGroupDraftProfilesRequest'
                                                supply_allocations:
                                                  $ref: '#/components/schemas/UpdateDraftSupplyAllocationGroupRequest'
                                            MonetaryAmountRequestModel:
                                              type: object
                                              description: Monetary amount.
                                              properties:
                                                value:
                                                  type: string
                                                  description: |
                                                    A decimal encapsulated in a string representing the value in the denomination indicated by the code.
                                                  example: '2.7352'
                                                currency_code:
                                                  $ref: '#/components/schemas/CurrencyCode'
                                            FeasibilityRegularProfileRangeConditionItemV2:
                                              type: object
                                              required:
                                                - min
                                                - max
                                              properties:
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive). Must be smaller than 'max'.
                                                  minimum: 0
                                                  example: 18
                                                max:
                                                  type: integer
                                                  description: The maximum numeric value (inclusive). Must be bigger than 'min'.
                                                  minimum: 0
                                                  example: 60
                                            FeasibilityRegularProfileRangeConditionsV2:
                                              type: object
                                              required:
                                                - object
                                                - data
                                              properties:
                                                object:
                                                  type: string
                                                  description: An object field to distinguish between different types of control selections. always is `range_conditions_details`.
                                                  enum:
                                                    - range_conditions_details
                                                  example: range_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/FeasibilityRegularProfileRangeConditionItemV2'
                                            FeasibilityRegularProfileSelectionConditionsItemV2:
                                              type: object
                                              required:
                                                - option
                                              properties:
                                                option:
                                                  type: string
                                                  description: |
                                                    The number option for the answer of the question relating to the condition.
                                                  example: '1'
                                            FeasibilityRegularProfileSelectionConditionsV2:
                                              type: object
                                              required:
                                                - object
                                                - data
                                              properties:
                                                object:
                                                  type: string
                                                  description: An object field to distinguish between different types of control selections. always is `selection_conditions_details`.
                                                  enum:
                                                    - selection_conditions_details
                                                  example: selection_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/FeasibilityRegularProfileSelectionConditionsItemV2'
                                            FeasibilityRegularProfileZipConditionsItemV2:
                                              type: object
                                              properties:
                                                zip_codes:
                                                  type: array
                                                  description: |
                                                    The number option for the answer of the question relating to the condition.
                                                  items:
                                                    type: string
                                                  example:
                                                    - '40202'
                                                    - '50309'
                                                allow_all_zip:
                                                  type: boolean
                                                  description: |
                                                    If true, the profile will allow all zip codes. If false,
                                                    the profile will only allow the zip codes specified in the data field.
                                                  example: false
                                            FeasibilityRegularProfileZipConditionsV2:
                                              type: object
                                              required:
                                                - object
                                                - data
                                              properties:
                                                object:
                                                  type: string
                                                  description: |
                                                    Object field to distinguish between different types of control selections.
                                                    Always is `zip_conditions_details`.
                                                  enum:
                                                    - zip_conditions_details
                                                  example: zip_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/FeasibilityRegularProfileZipConditionsItemV2'
                                            FeasibilitySingularRegularQuotaV2:
                                              type: object
                                              required:
                                                - index
                                                - quota_percentage
                                              properties:
                                                index:
                                                  type: integer
                                                  minimum: 0
                                                  description: The index of the condition object specified in the conditions array.
                                                  example: 0
                                                quota_percentage:
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                                  description: The quota percentage for the condition.
                                                  example: 100
                                            FeasibilityGroupedRegularQuotaV2:
                                              type: object
                                              required:
                                                - indexes
                                                - quota_percentage
                                              properties:
                                                indexes:
                                                  type: array
                                                  description: An array of indexes for the condition objects specified in the conditions array.
                                                  items:
                                                    type: integer
                                                  example:
                                                    - 1
                                                    - 2
                                                quota_percentage:
                                                  type: integer
                                                  description: The quota percentage for the condition.
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 100
                                            TargetGroupFeasibilityRegularProfileV2:
                                              type: object
                                              required:
                                                - question_id
                                                - conditions
                                              properties:
                                                question_id:
                                                  type: integer
                                                  description: the identifier for the underlying question from the profiling library
                                                  minimum: 0
                                                  example: 42
                                                conditions:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/FeasibilityRegularProfileRangeConditionsV2'
                                                    - $ref: '#/components/schemas/FeasibilityRegularProfileSelectionConditionsV2'
                                                    - $ref: '#/components/schemas/FeasibilityRegularProfileZipConditionsV2'
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/FeasibilitySingularRegularQuotaV2'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/FeasibilityGroupedRegularQuotaV2'
                                              example:
                                                - question_id: 42
                                                  conditions:
                                                    object: range_conditions_details
                                                    data:
                                                      - min: 18
                                                        max: 24
                                                      - min: 25
                                                        max: 35
                                                      - min: 36
                                                        max: 45
                                                  quotas:
                                                    ungrouped:
                                                      - index: 0
                                                        quota_percentage: 100
                                                      - index: 1
                                                        quota_percentage: 25
                                                    grouped:
                                                      - indexes:
                                                          - 1
                                                          - 2
                                                        quota_percentage: 75
                                                - question_id: 41
                                                  conditions:
                                                    object: selection_conditions_details
                                                    data:
                                                      - option: '1'
                                                      - option: '2'
                                                      - option: '3'
                                                  quotas:
                                                    ungrouped:
                                                      - index: 0
                                                        quota_percentage: 75
                                                      - index: 1
                                                        quota_percentage: 75
                                                    grouped:
                                                      - indexes:
                                                          - 1
                                                          - 2
                                                        quota_percentage: 50
                                            TargetGroupFeasibilityInterlockedProfileRelatedConditionValueV2:
                                              type: object
                                              properties:
                                                option:
                                                  type: string
                                                  description: |
                                                    The question option. Only set if the question has selection conditions like Gender question.
                                                  example: '1'
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value. Only set if the question has range conditions like Age question.
                                                  example: 18
                                                max:
                                                  type: integer
                                                  description: |
                                                    The maximum numeric value. Only set if the question has range conditions like Age question.
                                                    Must be bigger than then 'min' property.
                                                  example: 60
                                                zip_codes:
                                                  type: array
                                                  description: Only set if the question is a zip code question.
                                                  items:
                                                    type: string
                                                    description: List of applicable zip codes.
                                                  example:
                                                    - '454'
                                                    - '34534'
                                                allow_all_zip:
                                                  type: boolean
                                                  description: Flag to allow all zip codes. Only set if the question is a zip code question.
                                                  example: true
                                            TargetGroupFeasibilityInterlockedProfileRelatedConditionItemV2:
                                              type: object
                                              required:
                                                - question_id
                                                - conditions
                                              properties:
                                                question_id:
                                                  type: integer
                                                  description: Question identifier. Must be included in property 'depends_on_questions'.
                                                  minimum: 0
                                                  example: 45
                                                conditions:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileRelatedConditionValueV2'
                                            TargetGroupFeasibilityInterlockedProfileConditionV2:
                                              type: object
                                              required:
                                                - related_condition
                                              properties:
                                                related_condition:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileRelatedConditionItemV2'
                                            TargetGroupFeasibilityInterlockedQuotaV2:
                                              type: object
                                              required:
                                                - id
                                                - condition
                                              properties:
                                                id:
                                                  type: string
                                                  description: the ID of the interlocked Quota
                                                  format: ulid
                                                  example: 01GV070G3SJECZAGE3Q3J6FV56
                                                condition:
                                                  $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileConditionV2'
                                                quota_percentage:
                                                  type: integer
                                                  description: |
                                                    The quota percentage for the interlock condition.
                                                    Either provide 'quota_percentage' or 'quota_nominal'.
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 40
                                                quota_nominal:
                                                  type: number
                                                  description: |
                                                    The filling goal for the interlock condition.
                                                    Either provide 'quota_percentage' or 'quota_nominal'.
                                                  minimum: 0
                                                  example: 906
                                            TargetGroupFeasibilityInterlockedProfileV2:
                                              type: object
                                              required:
                                                - quotas
                                              properties:
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedQuotaV2'
                                            TargetGroupFeasibilityAllocationSupplyGroupV2:
                                              type: object
                                              required:
                                                - object
                                                - supplier_ids
                                                - percentage_min
                                                - percentage_max
                                              properties:
                                                object:
                                                  type: string
                                                  description: An object field to distinguish between different types of allocation types. always is `group`.
                                                  enum:
                                                    - group
                                                  example: group
                                                supplier_ids:
                                                  type: array
                                                  description: A list of supplier IDs.
                                                  items:
                                                    type: integer
                                                    minimum: 1
                                                  example:
                                                    - 351
                                                    - 453
                                                    - 459
                                                percentage_min:
                                                  type: integer
                                                  description: |
                                                    The minimum percentage of completes reserved for this group of suppliers.
                                                    Must be lower than percentage_max.
                                                  minimum: 0
                                                  maximum: 100
                                                  example: 30
                                                percentage_max:
                                                  type: integer
                                                  description: |
                                                    The total maximum percentage of completes this group can access.
                                                    Must be bigger than percentage_min.
                                                  minimum: 1
                                                  maximum: 100
                                                  example: 70
                                            TargetGroupFeasibilityAllocationSupplyBlockedV2:
                                              type: object
                                              required:
                                                - object
                                                - supplier_ids
                                              properties:
                                                object:
                                                  type: string
                                                  description: An object field to distinguish between different types of allocation types. always is `blocked`.
                                                  enum:
                                                    - blocked
                                                  example: blocked
                                                supplier_ids:
                                                  type: array
                                                  description: A list of supplier IDs.
                                                  items:
                                                    type: integer
                                                    minimum: 1
                                                  example:
                                                    - 351
                                                    - 453
                                                    - 459
                                            TargetGroupFeasibilityAllocationItemV2:
                                              oneOf:
                                                - $ref: '#/components/schemas/TargetGroupFeasibilityAllocationSupplyGroupV2'
                                                - $ref: '#/components/schemas/TargetGroupFeasibilityAllocationSupplyBlockedV2'
                                            CalculateTargetGroupFeasibilityByIdRequest:
                                              type: object
                                              properties:
                                                locale:
                                                  type: string
                                                  description: Locale code with language and country.
                                                  example: eng_us
                                                collects_pii:
                                                  type: boolean
                                                  description: Indicates whether or not the target group collects Personally Identifiable Information (PII).
                                                  example: true
                                                incidence_rate:
                                                  type: number
                                                  description: Percentage of respondents that will qualify for the study after targeting using standard qualifications.
                                                  minimum: 0
                                                  exclusiveMinimum: true
                                                  maximum: 1
                                                  example: 0.5
                                                length_of_interview:
                                                  type: integer
                                                  description: Expected time to finish the target group in minutes.
                                                  minimum: 1
                                                  maximum: 45
                                                  example: 20
                                                filling_goal:
                                                  type: integer
                                                  description: Indicates the new value for filling goal.
                                                  minimum: 1
                                                  maximum: 10000
                                                  example: 40
                                                start_date:
                                                  type: string
                                                  format: date-time
                                                  description: The start date and time of the target group. Must be earlier than the 'end_date'.
                                                  example: '2024-01-01T14:05:05Z'
                                                end_date:
                                                  type: string
                                                  format: date-time
                                                  description: The end date and time of the target group. Must be later than the 'start_date'.
                                                  example: '2024-01-03T14:05:05Z'
                                                step_days:
                                                  type: number
                                                  minimum: 0
                                                  description: optional value of step days for when FA strategy is even paced.
                                                price:
                                                  description: The desired Cost Per Interview for the filling goal suggestion. Ignored when the pricing is rate card based.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                rate_card_price_boost:
                                                  description: The CPI boost value to apply over the rate card pricing. Ignored when the pricing is not rate card based.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                profiles:
                                                  type: array
                                                  description: List of profiles.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityRegularProfileV2'
                                                interlocked_profiles:
                                                  type: array
                                                  description: List of interlocked profiles.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileV2'
                                                allocations:
                                                  description: List of supply allocations.
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityAllocationItemV2'
                                            TargetGroupFeasibilityProfileQuotaCompletesRangeItemV2:
                                              type: object
                                              required:
                                                - nominal
                                                - percentage
                                              properties:
                                                nominal:
                                                  type: integer
                                                  description: The number of predicted completes.
                                                  minimum: 0
                                                percentage:
                                                  type: integer
                                                  description: The number of predicted completes percentage.
                                                  minimum: 0
                                                  maximum: 100
                                            TargetGroupFeasibilityRegularProfileQuotaCompletesRangeV2:
                                              type: object
                                              description: Contains quota completes feasibility range
                                              required:
                                                - min_completes
                                                - max_completes
                                              properties:
                                                min_completes:
                                                  $ref: '#/components/schemas/TargetGroupFeasibilityProfileQuotaCompletesRangeItemV2'
                                                max_completes:
                                                  $ref: '#/components/schemas/TargetGroupFeasibilityProfileQuotaCompletesRangeItemV2'
                                            TargetGroupFeasibilityRegularProfileQuotaResponseV2:
                                              type: object
                                              description: The Target Group profile per quota feasibility.
                                              required:
                                                - question_id
                                              properties:
                                                question_id:
                                                  type: integer
                                                  description: Uniquely identifies the question used in the profile.
                                                  minimum: 0
                                                  example: 42
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      description: Ungrouped quotas feasibility range objects, ordered based on the ungrouped quotas provided in the feasibility request body.
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupFeasibilityRegularProfileQuotaCompletesRangeV2'
                                                    grouped:
                                                      type: array
                                                      description: Grouped quotas feasibility range objects, ordered based on the grouped quotas provided in the feasibility request body.
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupFeasibilityRegularProfileQuotaCompletesRangeV2'
                                            TargetGroupFeasibilityInterlockedProfileQuotaCompletesRangeV2:
                                              type: object
                                              description: Contains quota completes feasibility range
                                              required:
                                                - id
                                                - min_completes
                                                - max_completes
                                              properties:
                                                id:
                                                  type: string
                                                  description: the ID of the interlocked Quota
                                                  format: ulid
                                                  example: 01GV070G3SJECZAGE3Q3J6FV56
                                                min_completes:
                                                  $ref: '#/components/schemas/TargetGroupFeasibilityProfileQuotaCompletesRangeItemV2'
                                                max_completes:
                                                  $ref: '#/components/schemas/TargetGroupFeasibilityProfileQuotaCompletesRangeItemV2'
                                            TargetGroupFeasibilityInterlockedProfileQuotaResponseV2:
                                              type: object
                                              description: The Interlocked profile per quota feasibility.
                                              required:
                                                - quotas
                                              properties:
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileQuotaCompletesRangeV2'
                                            CalculateTargetGroupFeasibilityResponse:
                                              type: object
                                              description: Target Group feasibility information.
                                              required:
                                                - suggested_price
                                              properties:
                                                suggested_price:
                                                  description: A single value for the suggested price.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                suggested_price_range:
                                                  type: object
                                                  description: If available, will contain suggested price as a range.
                                                  required:
                                                    - min
                                                    - max
                                                  properties:
                                                    min:
                                                      $ref: '#/components/schemas/MonetaryAmount'
                                                    max:
                                                      $ref: '#/components/schemas/MonetaryAmount'
                                                suggested_filling_goal_range:
                                                  type: object
                                                  description: The suggested filling goal range estimates the minimum and maximum number of completions achievable based on the target group details.
                                                  required:
                                                    - min
                                                    - max
                                                  properties:
                                                    min:
                                                      type: integer
                                                      minimum: 0
                                                      example: 25
                                                    max:
                                                      type: integer
                                                      minimum: 0
                                                      example: 30
                                                profiles:
                                                  type: array
                                                  description: Provides feasibility per quota based on the profiles submitted with the request.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityRegularProfileQuotaResponseV2'
                                                interlocked_profiles:
                                                  type: array
                                                  description: Provides feasibility per quota based on the interlocked profiles submitted with the request.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileQuotaResponseV2'
                                            SoftLaunchDemographicsStrictnessPercentage:
                                              type: integer
                                              description: Controls how strictly should the soft launch demographics distribution follow the distribution in the full launch. A setting of 100% aims to fully match the demography, while 0% allows any distribution.
                                              minimum: 0
                                              maximum: 100
                                              example: 5
                                            SoftLaunchFillingGoalPercentage:
                                              type: integer
                                              description: The percentage of the full filling goal to collect during the soft launch phase.
                                              minimum: 0
                                              maximum: 100
                                              example: 25
                                            SoftLaunchEndDate:
                                              type: string
                                              format: date-time
                                              description: The soft launch will be finished at this date, and the target group paused regardless of the fill.
                                              example: '2024-01-01T14:05:05Z'
                                            SoftLaunchAssisted:
                                              description: Assists the target group with soft launch functionality.
                                              type: boolean
                                              example: true
                                            PacingGeminiExposedTargetGroupId:
                                              type: string
                                              format: ulid
                                              description: A 128 bit ULID. 26 characters, consisting of 10 characters representing the timestamp at the time of creation, and 16 characters for randomness.
                                              example: 01HC2K97AV64A8KSJT7GPH4ZC7
                                            PacingIncrementInterval:
                                              type: string
                                              description: |
                                                Positive duration between increment intervals.  Limited to a subset of ISO-8601 duration in format PnDTnHnMnS (Java Duration without fractional seconds). The duration must be less than 398 days (13 months).
                                              format: duration
                                              example: PT12H
                                            PacingStrategy:
                                              description: The pacing strategy.
                                              type: string
                                              enum:
                                                - linear
                                                - adaptive
                                                - gemini
                                              example: linear
                                            QuotaOverlayBalanceFill:
                                              type: boolean
                                              description: Does not let quotas fill faster than the others within the same demography.
                                              example: true
                                            QuotaOverlayPreventOverfilling:
                                              type: boolean
                                              description: Applies a translation to prescreen quota calculation type, that prevents overfills.
                                              example: true
                                            QuotaOverlayAssisted:
                                              description: Assists the target group with quota overlay functionality.
                                              type: boolean
                                              example: true
                                            PricingAssistance:
                                              description: Assist the pricing of the target group.
                                              type: string
                                              enum:
                                                - dynamic
                                              example: dynamic
                                            TargetGroupCpiNote:
                                              description: CPI note is mainly used for information purposes to track internal margin. This property can only be defined on a Target Group with dynamic pricing.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            TargetGroupCpi:
                                              description: Target group CPI.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            FieldingRunStartAt:
                                              type: string
                                              format: date-time
                                              description: The timestamp the fielding run is scheduled to start at(RFC3339 UTC format, 3 fractional digits). The start time cannot be in the past.
                                              example: '2023-01-01T23:00:00.000Z'
                                            FieldingRunEndAt:
                                              type: string
                                              format: date-time
                                              description: 'The timestamp the fielding run is scheduled to end at (RFC3339 UTC format, 3 fractional digits).  The end time has to be after the starting time. '
                                              example: '2023-01-01T23:00:00.000Z'
                                            TargetGroupChangelogItem:
                                              oneOf:
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `soft_launch_demographics_strictness_percentage_change`.
                                                      enum:
                                                        - soft_launch_demographics_strictness_percentage_change
                                                    new_value:
                                                      description: The new value for the demographics strictness. Could be null if the soft launch assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchDemographicsStrictnessPercentage'
                                                    old_value:
                                                      description: The old value for the demographics strictness. Could be null if the soft launch assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchDemographicsStrictnessPercentage'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `soft_launch_filling_goal_percentage_change`.
                                                      enum:
                                                        - soft_launch_filling_goal_percentage_change
                                                    new_value:
                                                      description: The new value for the filling goal. Could be null if the soft launch assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchFillingGoalPercentage'
                                                    old_value:
                                                      description: The old value for the filling goal. Could be null if the soft launch assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchFillingGoalPercentage'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `soft_launch_end_date_change`.
                                                      enum:
                                                        - soft_launch_end_date_change
                                                    new_value:
                                                      description: The new value for the soft launch end date. Could be null if the soft launch assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchEndDate'
                                                    old_value:
                                                      description: The old value for the soft launch end date. Could be null if the soft launch assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchEndDate'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `soft_launch_assisted_change`.
                                                      enum:
                                                        - soft_launch_assisted_change
                                                    new_value:
                                                      description: The new value for the soft launch assistance. Could be null if soft launch assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchAssisted'
                                                    old_value:
                                                      description: The old value for the soft launch assistance. Could be null if soft launch assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/SoftLaunchAssisted'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pacing_gemini_exposed_target_group_id_change`.
                                                      enum:
                                                        - pacing_gemini_exposed_target_group_id_change
                                                    new_value:
                                                      description: The new value for the exposed target group Id. Could be null if the pacing assistance is being switched off or the strategy is being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingGeminiExposedTargetGroupId'
                                                    old_value:
                                                      description: The old value for the exposed target group Id. Could be null if the pacing assistance was switched off or the strategy was being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingGeminiExposedTargetGroupId'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pacing_adaptive_increment_interval_change`.
                                                      enum:
                                                        - pacing_adaptive_increment_interval_change
                                                    new_value:
                                                      description: The new value for the increment interval. Could be null if the pacing assistance is being switched off or the strategy is being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingIncrementInterval'
                                                    old_value:
                                                      description: The old value for the increment interval. Could be null if the pacing assistance was switched off or the strategy was being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingIncrementInterval'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pacing_linear_increment_interval_change`.
                                                      enum:
                                                        - pacing_linear_increment_interval_change
                                                    new_value:
                                                      description: The new value for the increment interval. Could be null if the pacing assistance is being switched off or the strategy is being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingIncrementInterval'
                                                    old_value:
                                                      description: The old value for the increment interval. Could be null if the pacing assistance was switched off or the strategy was being changed.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingIncrementInterval'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pacing_assistance_change`.
                                                      enum:
                                                        - pacing_assistance_change
                                                    new_value:
                                                      description: The new value for the pacing assistance. Could be null if the pacing assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingStrategy'
                                                    old_value:
                                                      description: The old value for the pacing assistance. Could be null if the pacing assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PacingStrategy'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `quota_overlay_balance_fill_change`.
                                                      enum:
                                                        - quota_overlay_balance_fill_change
                                                    new_value:
                                                      description: The new value for balance fill. Could be null if the quota assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayBalanceFill'
                                                    old_value:
                                                      description: The old value for balance fill. Could be null if the quota assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayBalanceFill'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `quota_overlay_prevent_overfilling_change`.
                                                      enum:
                                                        - quota_overlay_prevent_overfilling_change
                                                    new_value:
                                                      description: The new value for prevent overfilling. Could be null if the quota assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayPreventOverfilling'
                                                    old_value:
                                                      description: The old value for prevent overfilling. Could be null if the quota assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayPreventOverfilling'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `quota_overlay_assisted_change`.
                                                      enum:
                                                        - quota_overlay_assisted_change
                                                    new_value:
                                                      description: The new value for the quota assistance. Could be null if quota assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayAssisted'
                                                    old_value:
                                                      description: The old value for the quota assistance. Could be null if quota assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/QuotaOverlayAssisted'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_assistance_change`.
                                                      enum:
                                                        - pricing_assistance_change
                                                    new_value:
                                                      description: The new value for the pricing assistance. Could be null if pricing assistance is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PricingAssistance'
                                                    old_value:
                                                      description: The old value for the pricing assistance. Could be null if pricing assistance was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/PricingAssistance'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_dynamic_total_budget_change`.
                                                      enum:
                                                        - pricing_dynamic_total_budget_change
                                                    new_value:
                                                      description: The new value for the total budget. Could be null if fielding assistant pricing is being switched off or a maximum CPI is being set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                    old_value:
                                                      description: The old value for the total budget. Could be null if fielding assistant pricing was switched off or a maximum CPI was set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_dynamic_maximum_cpi_change`.
                                                      enum:
                                                        - pricing_dynamic_maximum_cpi_change
                                                    new_value:
                                                      description: The new value for the maximum CPI. Could be null if fielding assistant pricing is being switched off or a total budget is being set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                    old_value:
                                                      description: The old value for the maximum CPI. Could be null if fielding assistant pricing was switched off or a total budget was set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_dynamic_minimum_cpi_change`.
                                                      enum:
                                                        - pricing_dynamic_minimum_cpi_change
                                                    new_value:
                                                      description: The new value for the minimum CPI. Could be null if fielding assistant pricing is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                    old_value:
                                                      description: The old value for the minimum CPI. Could be null if fielding assistant pricing was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_dynamic_unlock_max_budget_usage_change`.
                                                      enum:
                                                        - pricing_dynamic_unlock_max_budget_usage_change
                                                    new_value:
                                                      description: The new value for the unlock max budget usage. Could be null if fielding assistant pricing is being switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - description: Flag controlling whether the maximum budget should be prioritized for max CPI capping
                                                        - type: boolean
                                                    old_value:
                                                      description: The old value for the minimum CPI. Could be null if fielding assistant pricing was switched off.
                                                      allOf:
                                                        - nullable: true
                                                        - description: Flag controlling whether the maximum budget should be prioritized for max CPI capping
                                                        - type: boolean
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `pricing_rate_card_maximum_cpi_change`.
                                                      enum:
                                                        - pricing_rate_card_maximum_cpi_change
                                                    new_value:
                                                      description: The new value for the Rate Card maximum CPI.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                    old_value:
                                                      description: The old value for the Rate Card maximum CPI.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/MonetaryAmount'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `name_change`.
                                                      enum:
                                                        - name_change
                                                    new_value:
                                                      description: The new value for name.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupName'
                                                    old_value:
                                                      description: The old value for name. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupName'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `external_name_change`.
                                                      enum:
                                                        - external_name_change
                                                    new_value:
                                                      description: The new value for name.
                                                      allOf:
                                                        - type: string
                                                          description: An external name of the Target Group.
                                                          example: External Target Group Name
                                                    old_value:
                                                      description: The old value for name. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - type: string
                                                          description: An external name of the Target Group.
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `business_unit_id_change`.
                                                      enum:
                                                        - business_unit_change
                                                    new_value:
                                                      description: The new value for business unit id.
                                                      allOf:
                                                        - $ref: '#/components/schemas/BusinessUnitID'
                                                    old_value:
                                                      description: The old value for business unit id. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/BusinessUnitID'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `project_manager_change`.
                                                      enum:
                                                        - project_manager_change
                                                    new_value:
                                                      description: The new value for project manager.
                                                      allOf:
                                                        - type: object
                                                          properties:
                                                            las_user_id:
                                                              allOf:
                                                                - nullable: true
                                                                - $ref: '#/components/schemas/UserID'
                                                    old_value:
                                                      description: The old value for project manager. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - type: object
                                                          properties:
                                                            las_user_id:
                                                              allOf:
                                                                - nullable: true
                                                                - $ref: '#/components/schemas/UserID'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `filling_goal_change`.
                                                      enum:
                                                        - filling_goal_change
                                                    new_value:
                                                      description: The new value for filling goal.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                    old_value:
                                                      description: The old value for filling goal. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `expected_length_of_interview_minutes_change`.
                                                      enum:
                                                        - expected_length_of_interview_minutes_change
                                                    new_value:
                                                      description: The new value for length of interview in minutes.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                    old_value:
                                                      description: The old value for length of interview in minutes. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `expected_incidence_rate_change`.
                                                      enum:
                                                        - expected_incidence_rate_change
                                                    new_value:
                                                      description: The new value for incidence rate.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                    old_value:
                                                      description: The old value for incidence rate. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `study_type_change`.
                                                      enum:
                                                        - study_type_change
                                                    new_value:
                                                      description: The new value for study type.
                                                      allOf:
                                                        - $ref: '#/components/schemas/StudyTypeCode'
                                                    old_value:
                                                      description: The old value for study type. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/StudyTypeCode'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `industry_lockout_code_change`.
                                                      enum:
                                                        - industry_lockout_code_change
                                                    new_value:
                                                      description: The new value for industry lockout code.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                    old_value:
                                                      description: The old value for industry lockout code. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `cpi_note_change`.
                                                      enum:
                                                        - cpi_note_change
                                                    new_value:
                                                      description: The new value for cpi note.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupCpiNote'
                                                    old_value:
                                                      description: The old value for cpi note. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupCpiNote'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `live_url_change`.
                                                      enum:
                                                        - live_url_change
                                                    new_value:
                                                      description: The new value for live url.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                    old_value:
                                                      description: The old value for live url. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `test_url_change`.
                                                      enum:
                                                        - test_url_change
                                                    new_value:
                                                      description: The new value for test url.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupTestUrl'
                                                    old_value:
                                                      description: The old value for test url. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupTestUrl'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `collects_pii_change`.
                                                      enum:
                                                        - collects_pii_change
                                                    new_value:
                                                      description: The new value for name.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                    old_value:
                                                      description: The old value for name. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `cpi_change`.
                                                      enum:
                                                        - cpi_change
                                                    new_value:
                                                      description: The new value for name.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupCpi'
                                                    old_value:
                                                      description: The old value for name. Could be null if the old value was not set.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupCpi'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `status_change`.
                                                      enum:
                                                        - status_change
                                                    new_value:
                                                      description: The new value for the target group status.
                                                      allOf:
                                                        - $ref: '#/components/schemas/TargetGroupStatus'
                                                    old_value:
                                                      description: The old value for the target group status.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/TargetGroupStatus'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `filling_strategy_change`.
                                                      enum:
                                                        - filling_strategy_change
                                                    new_value:
                                                      description: The new value for the filling strategy.
                                                      allOf:
                                                        - $ref: '#/components/schemas/FillingStrategy'
                                                    old_value:
                                                      description: The old value for the filling strategy.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/FillingStrategy'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `currency_change`.
                                                      enum:
                                                        - currency_change
                                                    new_value:
                                                      description: The new value for the currency.
                                                      allOf:
                                                        - $ref: '#/components/schemas/CurrencyCode'
                                                    old_value:
                                                      description: The old value for the currency.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/CurrencyCode'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `locale_change`.
                                                      enum:
                                                        - locale_change
                                                    new_value:
                                                      description: The new value for the locale.
                                                      allOf:
                                                        - $ref: '#/components/schemas/LocaleCode'
                                                    old_value:
                                                      description: The old value for the locale.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/LocaleCode'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: Object field to distinguish between different types of change, always is `project_id_change`.
                                                      enum:
                                                        - project_id_change
                                                    new_value:
                                                      description: The new value for the Project ID.
                                                      allOf:
                                                        - $ref: '#/components/schemas/ProjectID'
                                                    old_value:
                                                      description: The old value for the Project ID.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/ProjectID'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `fielding_period_start_date_change`.
                                                      enum:
                                                        - fielding_period_start_date_change
                                                    new_value:
                                                      description: The new value for the fielding period start date.
                                                      allOf:
                                                        - $ref: '#/components/schemas/FieldingRunStartAt'
                                                    old_value:
                                                      description: The old value for the fielding period start date.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/FieldingRunStartAt'
                                                - type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: object field to distinguish between different types of change. always is `fielding_period_end_date_change`.
                                                      enum:
                                                        - fielding_period_end_date_change
                                                    new_value:
                                                      description: The new value for the fielding period end date.
                                                      allOf:
                                                        - $ref: '#/components/schemas/FieldingRunEndAt'
                                                    old_value:
                                                      description: The old value for the fielding period end date.
                                                      allOf:
                                                        - nullable: true
                                                        - $ref: '#/components/schemas/FieldingRunEndAt'
                                            TargetGroupChangelogBatch:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  description: ID of the batch of changes applied.
                                                occurred_at:
                                                  type: string
                                                  description: Timestamp of when the batch of changes were applied.
                                                user:
                                                  description: The details of the user who caused the batch of changes.
                                                  oneOf:
                                                    - type: object
                                                      properties:
                                                        type:
                                                          type: string
                                                          description: object field to distinguish between different types of users. always is `las_user`.
                                                          enum:
                                                            - las_user
                                                        las_user_id:
                                                          description: The LAS id of the user causing the change.
                                                          allOf:
                                                            - $ref: '#/components/schemas/UserID'
                                                    - type: object
                                                      properties:
                                                        type:
                                                          type: string
                                                          description: object field to distinguish between different types of users. always is `system_marketplace_user`.
                                                          enum:
                                                            - system_marketplace_user
                                                changes:
                                                  type: array
                                                  description: |
                                                    An array of changelog items containing the new and old value for a property. While both the
                                                    new and the old value are nullable, at any given time at most one of them will be null.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupChangelogItem'
                                            TargetGroupChangelogList:
                                              type: object
                                              properties:
                                                changelog:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupChangelogBatch'
                                                next_cursor:
                                                  type: string
                                                  description: Provides the UUID to use as the "start_after" value of the next request. Empty value if no further results.
                                              example:
                                                changelog:
                                                  - id: 1a8fa143-22ee-4b69-9779-401a411152fa
                                                    occurred_at: '2023-09-11T09:27:41Z'
                                                    user:
                                                      type: las_user
                                                      las_user_id: 16839d21-3329-408e-aa53-a7996cb8919e
                                                    changes:
                                                      - object: name_change
                                                        new_value: Typo Fix
                                                        old_value: Tpyo Fix
                                                      - object: test_url_change
                                                        new_value: https://myawesomeresearch.com/test
                                                        old_value: null
                                                      - object: cpi_note_change
                                                        new_value:
                                                          value: '1'
                                                          currency_code: USD
                                                          currency_scale: 2
                                                        old_value:
                                                          value: '5'
                                                          currency_code: USD
                                                          currency_scale: 2
                                                next_cursor: ''
                                            TargetGroupCollectedCompletesAggregatedIntervals:
                                              type: object
                                              required:
                                                - timestamp
                                                - count
                                              properties:
                                                timestamp:
                                                  type: string
                                                  description: The timestamp that represents the time when the aggregated interval ends. RFC3339 UTC format, 3 fractional digits.
                                                  example: '2023-12-30T23:59:59.123Z'
                                                count:
                                                  type: integer
                                                  description: The count of collected completes by the end of the aggregated interval.
                                            TargetGroupCollectedCompletesAggregatedIntervalsResponse:
                                              type: object
                                              required:
                                                - aggregated_completes_intervals
                                              properties:
                                                aggregated_completes_intervals:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupCollectedCompletesAggregatedIntervals'
                                            TargetGroupCpiRequestModel:
                                              description: Target group CPI.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                            CostPerInterviewUpdateRequest:
                                              type: object
                                              description: Cost per interview update request.
                                              required:
                                                - target_group_cpi
                                              properties:
                                                target_group_cpi:
                                                  $ref: '#/components/schemas/TargetGroupCpiRequestModel'
                                            CostPerInterviewUpdateResponse:
                                              type: object
                                              description: Response for cost per interview update.
                                              required:
                                                - target_group_cpi
                                              properties:
                                                target_group_cpi:
                                                  $ref: '#/components/schemas/TargetGroupCpi'
                                            TargetGroupClientCpiMonetaryAmount:
                                              description: This property can only be defined on a Target Group with dynamic pricing. This property must not be defined on Target Groups with rate card pricing.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmount'
                                            TargetGroupDetails:
                                              type: object
                                              description: Contains Target Group details.
                                              required:
                                                - id
                                                - name
                                                - account_name
                                                - business_unit_id
                                                - project_manager_id
                                                - study_type_code
                                                - industry_code
                                                - locale
                                                - filling_goal
                                                - expected_length_of_interview_minutes
                                                - expected_incidence_rate
                                                - industry_lockout_code
                                                - collects_pii
                                                - created_at
                                              properties:
                                                id:
                                                  type: string
                                                  pattern: ^[0-9A-Z]{26}$
                                                  description: ULID identifier of the Target Group.
                                                  example: 01BX5ZZKBKACTAV9WEVGEMMVS1
                                                human_readable_id:
                                                  $ref: '#/components/schemas/TargetGroupHumanReadableID'
                                                name:
                                                  $ref: '#/components/schemas/TargetGroupName'
                                                account_name:
                                                  type: string
                                                  description: Name of the Account to which the Target Group belongs to.
                                                  example: Acme Inc.
                                                business_unit_id:
                                                  $ref: '#/components/schemas/BusinessUnitID'
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                study_type_code:
                                                  $ref: '#/components/schemas/StudyTypeCode'
                                                industry_code:
                                                  $ref: '#/components/schemas/IndustryCode'
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                filling_goal:
                                                  $ref: '#/components/schemas/TargetGroupFillingGoal'
                                                expected_length_of_interview_minutes:
                                                  $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                expected_incidence_rate:
                                                  $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                industry_lockout_code:
                                                  $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                client_cpi:
                                                  $ref: '#/components/schemas/TargetGroupClientCpiMonetaryAmount'
                                                client_id:
                                                  $ref: '#/components/schemas/TargetGroupClientID'
                                                collects_pii:
                                                  $ref: '#/components/schemas/TargetGroupCollectsPII'
                                                live_url:
                                                  $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                test_url:
                                                  $ref: '#/components/schemas/TargetGroupTestUrl'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp indicating when the Target Group was created (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                            TargetGroupLinks:
                                              type: object
                                              properties:
                                                links:
                                                  type: object
                                                  description: Contains external Target Group related links.
                                                  properties:
                                                    test_screener:
                                                      type: string
                                                      format: uri
                                                      example: https://survey.someexamplesurveylink.com/s3/7189709/Example-survey?RID=[%RID%]
                                                      description: The test link into the study that the respondent gets redirected to upon qualification.
                                                    test_client_survey:
                                                      type: string
                                                      format: uri
                                                      example: https://survey.someexamplesurveylink.com/s3/7189709/Example-survey?RID=[%RID%]
                                                      description: The link into the study that the respondent gets redirected to upon qualification.
                                            TargetGroupClientCpiMonetaryAmountRequestModel:
                                              description: This property can only be defined on a Target Group with dynamic pricing. This property must not be defined on Target Groups with rate card pricing.
                                              allOf:
                                                - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                            TargetGroupDetailsUpdateRequest:
                                              type: object
                                              description: The Target Group update request.
                                              required:
                                                - name
                                                - project_manager_id
                                                - expected_length_of_interview_minutes
                                                - expected_incidence_rate
                                                - live_url
                                                - test_url
                                              properties:
                                                name:
                                                  $ref: '#/components/schemas/TargetGroupName'
                                                project_manager_id:
                                                  $ref: '#/components/schemas/UserID'
                                                expected_length_of_interview_minutes:
                                                  $ref: '#/components/schemas/TargetGroupExpectedLengthOfInterview'
                                                expected_incidence_rate:
                                                  $ref: '#/components/schemas/TargetGroupExpectedIncidenceRate'
                                                industry_lockout_code:
                                                  $ref: '#/components/schemas/TargetGroupIndustryLockoutCode'
                                                client_cpi:
                                                  $ref: '#/components/schemas/TargetGroupClientCpiMonetaryAmountRequestModel'
                                                live_url:
                                                  $ref: '#/components/schemas/TargetGroupLiveUrl'
                                                test_url:
                                                  $ref: '#/components/schemas/TargetGroupTestUrl'
                                            UpdatedBy:
                                              type: string
                                              description: Who last updated this entity
                                              example: User1234
                                            UpdateDate:
                                              type: string
                                              format: date-time
                                              example: '2024-01-01T14:05:05Z'
                                              description: Time of last update
                                            PolicyType:
                                              type: string
                                              description: The type of exclusion policy
                                              example: Project
                                            PolicyOrigin:
                                              type: string
                                              description: Indicates where the policy originated from or created from. For instance, Project ID, Tracker ID
                                              example: 01HNAXJEQPAQ7PFVT4C88C545Z
                                            ExclusionEntity:
                                              type: object
                                              description: Contains the information about the excluded respondent type and the identifier
                                              properties:
                                                entity_type:
                                                  $ref: '#/components/schemas/ExclusionEntityType'
                                                entity_id:
                                                  $ref: '#/components/schemas/ExclusionEntityID'
                                            ModuleDynamicPricingRequestModel:
                                              title: Dynamic pricing
                                              type: object
                                              description: This module can only be used for Target Groups with dynamic pricing. It does not support Target Groups with rate card pricing. Controls CPI to try achieving 100% fill at the moment of fielding end date as cheaply as possible. Requires at least one of the upper limits (total budget, maximum CPI) to be specified, but not both simultaneously.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - dynamic
                                                  description: Descriptor of the pricing module type.
                                                total_budget:
                                                  description: Maximum monetary amount to be spent for the target number of completes. Only one of `maximum_cpi` or `total_budget` can be specified.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                maximum_cpi:
                                                  description: Maximum CPI to be set on the Target Group. Must be higher than the minimum, if specified. Only one of `maximum_cpi` or `total_budget` can be specified.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                minimum_cpi:
                                                  description: Minimum CPI to be set on the Target Group. Must be lower than the maximum, if specified. Can be overruled by total budget.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                              required:
                                                - type
                                            ModuleRateCardPricingRequestModel:
                                              title: Rate Card module
                                              type: object
                                              description: This module can only be used for Target Groups with rate card pricing. It does not support Target Groups with dynamic pricing.
                                              properties:
                                                type:
                                                  type: string
                                                  enum:
                                                    - rate_card
                                                  description: Descriptor of the pricing module type.
                                                maximum_cpi:
                                                  description: Maximum CPI to be set on the Target Group. Must be higher than the minimum, if specified.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                boost_cpi:
                                                  description: Additional amount to be added to the CPI inferred from the rate card. Respects maximum CPI.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                              required:
                                                - type
                                            FieldingAssistantModulesAssignmentRequestModel:
                                              title: Fielding Assistant modules assignment
                                              description: Having an assignment enables Fielding Assistant modules on a specified Target Group.  All modules are optional, their omission means they are not enabled.
                                              type: object
                                              properties:
                                                pricing:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/ModuleDynamicPricingRequestModel'
                                                    - $ref: '#/components/schemas/ModuleRateCardPricingRequestModel'
                                                quota_overlay:
                                                  $ref: '#/components/schemas/ModuleQuotaOverlay'
                                                pacing:
                                                  oneOf:
                                                    - $ref: '#/components/schemas/ModuleLinearPacing'
                                                    - $ref: '#/components/schemas/ModuleAdaptivePacing'
                                                soft_launch:
                                                  $ref: '#/components/schemas/ModuleSoftLaunch'
                                            CreateLaunchFieldingRunFromDraftJobRequest:
                                              type: object
                                              description: Request body for creating a `launch fielding run from draft` job.
                                              properties:
                                                end_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: 'The timestamp the fielding run is scheduled to end at (RFC3339 UTC format, 3 fractional digits). '
                                                  example: '2023-01-01T23:00:00.000Z'
                                              required:
                                                - end_fielding_at
                                            TooManyRequestsProblemDetails:
                                              type: object
                                              title: Too many requests problem details
                                              required:
                                                - object
                                                - details
                                              properties:
                                                object:
                                                  type: string
                                                  enum:
                                                    - too_many_requests_problem_details
                                                details:
                                                  type: string
                                            FieldingRunID:
                                              description: The character string representing a unique fielding run ID.
                                              type: string
                                              example: 01BTGNYV6HRNK8K8VKZASZCFP1
                                            FieldingRunJobStatus:
                                              description: The status of an async fielding run job.
                                              type: string
                                              enum:
                                                - Completed
                                                - Failed
                                                - Processing
                                            FieldingRunJobFailureReasonDetail:
                                              type: object
                                              properties:
                                                name:
                                                  type: string
                                                  example: profile_validation_error_001
                                                reason:
                                                  type: string
                                                  example: profile_condition_min_greater_than_max_001
                                                detail:
                                                  type: string
                                                  example: QuestionID - 1, Details - Min > Max - 50-40
                                            FieldingRunJobFailureReason:
                                              type: object
                                              required:
                                                - code
                                                - description
                                              properties:
                                                code:
                                                  type: string
                                                  example: TargetGroupNotFound
                                                description:
                                                  type: string
                                                  example: Target group not found.
                                                reasons:
                                                  type: array
                                                  description: Optional. Includes one or more detailed reason objects about the failure, when applicable.
                                                  items:
                                                    $ref: '#/components/schemas/FieldingRunJobFailureReasonDetail'
                                            JobTraceId:
                                              type: string
                                              description: The trace ID from the creation job request. Only avaialble if the JobStatus is Failure. The trace ID as defined by the W3C trace context specification.
                                              example: 0af7651916cd43dd8448eb211c80319c
                                            GetLaunchFieldingRunFromDraftJobResponse:
                                              type: object
                                              description: Launch fielding run from draft job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                fielding_run_id:
                                                  $ref: '#/components/schemas/FieldingRunID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                created_by:
                                                  $ref: '#/components/schemas/UserID'
                                                status:
                                                  $ref: '#/components/schemas/FieldingRunJobStatus'
                                                failure_reason:
                                                  $ref: '#/components/schemas/FieldingRunJobFailureReason'
                                                job_trace_id:
                                                  $ref: '#/components/schemas/JobTraceId'
                                              required:
                                                - job_id
                                                - created_at
                                                - created_by
                                                - status
                                            CreateScheduleFieldingRunFromDraftJobRequest:
                                              type: object
                                              description: Request body for creating a `schedule fielding run from draft` job.
                                              properties:
                                                start_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the fielding run is scheduled to start at(RFC3339 UTC format, 3 fractional digits). The start time cannot be in the past.
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: 'The timestamp the fielding run is scheduled to end at (RFC3339 UTC format, 3 fractional digits).  The end time has to be after the starting time. '
                                                  example: '2023-01-01T23:00:00.000Z'
                                              required:
                                                - start_fielding_at
                                                - end_fielding_at
                                            GetScheduleFieldingRunFromDraftJobResponse:
                                              type: object
                                              description: Schedule fielding run from draft job details.
                                              properties:
                                                job_id:
                                                  $ref: '#/components/schemas/JobID'
                                                fielding_run_id:
                                                  $ref: '#/components/schemas/FieldingRunID'
                                                created_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                created_by:
                                                  $ref: '#/components/schemas/UserID'
                                                status:
                                                  $ref: '#/components/schemas/FieldingRunJobStatus'
                                                failure_reason:
                                                  $ref: '#/components/schemas/FieldingRunJobFailureReason'
                                                job_trace_id:
                                                  $ref: '#/components/schemas/JobTraceId'
                                              required:
                                                - job_id
                                                - created_at
                                                - created_by
                                                - status
                                            FieldingRunStatus:
                                              description: The status of a fielding run.
                                              type: string
                                              enum:
                                                - Scheduled
                                                - Live
                                                - Paused
                                                - Completed
                                            FieldingRunItem:
                                              type: object
                                              description: Fielding run details.
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/FieldingRunID'
                                                last_changed_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2024-01-01T14:05:05Z'
                                                last_changed_by:
                                                  $ref: '#/components/schemas/UserID'
                                                start_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  example: '2023-01-01T23:00:00.000Z'
                                                status:
                                                  $ref: '#/components/schemas/FieldingRunStatus'
                                                version:
                                                  type: integer
                                                  description: Identifies a fielding run version
                                                  example: 5
                                              required:
                                                - id
                                                - last_changed_at
                                                - last_changed_by
                                                - start_fielding_at
                                                - end_fielding_at
                                                - status
                                                - version
                                            GetListFieldingRunsResponse:
                                              type: object
                                              description: List of fielding runs for a given target group id.
                                              properties:
                                                data:
                                                  type: array
                                                  description: Array of fielding run list items, representing the results of the query. Currently, this array will contain at most one fielding run.
                                                  items:
                                                    $ref: '#/components/schemas/FieldingRunItem'
                                                has_more:
                                                  type: boolean
                                                  description: If there are further results to be shown. Currently, this property will consistently return false.
                                                  enum:
                                                    - false
                                              required:
                                                - data
                                                - has_more
                                            UpdateFieldingRunRequest:
                                              type: object
                                              description: Request for updating a fielding run for a given target group id.
                                              properties:
                                                start_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the fielding run is scheduled to start at(RFC3339 UTC format, 3 fractional digits). The start time cannot be in the past.
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: 'The timestamp the fielding run is scheduled to end at (RFC3339 UTC format, 3 fractional digits).  The end time has to be after the starting time. '
                                                  example: '2023-01-01T23:00:00.000Z'
                                              required:
                                                - start_fielding_at
                                                - end_fielding_at
                                            UpdateFieldingRunResponse:
                                              type: object
                                              description: Response for updating a fielding run for a given target group id.
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/FieldingRunID'
                                              required:
                                                - id
                                            LaunchNowFieldingRunResponse:
                                              type: object
                                              description: Response for launching a fielding run now.
                                              properties:
                                                start_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the fielding run is scheduled to start at(RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_fielding_at:
                                                  type: string
                                                  format: date-time
                                                  description: 'The timestamp the fielding run is scheduled to end at (RFC3339 UTC format, 3 fractional digits). '
                                                  example: '2023-01-01T23:00:00.000Z'
                                              required:
                                                - start_fielding_at
                                                - end_fielding_at
                                            FillingStrategyUpdateRequest:
                                              type: object
                                              description: Filling strategy update request.
                                              required:
                                                - filling_strategy
                                              properties:
                                                filling_strategy:
                                                  $ref: '#/components/schemas/FillingStrategy'
                                            FillingStrategyUpdateResponse:
                                              type: object
                                              description: Response for filling strategy update.
                                              required:
                                                - filling_strategy
                                              properties:
                                                filling_strategy:
                                                  $ref: '#/components/schemas/FillingStrategy'
                                            ProfileID:
                                              type: string
                                              description: Profile identifier
                                              example: '1000'
                                            GeoTargetingItem:
                                              type: array
                                              items:
                                                type: object
                                                properties:
                                                  lat:
                                                    type: number
                                                    example: 29.909
                                                  lon:
                                                    type: number
                                                    example: -90.051406
                                            TargetGroupOverview:
                                              type: object
                                              description: Basic attributes and statistics of a Target Group.
                                              required:
                                                - project_name
                                                - target_group_name
                                                - progress
                                                - pricing_model
                                                - is_pricing_restricted
                                                - current_cost_per_interview
                                                - current_cost
                                                - status
                                                - country_code
                                                - language_code
                                                - conversion_rate
                                                - drop_off_rate
                                                - incidence_rate
                                                - median_length_of_interview_seconds
                                              properties:
                                                project_name:
                                                  type: string
                                                  description: Name of the Project which contains the Target Group.
                                                  example: Example Project
                                                target_group_name:
                                                  type: string
                                                  description: Name of the Target Group.
                                                  example: Example Target Group
                                                human_readable_id:
                                                  $ref: '#/components/schemas/TargetGroupHumanReadableID'
                                                progress:
                                                  $ref: '#/components/schemas/TargetGroupProgress'
                                                pricing_model:
                                                  $ref: '#/components/schemas/TargetGroupPricingModel'
                                                is_pricing_restricted:
                                                  type: boolean
                                                  description: True when there are target group CPI restrictions in place from fielding assistant, otherwise false.
                                                  example: true
                                                current_cost_per_interview:
                                                  description: Currently active Cost per Interview for the Target Group.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                average_cost_per_interview:
                                                  description: Average Cost per Interview for the Target Group.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                current_cost:
                                                  description: The total cost of the completes collected so far in this Target Group.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmount'
                                                status:
                                                  $ref: '#/components/schemas/TargetGroupStatus'
                                                country_code:
                                                  type: string
                                                  description: String representing country code.
                                                  example: US
                                                language_code:
                                                  type: string
                                                  description: String representing language code.
                                                  example: ENG
                                                conversion_rate:
                                                  $ref: '#/components/schemas/ConversionRate'
                                                drop_off_rate:
                                                  $ref: '#/components/schemas/DropOffRate'
                                                incidence_rate:
                                                  $ref: '#/components/schemas/IncidenceRate'
                                                median_length_of_interview_seconds:
                                                  $ref: '#/components/schemas/MedianLengthOfInterviewSeconds'
                                                study_type_code:
                                                  $ref: '#/components/schemas/StudyTypeCode'
                                            RespondentAnalysisStatusCodes:
                                              type: object
                                              description: Respondent analysis grouped status codes and counts.
                                              properties:
                                                status:
                                                  type: string
                                                  description: Status code.
                                                  example: Complete, Terminate, In Survey, Overquota
                                                label:
                                                  type: string
                                                  description: Label of status code.
                                                  example: Returned as Complete
                                                description:
                                                  type: string
                                                  description: Description of status code.
                                                  example: Respondent completed the survey
                                                count:
                                                  type: integer
                                                  description: Count of status code.
                                                  example: 100
                                            RegularProfileRangeConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of control selections. always is `range_conditions_details`.
                                                  enum:
                                                    - range_conditions_details
                                                  example: range_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: string
                                                        description: the identifier for the condition.
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                                      min:
                                                        type: integer
                                                        description: The minimum numeric value (inclusive).
                                                      max:
                                                        type: integer
                                                        description: The maximum numeric value (inclusive).
                                              example:
                                                object: range_conditions_details
                                                data:
                                                  - id: '18_24'
                                                    text: 18 to 24 years old
                                                    min: 18
                                                    max: 24
                                                  - id: '25_35'
                                                    text: 25 to 35 years old
                                                    min: 25
                                                    max: 35
                                                  - id: '36_45'
                                                    text: 36 to 46 years old
                                                    min: 36
                                                    max: 45
                                            RegularProfileSelectionConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of control selections. always is `selection_conditions_details`.
                                                  enum:
                                                    - selection_conditions_details
                                                  example: selection_conditions_details
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: string
                                                        description: the identifier for the condition
                                                      text:
                                                        type: string
                                                        description: text description for the condition.
                                              example:
                                                object: selection_conditions_details
                                                data:
                                                  - id: '1'
                                                    text: Male
                                                  - id: '2'
                                                    text: Female
                                                  - id: '3'
                                                    text: Other
                                            RegularProfileConditions:
                                              oneOf:
                                                - $ref: '#/components/schemas/RegularProfileRangeConditions'
                                                - $ref: '#/components/schemas/RegularProfileSelectionConditions'
                                            QuotaID:
                                              type: string
                                              description: unique identifier of quota
                                              example: '101010'
                                            SingularRegularQuota:
                                              type: object
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/QuotaID'
                                                condition:
                                                  type: string
                                                  description: the identifier of the condition the quota is defined for
                                                  example: '18_24'
                                                quota:
                                                  type: integer
                                                  minimum: 0
                                                  description: the quota value for the condition
                                                  example: 40
                                                filling_goal:
                                                  type: integer
                                                  minimum: 0
                                                  description: Filling Goal associated with the quota.
                                                  example: 100
                                                prescreens:
                                                  type: integer
                                                  description: the prescreens value for the condition
                                                  minimum: 0
                                                  example: 550
                                                completes:
                                                  type: integer
                                                  description: the completes value for the condition
                                                  minimum: 0
                                                  example: 50
                                            GroupedRegularQuota:
                                              type: object
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/QuotaID'
                                                name:
                                                  type: string
                                                  description: the name of the group of conditions
                                                  maxLength: 64
                                                  example: Group 1
                                                conditions:
                                                  type: array
                                                  description: the identifiers of the conditions the quota is defined for
                                                  items:
                                                    type: string
                                                  example:
                                                    - '25_35'
                                                    - '36_45'
                                                quota:
                                                  type: integer
                                                  description: the quota value for the condition
                                                  minimum: 0
                                                  example: 40
                                                filling_goal:
                                                  type: integer
                                                  minimum: 0
                                                  description: Filling Goal associated with the quota.
                                                  example: 100
                                                prescreens:
                                                  type: integer
                                                  description: the prescreens value for the condition
                                                  minimum: 0
                                                  example: 550
                                                completes:
                                                  type: integer
                                                  description: the completes value for the condition
                                                  minimum: 0
                                                  example: 50
                                            RegularProfile:
                                              type: object
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/ProfileID'
                                                question_id:
                                                  type: integer
                                                  description: the identifier for the underlying question from the profiling library
                                                  example: 42
                                                name:
                                                  type: string
                                                  description: the name of the profile
                                                  example: Age
                                                description:
                                                  type: string
                                                  description: a short summary of the profile
                                                  example: What is your age?
                                                conditions:
                                                  $ref: '#/components/schemas/RegularProfileConditions'
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SingularRegularQuota'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/GroupedRegularQuota'
                                            ListRegularProfiles:
                                              type: object
                                              description: Lists non-interlocked, non-control profiles.
                                              properties:
                                                data:
                                                  type: array
                                                  description: List of profiles.
                                                  items:
                                                    $ref: '#/components/schemas/RegularProfile'
                                            RegularProfileCreationRangeConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of control selections. always is `range_conditions`.
                                                  enum:
                                                    - range_conditions
                                                  example: range_conditions
                                                data:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      min:
                                                        type: integer
                                                        description: The minimum numeric value (inclusive).
                                                        example: 18
                                                      max:
                                                        type: integer
                                                        description: The maximum numeric value (inclusive).
                                                        example: 24
                                              example:
                                                object: range_conditions
                                                data:
                                                  - min: 18
                                                    max: 24
                                                  - min: 25
                                                    max: 35
                                                  - min: 36
                                                    max: 45
                                            RegularProfileCreationSelectionConditions:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of control selections. always is `selection_conditions`.
                                                  enum:
                                                    - selection_conditions
                                                  example: selection_conditions
                                                data:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: ID of the selections
                                              example:
                                                object: selection_conditions
                                                data:
                                                  - '1'
                                                  - '2'
                                                  - '3'
                                            RegularProfileCreationConditions:
                                              oneOf:
                                                - $ref: '#/components/schemas/RegularProfileCreationRangeConditions'
                                                - $ref: '#/components/schemas/RegularProfileCreationSelectionConditions'
                                            ProfileCreationRequest:
                                              type: object
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                conditions:
                                                  $ref: '#/components/schemas/RegularProfileCreationConditions'
                                            ConditionGroupingRequest:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  description: The grouping state you want to have on the conditions
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                        description: The name of the group
                                                        maxLength: 64
                                                      conditions:
                                                        type: array
                                                        description: List of condition IDs you want to be a member of the group
                                                        items:
                                                          type: string
                                              example:
                                                data:
                                                  - name: Group 1
                                                    conditions:
                                                      - '100'
                                                      - '101'
                                                      - '102'
                                            ApplyProfileRequest:
                                              type: object
                                              properties:
                                                locale:
                                                  type: string
                                                filling_goal:
                                                  type: integer
                                                profile_adjustment_type:
                                                  type: string
                                                profiles:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      question_id:
                                                        $ref: '#/components/schemas/QuestionID'
                                                      name:
                                                        type: string
                                                      quotas_enabled:
                                                        type: boolean
                                                      conditions:
                                                        oneOf:
                                                          - $ref: '#/components/schemas/ApplyProfileRangedConditions'
                                                          - $ref: '#/components/schemas/ApplyProfileSelectionsConditions'
                                                          - $ref: '#/components/schemas/ApplyProfileZipConditions'
                                                      quotas:
                                                        $ref: '#/components/schemas/ApplyProfileRequestQuotas'
                                            BatchProfilesQuotasDeletionRequest:
                                              type: object
                                              properties:
                                                profiles:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      profile:
                                                        $ref: '#/components/schemas/ProfileID'
                                                      quotas:
                                                        type: array
                                                        description: IDs of the target group profiles quotas you want to delete.
                                                        items:
                                                          $ref: '#/components/schemas/QuotaID'
                                            BatchProfileDeletionRequest:
                                              type: object
                                              properties:
                                                profiles:
                                                  type: array
                                                  description: IDs of the profiles you want to delete
                                                  items:
                                                    $ref: '#/components/schemas/ProfileID'
                                              example:
                                                profiles:
                                                  - '101010'
                                                  - '101011'
                                            FillingGoalUpdateRequest:
                                              type: object
                                              description: Filling goal update request.
                                              properties:
                                                filling_goal:
                                                  type: integer
                                                  format: int32
                                                  description: Indicates the new value for target group filling goal
                                                  minimum: 1
                                                  example: 1000
                                                  nullable: true
                                                profiles:
                                                  type: array
                                                  description: A list of profiles and filling goals with the associated profile IDs
                                                  items:
                                                    type: object
                                                    properties:
                                                      profile_id:
                                                        $ref: '#/components/schemas/ProfileID'
                                                      quotas:
                                                        type: array
                                                        description: A list of filling goals with the associated quota IDs
                                                        items:
                                                          type: object
                                                          properties:
                                                            quota_id:
                                                              type: string
                                                              description: The quota ID of the quota being updated
                                                              example: '1234'
                                                            filling_goal:
                                                              type: integer
                                                              format: int32
                                                              minimum: 0
                                                              description: Indicates the new value for filling goal.
                                                              example: 750
                                            QuotaFillingGoal:
                                              type: integer
                                              format: int64
                                              example: 100
                                              minimum: 1
                                              maximum: 10000
                                              description: The filling goal for a given quota/condition.
                                            FetchTargetGroupQuotaDistribution:
                                              type: object
                                              description: Response object for a target group quota distribution.
                                              properties:
                                                quota_updates_allowed:
                                                  type: boolean
                                                condition_quota_distribution:
                                                  type: array
                                                  items:
                                                    type: object
                                                    description: Container for the distributed value of a quota's filling goal
                                                    properties:
                                                      quota_id:
                                                        $ref: '#/components/schemas/QuotaID'
                                                      filling_goal:
                                                        $ref: '#/components/schemas/QuotaFillingGoal'
                                            CalculateTargetGroupFeasibilityRequest:
                                              type: object
                                              required:
                                                - business_unit_id
                                                - locale
                                                - incidence_rate
                                                - length_of_interview
                                                - filling_goal
                                                - start_date
                                                - end_date
                                              properties:
                                                business_unit_id:
                                                  type: integer
                                                  description: Unique identifier of the business unit.
                                                  example: 1234
                                                locale:
                                                  type: string
                                                  description: Locale code with language and country.
                                                  example: eng_us
                                                collects_pii:
                                                  type: boolean
                                                  description: Indicates whether or not the target group collects Personally Identifiable Information (PII).
                                                  example: true
                                                incidence_rate:
                                                  type: number
                                                  description: Percentage of respondents that will qualify for the study after targeting using standard qualifications.
                                                  minimum: 0
                                                  exclusiveMinimum: true
                                                  maximum: 1
                                                  example: 0.5
                                                length_of_interview:
                                                  type: integer
                                                  description: Expected time to finish the target group in minutes.
                                                  minimum: 1
                                                  maximum: 45
                                                  example: 20
                                                filling_goal:
                                                  type: integer
                                                  description: Indicates the new value for filling goal.
                                                  minimum: 1
                                                  maximum: 10000
                                                  example: 40
                                                start_date:
                                                  type: string
                                                  format: date-time
                                                  description: The start date and time of the target group. Must be earlier than the 'end_date'.
                                                  example: '2024-01-01T14:05:05Z'
                                                end_date:
                                                  type: string
                                                  format: date-time
                                                  description: The end date and time of the target group. Must be later than the 'start_date'.
                                                  example: '2024-01-03T14:05:05Z'
                                                step_days:
                                                  type: number
                                                  minimum: 0
                                                  description: optional value of step days for when FA strategy is even paced.
                                                price:
                                                  description: The desired Cost Per Interview for the filling goal suggestion. The price is ignored if it is rate card target group.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                rate_card_price_boost:
                                                  description: The CPI boost value to apply over the rate card pricing. Ignored when the pricing is not rate card based.
                                                  allOf:
                                                    - $ref: '#/components/schemas/MonetaryAmountRequestModel'
                                                profiles:
                                                  type: array
                                                  description: List of profiles.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityRegularProfileV2'
                                                interlocked_profiles:
                                                  type: array
                                                  description: List of interlocked profiles.
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityInterlockedProfileV2'
                                                allocations:
                                                  description: List of supply allocations.
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/TargetGroupFeasibilityAllocationItemV2'
                                            FileName:
                                              description: The name of the file.
                                              type: string
                                              example: filename.csv
                                              maxLength: 255
                                            NextCursorULID:
                                              type: string
                                              pattern: ^[0-9A-Z]{26}$
                                              example: 01BTGNYV6HRNK8K8VKZASZCFP0
                                              description: An ID of the next list of items and indicator that there are more items than currently viewable.
                                            ReconciliationRequestSubmittedCount:
                                              type: object
                                              properties:
                                                submitted:
                                                  type: integer
                                                  example: 10
                                                expired:
                                                  type: integer
                                                  example: 0
                                                invalid:
                                                  type: integer
                                                  example: 0
                                                total_reversed:
                                                  type: integer
                                                  example: 10
                                                positive_reversed:
                                                  type: integer
                                                  example: 10
                                                negative_reversed:
                                                  type: integer
                                                  example: 0
                                            ReconciliationRequests:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  example: 01HW8HMCD3FHC985ZFMEERX0YY
                                                name:
                                                  type: string
                                                  example: filename.csv
                                                submitted_at:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp when the reconciliation file was submitted (RFC3339 UTC format).
                                                  example: '2023-03-17T12:34:56Z'
                                                status:
                                                  type: string
                                                  example: PROCESSING
                                                submitted_by_user_id:
                                                  type: string
                                                  example: c6eea0ec-fc9e-44de-bb0b-ed104022e576
                                                result_counts:
                                                  $ref: '#/components/schemas/ReconciliationRequestSubmittedCount'
                                            ReconciliationsFiles:
                                              description: Response object for a list of reconciliations files.
                                              type: object
                                              properties:
                                                reconciliation_requests:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ReconciliationRequests'
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                                page_size:
                                                  type: integer
                                                  example: 10
                                            SubmitReconciliationsResponse:
                                              description: response model of requested reconciliations data
                                              type: object
                                              properties:
                                                request_name:
                                                  type: string
                                                request_id:
                                                  type: string
                                                  format: ulid
                                            RequestID:
                                              type: string
                                              pattern: ^[0-9A-Z]{26}$
                                              description: ULID that uniquely identifies a reconciliation record.
                                              example: 01BX5DZKBKACTAV9WEVGEMMVS1
                                            Reconciliation:
                                              type: object
                                              properties:
                                                request_id:
                                                  $ref: '#/components/schemas/RequestID'
                                                name:
                                                  description: The name of the submitted reconciliation file
                                                  type: string
                                                  example: Test_CSV_File_2312412
                                                status:
                                                  description: the status of the reconciliation file
                                                  type: string
                                                  enum:
                                                    - complete
                                                    - processing
                                                submitted_at:
                                                  type: string
                                                  format: date-time
                                                  description: DateTime Follows RFC3339
                                                submitter_las_id:
                                                  type: string
                                                  format: date-time
                                                  description: Submitter LAS UUID
                                                  example: 4325c214c-2d72-7as2-b498-d6345342ff10b0
                                                submitted_count:
                                                  type: integer
                                                  description: the number of RIDs in total that were submitted
                                                  example: 20
                                                expired_count:
                                                  type: integer
                                                  description: the number of RIDs that don't fit in the reconciliation window
                                                  example: 6
                                                invalid_count:
                                                  type: integer
                                                  description: the number of invalid RIDs processed
                                                  example: 4
                                                positive_reversed_count:
                                                  type: integer
                                                  description: the number of RIDs processed to positive statuses
                                                  example: 7
                                                negative_reversed_count:
                                                  type: integer
                                                  description: the number of RIDs processed to negative statuses
                                                  example: 3
                                            ReconciliationDownloadType:
                                              type: string
                                              description: Reconciliation file types available for download.
                                              enum:
                                                - submitted-rids
                                                - expired-rids
                                                - invalid-rids
                                                - audit-overturned-negative-rids
                                            ReconciliationsTargetGroup:
                                              type: object
                                              properties:
                                                target_group_id:
                                                  $ref: '#/components/schemas/TargetGroupID'
                                                status:
                                                  description: the status of the reconciliation file
                                                  type: string
                                                  enum:
                                                    - complete
                                                    - processing
                                                submitted_count:
                                                  type: integer
                                                  description: the number of RIDs in total that were submitted
                                                  example: 20
                                                expired_count:
                                                  type: integer
                                                  description: the number of RIDs that don't fit in the reconciliation window
                                                  example: 6
                                                invalid_count:
                                                  type: integer
                                                  description: the number of invalid RIDs processed
                                                  example: 4
                                                positive_reversed_count:
                                                  type: integer
                                                  description: the number of RIDs processed to positive statuses
                                                  example: 7
                                                negative_reversed_count:
                                                  type: integer
                                                  description: the number of RIDs processed to negative statuses
                                                  example: 3
                                            RequestReconciliationsTargetGroups:
                                              description: Successfully returns a paginated list of target groups associated to a reconciliation request id.
                                              type: object
                                              properties:
                                                target_groups:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ReconciliationsTargetGroup'
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                                page_size:
                                                  type: integer
                                                  example: 1
                                            ReconciliationsEligibleTargetGroups:
                                              type: object
                                              properties:
                                                name:
                                                  type: string
                                                  description: Target group name
                                                target_group_id:
                                                  type: string
                                                  description: Target group identifier
                                                project_id:
                                                  type: string
                                                  description: Project identifier
                                                project_manager:
                                                  type: object
                                                  properties:
                                                    id:
                                                      type: string
                                                      description: Project manager ID
                                                    name:
                                                      type: string
                                                      description: Project manager name
                                                    email:
                                                      type: string
                                                      description: Project manager email
                                                status:
                                                  type: string
                                                  description: Target group status. This field is optional and may be omitted if the status is not available.
                                                project_name:
                                                  type: string
                                                  description: Project name. This field is optional and may be omitted if the status is not available.
                                                last_reconciliation_date:
                                                  type: string
                                                  format: date-time
                                                  description: Last reconciliation date in RFC3339 format. This field is optional and may be omitted if the status is not available.
                                            ReconciliationsEligibleTargetGroupsResponse:
                                              type: object
                                              properties:
                                                target_groups:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ReconciliationsEligibleTargetGroups'
                                                next_cursor:
                                                  type: string
                                                  description: Cursor for pagination. This field is optional and may be omitted if there are no more pages.
                                                page_size:
                                                  type: integer
                                                  description: Number of items per page
                                            ReconciliationReasonCodes:
                                              type: object
                                              properties:
                                                code:
                                                  description: The ID of the reconciliation reason code
                                                  type: string
                                                  example: '11'
                                                name:
                                                  description: The title of the reconciliation reason code
                                                  type: string
                                                  example: Adjusted Complete
                                                description:
                                                  description: The description of the reconciliation reason code
                                                  type: string
                                                  example: Respondent was adjusted from another status to complete via reconciliation
                                            ReconciliationReasonCodesResponse:
                                              description: response model of requested reconciliations reason code data
                                              type: object
                                              properties:
                                                reconciliation_reasons:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ReconciliationReasonCodes'
                                            Authorization:
                                              description: LAS access token containing LAS user id of requestor. Should be of form Bearer {{access token}}
                                              type: string
                                            ReportType:
                                              type: string
                                              description: Report type to be generated.
                                              enum:
                                                - completes
                                                - reconciliations
                                                - reconciliations-status
                                                - reconciliation-eligible-rids
                                                - sample-bought
                                                - respondent-analysis
                                                - term-details
                                            AccountName:
                                              description: |
                                                Name of the account
                                              type: string
                                              nullable: true
                                              example: Lucid Marketplace Services
                                            ReportRequestListItem:
                                              type: object
                                              description: An individual Report Request in list of items.
                                              required:
                                                - account_name
                                                - create_date
                                                - create_params
                                                - report_id
                                                - report_type
                                                - report_url
                                                - status
                                                - requestor_name
                                              properties:
                                                account_name:
                                                  $ref: '#/components/schemas/AccountName'
                                                create_date:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp the report was created.
                                                  example: '2024-01-25 01:33:59'
                                                create_params:
                                                  type: string
                                                  description: Create params of the request
                                                requestor_name:
                                                  type: string
                                                  description: Report Requestor Name
                                                  example: John Doe
                                                report_id:
                                                  type: string
                                                  format: uuid
                                                  description: Id of the report
                                                  example: 8b60d37e-af52-45f1-ad5e-e92acc38e01d
                                                report_type:
                                                  type: string
                                                  description: Report Type
                                                  example: sample-bought
                                                report_url:
                                                  type: string
                                                  description: Report URL
                                                  example: https://example.com/completes-buyside-{accountname}.csv
                                                status:
                                                  type: string
                                                  description: Status of the report
                                                  enum:
                                                    - pending
                                                    - completed
                                                    - failed
                                                  example: completed
                                            ReportRequestList:
                                              type: object
                                              description: Paginated list of Report Request.
                                              required:
                                                - reports_requests
                                              properties:
                                                next_cursor:
                                                  $ref: '#/components/schemas/NextCursor'
                                                reports_requests:
                                                  type: array
                                                  description: Array of Report request list item.
                                                  items:
                                                    $ref: '#/components/schemas/ReportRequestListItem'
                                            ReportId:
                                              type: string
                                              description: Unique report id for that file
                                              example: 01CTGNYV6HRNK8K8VKZASZCFP1
                                            ReportShareResponse:
                                              type: object
                                              description: Report share response.
                                              properties:
                                                report_pre_signed_url:
                                                  type: string
                                            ReportStatusResponse:
                                              type: object
                                              description: Report status response.
                                              properties:
                                                report_id:
                                                  type: string
                                                  format: ulid
                                                  example: 01HY3NF37B6J2ABPA3H49C92YZ
                                                status:
                                                  type: string
                                                  example: COMPLETED
                                                message:
                                                  type: string
                                                  example: Job successful
                                                start_date:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp indicating when the report start date (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-01T23:00:00.000Z'
                                                end_date:
                                                  type: string
                                                  format: date-time
                                                  description: The timestamp indicating when the report end date (RFC3339 UTC format, 3 fractional digits).
                                                  example: '2023-01-11T23:00:00.000Z'
                                                report_url:
                                                  type: string
                                                  example: https://exchange.cint.com/download?file=1_completes_2024_02_29_22_26_03_Marketplace_Services.csv&download_url=%2Fdemand%2Faccounts%1F1%2Freports%2Fdownload%3Freport_type%3Dcompletes%26file%3D01HQVFK0PC5HWV2F4YQPJ5E%2F1__2024_02_29_22_26_03_Marketplace_Services.csv&type=report
                                            ReportGenerationRequest:
                                              type: object
                                              description: Report Generation request Body.
                                              properties:
                                                filter:
                                                  type: string
                                                  description: Type of filter
                                                  enum:
                                                    - Business Unit
                                                    - Target Group
                                                    - Project
                                                  example: Business Unit
                                                start_date:
                                                  type: string
                                                  description: Start Date for date filter
                                                  example: '2023-08-01'
                                                end_date:
                                                  type: string
                                                  description: End Date for date filter
                                                  example: '2023-08-30'
                                                filter_ids:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: IDs of objects for the filter type
                                                    minimum: 1
                                                    maximum: 50
                                                report_options:
                                                  type: object
                                                  nullable: true
                                                  properties:
                                                    include_respondent_answers:
                                                      type: boolean
                                                      description: Include respondent answers in report.
                                                      nullable: true
                                                    link_type:
                                                      type: number
                                                      format: int
                                                      description: Link type ID for term details report
                                                      nullable: true
                                            ReportGenerationResponse:
                                              type: object
                                              description: Response for report generation
                                              required:
                                                - message
                                                - report_id
                                                - report_url
                                                - start_date
                                                - end_date
                                                - status
                                              properties:
                                                message:
                                                  type: string
                                                  description: Message from the reports-api
                                                  example: Report Created
                                                report_id:
                                                  type: string
                                                  format: uuid
                                                  description: Id of the report
                                                  example: 8b60d37e-af52-45f1-ad5e-e92acc38e01d
                                                report_url:
                                                  type: string
                                                  description: Report URL
                                                  example: https://example.com/completes-buyside-{accountname}.csv
                                                start_date:
                                                  type: string
                                                  description: Start Date of the report
                                                  example: '2023-08-01'
                                                end_date:
                                                  type: string
                                                  description: End Date of the report
                                                  example: '2023-08-30'
                                                status:
                                                  type: string
                                                  description: Status of the report
                                                  enum:
                                                    - pending
                                                    - emailed
                                                    - failed
                                                  example: pending
                                            ReportFileName:
                                              type: string
                                              description: Name of the report file.
                                            GlobalAllocationTemplateListItem:
                                              type: object
                                              title: Global allocation template list item.
                                              required:
                                                - template_id
                                                - name
                                                - last_modified_at
                                                - last_modified_by
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                                name:
                                                  type: string
                                                  description: The name of the global allocation template.
                                                last_modified_at:
                                                  $ref: '#/components/schemas/LastModifiedAt'
                                                last_modified_by:
                                                  $ref: '#/components/schemas/UserID'
                                            ListGlobalAllocationTemplatesResponse:
                                              type: object
                                              required:
                                                - has_more
                                                - templates
                                                - next_cursor
                                              properties:
                                                templates:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/GlobalAllocationTemplateListItem'
                                                has_more:
                                                  type: boolean
                                                  description: If there are further results to be shown using the returned next cursor or previous cursor, this will be true, otherwise false.
                                                next_cursor:
                                                  type: string
                                                  description: Provides the string to use as the "start_after" value of the next request. Empty value if no further results.
                                            GetGlobalAllocationTemplateByTemplateIdResponse:
                                              type: object
                                              required:
                                                - template_id
                                                - name
                                                - supply_allocations
                                                - last_modified_at
                                                - last_modified_by
                                              properties:
                                                template_id:
                                                  $ref: '#/components/schemas/TemplateID'
                                                name:
                                                  type: string
                                                  description: The name of the global allocation template.
                                                supply_allocations:
                                                  type: array
                                                  items:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateExchangeSupplier'
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateGroupSupplier'
                                                      - $ref: '#/components/schemas/responses-AllocationTemplateBlockedSupplier'
                                                last_modified_at:
                                                  $ref: '#/components/schemas/LastModifiedAt'
                                                last_modified_by:
                                                  $ref: '#/components/schemas/UserID'
                                            SuggestDaysRequest:
                                              type: object
                                              required:
                                                - locale
                                                - price
                                                - length_of_interview
                                                - incidence_rate
                                                - completes
                                              properties:
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                collects_pii:
                                                  type: boolean
                                                  description: Indicates whether or not the target group collects Personally Identifiable Information (PII).
                                                  example: true
                                                price:
                                                  description: The desired Cost Per Interview for the filling goal suggestion.
                                                  allOf:
                                                    - $ref: '#/components/schemas/Currency'
                                                length_of_interview:
                                                  type: integer
                                                  description: Expected time to finish the target group in minutes.
                                                  minimum: 1
                                                  maximum: 45
                                                  example: 5
                                                incidence_rate:
                                                  type: number
                                                  description: Percentage of respondents that will qualify for the study after targeting using standard qualifications.
                                                  minimum: 0
                                                  maximum: 1
                                                  example: 0.5
                                                completes:
                                                  type: integer
                                                  description: the completes value for the condition
                                                  minimum: 1
                                                  example: 1000
                                            SuggestDaysResponse:
                                              type: object
                                              properties:
                                                days:
                                                  type: integer
                                                  description: the suggested number of days
                                                  example: 10
                                            SuggestedTimeRangeResponse:
                                              type: object
                                              properties:
                                                start:
                                                  type: string
                                                  description: Starting timestamp of the suggested time range.
                                                  format: date-time
                                                  example: '2024-12-31T23:59:59.99+01:00'
                                                end:
                                                  type: string
                                                  description: Ending timestamp of the suggested time range.
                                                  format: date-time
                                                  example: '2025-12-31T23:59:59.99+01:00'
                                                holidays:
                                                  type: array
                                                  description: List of holidays in the suggested time range.
                                                  items:
                                                    type: object
                                                    properties:
                                                      date:
                                                        type: string
                                                        example: '2023-01-01'
                                                      name:
                                                        type: string
                                                        example: New Year's Day
                                                      respondent_rate:
                                                        type: number
                                                        format: double
                                                        example: 0.65
                                                      completes_rate:
                                                        type: number
                                                        format: double
                                                        example: 0.54
                                                timezone:
                                                  type: string
                                                  description: IANA code for timezones across the world.
                                                  example: Europe/London
                                            PanelDistributionRequest:
                                              type: object
                                              description: Panel distribution prediction request.
                                              properties:
                                                locale:
                                                  $ref: '#/components/schemas/LocaleCode'
                                                start_at:
                                                  title: The Target Group start date
                                                  type: string
                                                  format: date-time
                                                  example: '2023-10-09T12:00:00Z'
                                                end_at:
                                                  title: The Target Group end date
                                                  type: string
                                                  format: date-time
                                                  example: '2023-10-09T12:00:00Z'
                                                profile:
                                                  type: object
                                                  description: The profile details contain a question ID and conditions for which the panel distribution is to be obtained.
                                                  properties:
                                                    question_id:
                                                      $ref: '#/components/schemas/QuestionID'
                                                    conditions:
                                                      oneOf:
                                                        - type: object
                                                          properties:
                                                            object:
                                                              type: string
                                                              description: Differentiates between various condition types. In the case of Range Conditions, it is always  `range_conditions`.
                                                              enum:
                                                                - range_conditions
                                                              example: range_conditions
                                                            data:
                                                              type: array
                                                              items:
                                                                type: object
                                                                properties:
                                                                  min:
                                                                    type: integer
                                                                    description: The minimum numeric value (inclusive).
                                                                    example: 18
                                                                  max:
                                                                    type: integer
                                                                    description: The maximum numeric value (inclusive).
                                                                    example: 24
                                                        - type: object
                                                          properties:
                                                            object:
                                                              type: string
                                                              description: Differentiates between various condition types. In the case of Selection Conditions, it is always `selection_conditions`.
                                                              enum:
                                                                - selection_conditions
                                                              example: selection_conditions
                                                            data:
                                                              type: array
                                                              items:
                                                                type: string
                                                                description: ID of the selections
                                                          example:
                                                            object: selection_conditions
                                                            data:
                                                              - '1'
                                                              - '2'
                                                              - '3'
                                                  required:
                                                    - conditions
                                              required:
                                                - locale
                                                - start_at
                                                - end_at
                                            PanelDistributionResponse:
                                              type: object
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                conditions:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      option:
                                                        type: string
                                                        description: Specifies a condition.
                                                      quota:
                                                        type: string
                                                        description: The condition quota prediction.
                                                    example:
                                                      option: '18_24'
                                                      quota: 40
                                            QuestionCategoryID:
                                              type: integer
                                              description: Question Category identifier.
                                              example: 43
                                            QuestionScope:
                                              description: Uniquely identifies the question scope.
                                              type: string
                                              enum:
                                                - standard
                                                - custom
                                                - demographic_only
                                              example: standard
                                            Question:
                                              description: A question that can be used to construct profiles.
                                              type: object
                                              required:
                                                - name
                                              properties:
                                                response_type:
                                                  type: string
                                                  description: Response type.
                                                  enum:
                                                    - single_punch
                                                    - multi_punch
                                                    - range
                                                  example: single_punch
                                                id:
                                                  type: integer
                                                  description: Question ID.
                                                  example: 2
                                                scope:
                                                  $ref: '#/components/schemas/QuestionScope'
                                                name:
                                                  type: string
                                                  description: The name of the question.
                                                  example: GENDER
                                                text:
                                                  type: string
                                                  description: The text of the question.
                                                  example: What is your gender?
                                                category_id:
                                                  $ref: '#/components/schemas/QuestionCategoryID'
                                            ListQuestions:
                                              type: object
                                              description: Lists questions for profiling library.
                                              properties:
                                                questions:
                                                  type: array
                                                  description: List of questions.
                                                  items:
                                                    $ref: '#/components/schemas/Question'
                                                pages:
                                                  type: integer
                                                  description: Number of pages available to iterate over.
                                                  example: 1
                                            QuestionsTranslationResponse:
                                              type: object
                                              description: Overall structure of Reach API V2 questions endpoint response
                                              properties:
                                                total:
                                                  type: integer
                                                  description: Total questions available in search results (not neccessarily count of records in immediate response)
                                                  example: 29
                                                result:
                                                  description: Array of questions for ID list requested.
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: integer
                                                        description: The question identifier.
                                                      question_type:
                                                        type: string
                                                        description: The type of question. Note, this should be an enum type ideally but sustaining facaded typing as-is initially.
                                                        example: Single Punch
                                                      question_options:
                                                        type: array
                                                        items:
                                                          type: object
                                                          description: An object containing a question selection options with locale and translated text.
                                                          properties:
                                                            text:
                                                              type: string
                                                              description: The locale question option.
                                                              example: Yes, I own a/some car(s)
                                                            text_translated:
                                                              type: string
                                                              description: The translated question option.
                                                              example: Si, dueño un/unos coche(s)
                                                            precode:
                                                              type: string
                                                              description: The precode of the question option.
                                                              example: '1'
                                                      option_mask:
                                                        type: string
                                                        description: The question option mask.
                                                        example: XX
                                                      question_text:
                                                        type: string
                                                        description: The locale question text.
                                                        example: Do you own any cars and how many?
                                                      question_text_translated:
                                                        type: string
                                                        description: The translated question text.
                                                        example: ¿Tienes algún coche y cuántos?
                                                      name:
                                                        type: string
                                                        description: The question name.
                                                        example: CAR
                                                      standard:
                                                        type: boolean
                                                        description: A flag indicating whether a standard question or not.
                                                        example: true
                                                      account_id:
                                                        type: integer
                                                        description: The account ID.
                                                        example: 1
                                                      classification_id:
                                                        type: integer
                                                        description: The classification ID.
                                                        example: 8
                                                      classification_code:
                                                        type: string
                                                        description: The classification Code.
                                                        example: AUT
                                            RegionMapQuestionOptions:
                                              type: object
                                              description: Region map question answer.
                                              required:
                                                - object
                                                - options
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of options. always is `region_options`.
                                                  enum:
                                                    - region_options
                                                  example: region_options
                                                options:
                                                  type: array
                                                  description: List of all possible answer options for the question. Properties and Geometry are based on  the GeoJSON Specification (RFC 7946).
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: integer
                                                        description: Question answer ID.
                                                      type:
                                                        type: string
                                                        description: GeoJSON indication that the type is "Feature" which means it contains geometry object  and additional properties.
                                                        enum:
                                                          - Feature
                                                      properties:
                                                        type: object
                                                        properties:
                                                          name:
                                                            type: string
                                                            description: Question answer name.
                                                      geometry:
                                                        type: object
                                                        description: Contains geometry data for the question answer option.
                                                        properties:
                                                          type:
                                                            type: string
                                                            description: Specifies the shape format.
                                                            enum:
                                                              - Polygon
                                                              - MultiPolygon
                                                          coordinates:
                                                            type: array
                                                            description: Used to project spherical objects onto a 2D plane.
                                                            items:
                                                              type: array
                                                              items:
                                                                type: array
                                                                items:
                                                                  type: number
                                                        example:
                                                          - type: Polygon
                                                            coordinates: null
                                                    example:
                                                      - id: 5
                                                        type: Feature
                                                        properties:
                                                          name: Mediterranean (Méditerranée)
                                                        geometry:
                                                          type: MultiPolygon
                                                          coordinates:
                                                            - - - - 7.007760500000018
                                                                  - 44.23670049899999
                                                                - - 7.714236500000027
                                                                  - 44.061513499
                                                                - - 7.529827
                                                                  - 43.784007997
                                                                - - 7.43605928
                                                                  - 43.76976996899998
                                                                - - 7.413667280000027
                                                                  - 43.744077703000016
                                                                - - 6.933721
                                                                  - 43.480064497
                                                                - - 6.621062
                                                                  - 43.15778350099998
                                                                - - 5.671879
                                                                  - 43.17926799899999
                                                                - - 4.230281
                                                                  - 43.460186
                                                                - - 4.101040500000011
                                                                  - 43.554370999000014
                                                                - - 3.24056250000001
                                                                  - 43.21280299900002
                                                                - - 2.9889005
                                                                  - 42.864599999
                                                                - - 3.035430500000018
                                                                  - 42.8420695
                                                                - - 3.050192
                                                                  - 42.870636
                                                                - - 3.043504499999983
                                                                  - 42.83815
                                                                - - 3.174803999
                                                                  - 42.435375
                                                                - - 1.964552
                                                                  - 42.38215699900002
                                                                - - 1.731011
                                                                  - 42.49240099899998
                                                                - - 1.725801
                                                                  - 42.50440199899998
                                                                - - 1.7860985
                                                                  - 42.573658
                                                                - - 2.166049
                                                                  - 42.66391749899998
                                                                - - 1.949341
                                                                  - 43.120973
                                                                - - 1.6884235
                                                                  - 43.27355449700002
                                                                - - 2.029134
                                                                  - 43.43689549700002
                                                                - - 2.265415
                                                                  - 43.452913498999976
                                                                - - 2.565782500000012
                                                                  - 43.422958
                                                                - - 2.935457
                                                                  - 43.694664999
                                                                - - 3.358362
                                                                  - 43.913829498999974
                                                                - - 3.448355
                                                                  - 44.01910349899998
                                                                - - 3.263114
                                                                  - 44.092425499
                                                                - - 3.120173500000021
                                                                  - 44.261838496999985
                                                                - - 2.9816755
                                                                  - 44.64467299900002
                                                                - - 3.103125
                                                                  - 44.884632497999974
                                                                - - 3.361347500000022
                                                                  - 44.971408
                                                                - - 3.862531
                                                                  - 44.743865997
                                                                - - 3.998161499999981
                                                                  - 44.459798498
                                                                - - 4.258899499999984
                                                                  - 44.264422998999976
                                                                - - 4.6492275
                                                                  - 44.27036
                                                                - - 4.650611
                                                                  - 44.329802997
                                                                - - 4.804566
                                                                  - 44.30389699800003
                                                                - - 5.4987865
                                                                  - 44.11571649799998
                                                                - - 5.676035999000021
                                                                  - 44.19142849899998
                                                                - - 5.418397500000026
                                                                  - 44.42476849899998
                                                                - - 5.80147
                                                                  - 44.706777500999976
                                                                - - 6.355365
                                                                  - 44.85482049900003
                                                                - - 6.203923499999974
                                                                  - 45.01247100099999
                                                                - - 6.26057
                                                                  - 45.12684399699998
                                                                - - 6.630051
                                                                  - 45.10985649999998
                                                                - - 7.065755
                                                                  - 44.71346449700002
                                                                - - 6.948443
                                                                  - 44.654741999
                                                                - - 6.887428
                                                                  - 44.361287
                                                                - - 7.007760500000018
                                                                  - 44.23670049899999
                                                              - - - 9.402272
                                                                  - 41.858703499
                                                                - - 9.219715
                                                                  - 41.36760399899998
                                                                - - 8.788534
                                                                  - 41.55707549700003
                                                                - - 8.591134
                                                                  - 41.96215449699997
                                                                - - 8.573006498999973
                                                                  - 42.238570998
                                                                - - 8.691523500000017
                                                                  - 42.266464000999974
                                                                - - 8.573408
                                                                  - 42.381405
                                                                - - 8.727043
                                                                  - 42.561603499
                                                                - - 9.301698499999986
                                                                  - 42.67863850100002
                                                                - - 9.343248500000016
                                                                  - 42.99974049999997
                                                                - - 9.4632805
                                                                  - 42.98673649900002
                                                                - - 9.559117500000013
                                                                  - 42.196696997
                                                                - - 9.402272
                                                                  - 41.858703499
                                                      - id: 10
                                                        type: Feature
                                                        properties:
                                                          name: South West (Sud-Ouest)
                                                        geometry:
                                                          type: Polygon
                                                          coordinates:
                                                            - - - - 2.28104350000001
                                                                  - 46.420403497
                                                                - - 2.565372500000024
                                                                  - 46.143036
                                                                - - 2.60902149899999
                                                                  - 45.966643998999984
                                                                - - 2.388014
                                                                  - 45.827372997
                                                                - - 2.492129499999976
                                                                  - 45.73766999700001
                                                                - - 2.50841250000002
                                                                  - 45.478501499
                                                                - - 2.062908
                                                                  - 44.97650449899999
                                                                - - 2.207473
                                                                  - 44.61552899899999
                                                                - - 2.4789475
                                                                  - 44.64800999900001
                                                                - - 2.7167695
                                                                  - 44.928827996999985
                                                                - - 3.120173500000021
                                                                  - 44.261838496999985
                                                                - - 2.9816755
                                                                  - 44.64467299900002
                                                                - - 3.373648
                                                                  - 44.170759498999985
                                                                - - 3.263114
                                                                  - 44.092425499
                                                                - - 3.448355
                                                                  - 44.01910349899998
                                                                - - 3.358362
                                                                  - 43.913829498999974
                                                                - - 2.935457
                                                                  - 43.694664999
                                                                - - 2.565782500000012
                                                                  - 43.422958
                                                                - - 2.265415
                                                                  - 43.452913498999976
                                                                - - 2.029134
                                                                  - 43.43689549700002
                                                                - - 1.6884235
                                                                  - 43.27355449700002
                                                                - - 1.949341
                                                                  - 43.120973
                                                                - - 2.166049
                                                                  - 42.66391749899998
                                                                - - 1.7860985
                                                                  - 42.573658
                                                                - - 1.442566
                                                                  - 42.60366800100002
                                                                - - 0.858215
                                                                  - 42.825740999
                                                                - - 0.660127
                                                                  - 42.69095249899999
                                                                - - 0.4777555
                                                                  - 42.70001999700003
                                                                - - -0.313342
                                                                  - 42.849364997
                                                                - - -0.724501
                                                                  - 42.920158500000014
                                                                - - -0.551047
                                                                  - 42.777637500000026
                                                                - - -1.6087885
                                                                  - 43.251976001
                                                                - - -1.728903
                                                                  - 43.29608899700003
                                                                - - -1.785978
                                                                  - 43.35047899699998
                                                                - - -1.52487050000002
                                                                  - 43.529700999
                                                                - - -1.253891
                                                                  - 44.467605499
                                                                - - -1.156919
                                                                  - 45.472530499000015
                                                                - - -0.708231
                                                                  - 45.32748049899999
                                                                - - -0.040197499999977
                                                                  - 45.10237999899999
                                                                - - 0.004336
                                                                  - 45.191628
                                                                - - 0.629741
                                                                  - 45.71456999700001
                                                                - - 0.823432500000024
                                                                  - 46.128584499
                                                                - - 1.177279
                                                                  - 46.383947998
                                                                - - 1.4151855
                                                                  - 46.347215001
                                                                - - 2.167784499999982
                                                                  - 46.424068998999985
                                                                - - 2.28104350000001
                                                                  - 46.420403497
                                            RangeQuestionOptions:
                                              type: object
                                              description: Range question answer.
                                              required:
                                                - object
                                                - name
                                                - min
                                                - max
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of options. always is `range_options`.
                                                  enum:
                                                    - range_options
                                                  example: range_options
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive).
                                                  example: 18
                                                max:
                                                  type: integer
                                                  description: The maximum numeric value (inclusive).
                                                  example: 24
                                                name:
                                                  type: string
                                                  description: The name of the range.
                                                  example: 18-24 years old
                                            SelectionQuestionOptions:
                                              type: object
                                              description: Available single or multi punch question selection options.
                                              required:
                                                - object
                                                - options
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of options. always is `selection_options`.
                                                  enum:
                                                    - selection_options
                                                  example: selection_options
                                                options:
                                                  type: array
                                                  description: List of all possible answer options for the question.
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: integer
                                                        description: Question answer ID.
                                                      name:
                                                        type: string
                                                        description: Question answer name.
                                                  example:
                                                    - id: 1
                                                      text: Cat
                                                    - id: 2
                                                      text: Dog
                                                    - id: 3
                                                      text: Fish
                                                    - id: 4
                                                      text: Bird
                                                    - id: 5
                                                      text: Horse
                                                    - id: 6
                                                      text: Amphibians (frogs, toads, etc.)
                                                    - id: 7
                                                      text: Small animals or rodents (hamsters, mice, rabbits, ferrets, etc.)
                                                    - id: 8
                                                      text: Reptiles (turtles, snakes, lizards, etc.)
                                                    - id: 9
                                                      text: I do not have any pets
                                                    - id: 10
                                                      text: Other
                                            QuestionByID:
                                              type: object
                                              description: Response for question by ID with all question options.
                                              allOf:
                                                - $ref: '#/components/schemas/Question'
                                                - oneOf:
                                                    - $ref: '#/components/schemas/RegionMapQuestionOptions'
                                                    - $ref: '#/components/schemas/RangeQuestionOptions'
                                                    - $ref: '#/components/schemas/SelectionQuestionOptions'
                                            QuestionCategoryCode:
                                              description: Code that uniquely identifies the question category.
                                              type: string
                                              enum:
                                                - AIR
                                                - ART
                                                - AUT
                                                - B2B
                                                - BAN
                                                - BEA
                                                - BEV
                                                - DEM
                                                - DEV
                                                - EDU
                                                - ELE
                                                - FAS
                                                - FOO
                                                - HOB
                                                - HOM
                                                - IT
                                                - MED
                                                - PER
                                                - POL
                                                - REC
                                                - SUP
                                                - TOB
                                                - OTH
                                            QuestionCategory:
                                              type: object
                                              description: Indicates the question's category.
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/QuestionCategoryID'
                                                code:
                                                  $ref: '#/components/schemas/QuestionCategoryCode'
                                                name:
                                                  type: string
                                                  description: The name of the question category.
                                              example:
                                                id: 23
                                                code: AIR
                                                name: Airlines/Travel
                                            ListQuestionCategories:
                                              type: object
                                              description: Lists all available question categories.
                                              properties:
                                                categories:
                                                  type: array
                                                  description: List of question categories.
                                                  items:
                                                    $ref: '#/components/schemas/QuestionCategory'
                                              example:
                                                categories:
                                                  - id: 23
                                                    code: AIR
                                                    name: Airlines/Travel
                                            GetSystemAllocationTemplateResponse:
                                              type: object
                                              required:
                                                - name
                                                - supply_allocations
                                              properties:
                                                name:
                                                  type: string
                                                  example: My happy system template
                                                supply_allocations:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/responses-AllocationTemplateExchangeSupplier'
                                            ConditionV2:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  description: the identifier for the condition
                                                option:
                                                  type: string
                                                  description: question option
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive).
                                                max:
                                                  type: integer
                                                zip_codes:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: List of applicable zip codes.
                                                allow_all_zip:
                                                  type: boolean
                                                  description: Flag to allow all zip codes.
                                                text:
                                                  type: string
                                                  description: text description for the condition.
                                                text_translated:
                                                  type: string
                                                  description: translated text description for the condition.
                                            RelatedConditionV2:
                                              type: object
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                conditions:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ConditionV2'
                                            RelatedConditionsV2:
                                              type: array
                                              items:
                                                $ref: '#/components/schemas/RelatedConditionV2'
                                              minItems: 1
                                              example:
                                                - question_id: 42
                                                  conditions:
                                                    - option: '1'
                                                      text: Male
                                                      text_translated: Male
                                                - question_id: 43
                                                  conditions:
                                                    - min: 30
                                                      max: 50
                                                      text: 30-50
                                                      text_translated: 30-50
                                            DraftInterlockProfilesResponseV2:
                                              type: array
                                              description: Array of interlocked profiles.
                                              items:
                                                type: object
                                                properties:
                                                  id:
                                                    type: string
                                                    description: Unique identifier of interlocked profile
                                                    example: 01J82QX46HS1QBAG8D14KBQP26
                                                  name:
                                                    type: string
                                                    description: Name of the interlocked Profile
                                                    example: GENDER, AGE
                                                  quotas_enabled:
                                                    type: boolean
                                                    description: Denotes whether quotas are enabled. For generate draft interlock, this will be defaulted to true.
                                                    example: true
                                                  depends_on_questions:
                                                    type: array
                                                    description: Array of question id's used to create interlocked profile. First element is considered as parent profile.
                                                    items:
                                                      type: integer
                                                  quotas:
                                                    type: object
                                                    description: Quotas for interlocked profile.
                                                    properties:
                                                      ungrouped:
                                                        type: array
                                                        description: Array of ungrouped quotas which relate to interlock condition
                                                        items:
                                                          type: object
                                                          properties:
                                                            id:
                                                              type: string
                                                              format: ulid
                                                              description: Unique identifier to represent quota
                                                              example: 01J82QX46HS1QBAG8D14KBQP2D
                                                            quota_percentage:
                                                              type: integer
                                                              description: Percentage of total quota applied to this condition(s).
                                                              minimum: 0
                                                              maximum: 100
                                                              example: 9
                                                            quota_nominal:
                                                              type: integer
                                                              description: Nominal quota value.
                                                              minimum: 0
                                                              example: 906
                                                            filling_goal:
                                                              type: integer
                                                              description: The target group's desired value of completes/prescreens
                                                              example: 906
                                                            condition:
                                                              type: object
                                                              required:
                                                                - related_condition
                                                              properties:
                                                                id:
                                                                  type: string
                                                                  format: ulid
                                                                  description: Unique identifier to represent condition
                                                                  example: 01J82QX46HS1QBAG8D14KBQP2D
                                                                text:
                                                                  type: string
                                                                  example: 15-19, Male
                                                                translated_text:
                                                                  type: string
                                                                  example: 15-19, Male
                                                                option:
                                                                  type: string
                                                                  example: '1'
                                                                related_condition:
                                                                  $ref: '#/components/schemas/RelatedConditionsV2'
                                                  profiles:
                                                    type: array
                                                    items:
                                                      type: object
                                                      properties:
                                                        id:
                                                          type: string
                                                          description: Profile identifier
                                                          example: '1000'
                                                        question_id:
                                                          type: integer
                                                          description: the identifier for the underlying question from the profiling library
                                                          example: 42
                                                        name:
                                                          type: string
                                                          description: the name of the profile
                                                          example: AGE
                                                        description:
                                                          type: string
                                                          description: a short summary of the profile
                                                          example: What is your age?
                                                        translated_description:
                                                          type: string
                                                          description: translated description of question
                                                          example: string
                                                        conditions:
                                                          $ref: '#/components/schemas/ApplyProfileResponseConditions'
                                                        quotas:
                                                          $ref: '#/components/schemas/DraftProfileResponseQuotas'
                                            SelectionConditionDetails:
                                              type: object
                                              required:
                                                - option
                                              properties:
                                                option:
                                                  type: string
                                                  description: Question option
                                            RangeConditionDetails:
                                              type: object
                                              required:
                                                - min
                                                - max
                                              properties:
                                                min:
                                                  type: number
                                                  description: Minimum value(inclusive)
                                                max:
                                                  type: number
                                                  description: Maximum value(inclusive)
                                            ZipConditionDetails:
                                              type: object
                                              required:
                                                - zip_codes
                                                - allow_all_zip
                                              properties:
                                                zip_codes:
                                                  type: array
                                                  description: List of applicable zip codes
                                                  items:
                                                    type: string
                                                    example: '90210'
                                                allow_all_zip:
                                                  type: boolean
                                                  description: Flag to allow all zip codes
                                                  example: true
                                            OutputRegularProfileCondition:
                                              type: object
                                              required:
                                                - id
                                                - text
                                                - text_translated
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile condition identifier.
                                                text:
                                                  type: string
                                                  description: Condition text
                                                text_translated:
                                                  type: string
                                                  description: Condition text in target language
                                              anyOf:
                                                - $ref: '#/components/schemas/SelectionConditionDetails'
                                                - $ref: '#/components/schemas/RangeConditionDetails'
                                                - $ref: '#/components/schemas/ZipConditionDetails'
                                            OutputRegularProfileUngroupedQuota:
                                              type: object
                                              required:
                                                - id
                                                - condition
                                                - quota
                                                - completes
                                                - prescreens
                                                - completes_goal
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile quota identifier.
                                                condition:
                                                  type: string
                                                  description: Quota condition identifier
                                                quota:
                                                  type: integer
                                                  description: Quota value
                                                completes:
                                                  type: integer
                                                  description: Completes value
                                                prescreens:
                                                  type: integer
                                                  description: Prescreen value
                                                completes_goal:
                                                  type: integer
                                                  description: Completes goal value
                                            OutputRegularProfileGroupedQuota:
                                              type: object
                                              required:
                                                - id
                                                - conditions
                                                - name
                                                - quota
                                                - completes
                                                - prescreens
                                                - completes_goal
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile quota identifier.
                                                conditions:
                                                  type: array
                                                  items:
                                                    type: string
                                                    description: Quota condition identifier
                                                name:
                                                  type: string
                                                  description: Group name
                                                quota:
                                                  type: integer
                                                  description: Quota value
                                                completes:
                                                  type: integer
                                                  description: Completes value
                                                prescreens:
                                                  type: integer
                                                  description: Prescreen value
                                                completes_goal:
                                                  type: integer
                                                  description: Completes goal value
                                            OutputRegularProfile:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile identifier.
                                                question_id:
                                                  type: integer
                                                  description: Question ID
                                                name:
                                                  type: string
                                                  description: Profile name
                                                description:
                                                  type: string
                                                  description: Profile description
                                                description_translated:
                                                  type: string
                                                  description: Profile description in target language
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                conditions:
                                                  type: object
                                                  required:
                                                    - object
                                                    - data
                                                  properties:
                                                    object:
                                                      type: string
                                                      enum:
                                                        - zip_conditions_details_template
                                                        - range_conditions_details_template
                                                        - selection_conditions_details_template
                                                    data:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/OutputRegularProfileCondition'
                                                quotas:
                                                  type: object
                                                  required:
                                                    - ungrouped
                                                    - grouped
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/OutputRegularProfileUngroupedQuota'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/OutputRegularProfileGroupedQuota'
                                            OutputInterlockedProfileQuotaConditionDetails:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile condition identifier.
                                                text:
                                                  type: string
                                                  description: Condition text
                                                text_translated:
                                                  type: string
                                                  description: Condition text in target language
                                            OutputInterlockedProfileUngroupedQuota:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile quota identifier.
                                                condition:
                                                  $ref: '#/components/schemas/OutputInterlockedProfileQuotaConditionDetails'
                                                quota:
                                                  type: integer
                                                  description: Quota value
                                                completes:
                                                  type: integer
                                                  description: Completes value
                                                prescreens:
                                                  type: integer
                                                  description: Prescreen value
                                                completes_goal:
                                                  type: integer
                                                  description: Completes goal value
                                            OutputInterlockedProfile:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  format: ULID
                                                  description: Profile identifier.
                                                name:
                                                  type: string
                                                  description: Profile name
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                depends_on_questions:
                                                  type: array
                                                  items:
                                                    type: integer
                                                  description: List of questions that this profile depends on.
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/OutputInterlockedProfileUngroupedQuota'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        type: string
                                                      maxItems: 0
                                                      example: []
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/OutputRegularProfile'
                                            GetAllProfilesResponse:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/OutputRegularProfile'
                                                interlocked_profile:
                                                  $ref: '#/components/schemas/OutputInterlockedProfile'
                                            GetPanelDistributionResponse:
                                              type: object
                                              properties:
                                                object:
                                                  type: string
                                                  enum:
                                                    - profile
                                                    - interlocked_profile
                                              oneOf:
                                                - properties:
                                                    profile:
                                                      $ref: '#/components/schemas/OutputRegularProfile'
                                                - properties:
                                                    interlocked_profile:
                                                      $ref: '#/components/schemas/OutputInterlockedProfile'
                                            ProfileCreationRangeConditions:
                                              type: object
                                              required:
                                                - min
                                                - max
                                              properties:
                                                min:
                                                  type: integer
                                                  description: The minimum numeric value (inclusive).
                                                  example: 18
                                                max:
                                                  type: integer
                                                  description: The maximum numeric value (inclusive).
                                                  example: 24
                                            ProfileCreationZipConditions:
                                              type: object
                                              required:
                                                - zip_codes
                                                - allow_all_zip
                                              properties:
                                                zip_codes:
                                                  type: array
                                                  items:
                                                    type: string
                                                  description: List of applicable zip codes.
                                                allow_all_zip:
                                                  type: boolean
                                                  description: Flag to allow all zip codes.
                                            ProfileCreationConditions:
                                              type: object
                                              required:
                                                - object
                                                - data
                                              properties:
                                                object:
                                                  type: string
                                                  description: object field to distinguish between different types of control selections.
                                                  enum:
                                                    - zip_conditions
                                                    - range_conditions
                                                    - selection_conditions
                                                  example: selection_conditions
                                                data:
                                                  type: array
                                                  items:
                                                    oneOf:
                                                      - $ref: '#/components/schemas/ProfileCreationRangeConditions'
                                                      - $ref: '#/components/schemas/ProfileCreationZipConditions'
                                                      - type: string
                                            CreateProfileRequestBody:
                                              type: object
                                              required:
                                                - conditions
                                                - question_id
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                conditions:
                                                  $ref: '#/components/schemas/ProfileCreationConditions'
                                            ProfileIDV2:
                                              type: string
                                              format: ULID
                                              description: Profile identifier
                                              example: 01HY0PYB3TW23RQRVNFYRC2PP6
                                            GetProfileResponse:
                                              oneOf:
                                                - $ref: '#/components/schemas/OutputRegularProfile'
                                                - $ref: '#/components/schemas/OutputInterlockedProfile'
                                            GroupQuotasRequestBody:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  description: The grouping state you want to have on the conditions
                                                  items:
                                                    type: object
                                                    properties:
                                                      name:
                                                        type: string
                                                        description: The name of the group
                                                      conditions:
                                                        type: array
                                                        description: List of condition options you want to be a member of the group
                                                        items:
                                                          type: string
                                                          example: '1'
                                              example:
                                                data:
                                                  - name: Group 1
                                                    conditions:
                                                      - 01JBG14JYJPYWGSA0FDS0QXCVT
                                                      - 01JBG14JYKD43A6SMJ77QN7RN5
                                                      - 01JBG14XFNZDHBM06RZWAEE63Z
                                            RemoveInterlocksResponse:
                                              type: object
                                              properties:
                                                data:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/OutputRegularProfile'
                                            InputDraftSingularRegularQuota:
                                              type: object
                                              properties:
                                                index:
                                                  type: integer
                                                  description: The index of the condition as reference to the item from the list of conditions.
                                                  example: 0
                                                quota_percentage:
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Percentage of total quota applied to this condition(s).
                                                  example: 40
                                                quota_nominal:
                                                  type: integer
                                                  minimum: 0
                                                  description: The quota value expressed as a nominal value.
                                                  example: 550
                                            InputDraftGroupedRegularQuota:
                                              type: object
                                              properties:
                                                name:
                                                  type: string
                                                  description: the name of the group of conditions
                                                  maxLength: 64
                                                  example: Group 1
                                                indexes:
                                                  type: array
                                                  description: The indexes of the conditions as reference to the items from the list of conditions.
                                                  items:
                                                    type: integer
                                                quota_percentage:
                                                  type: integer
                                                  minimum: 0
                                                  maximum: 100
                                                  description: Percentage of total quota applied to this condition(s).
                                                  example: 40
                                                quota_nominal:
                                                  type: integer
                                                  minimum: 0
                                                  description: The quota value expressed as a nominal value.
                                                  example: 550
                                            InputDraftRegularProfile:
                                              type: object
                                              properties:
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                  example: true
                                                conditions:
                                                  type: object
                                                  required:
                                                    - object
                                                    - data
                                                  properties:
                                                    object:
                                                      type: string
                                                      enum:
                                                        - zip_conditions_details_template
                                                        - range_conditions_details_template
                                                        - selection_conditions_details_template
                                                    data:
                                                      type: array
                                                      items:
                                                        oneOf:
                                                          - $ref: '#/components/schemas/SelectionConditionDetails'
                                                          - $ref: '#/components/schemas/RangeConditionDetails'
                                                          - $ref: '#/components/schemas/ZipConditionDetails'
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/InputDraftSingularRegularQuota'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/InputDraftGroupedRegularQuota'
                                            ConditionID:
                                              type: string
                                              description: Condition identifier
                                              format: ULID
                                            InputDraftParticipantProfile:
                                              type: object
                                              properties:
                                                id:
                                                  type: string
                                                  example: 01JAC2AQM5NAZVE08KMPEB2PVP
                                                question_id:
                                                  $ref: '#/components/schemas/QuestionID'
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                  example: true
                                                interlock_id:
                                                  type: string
                                                  description: The identifier for the interlock that this profile composes.
                                                  format: ULID
                                                conditions:
                                                  type: object
                                                  properties:
                                                    object:
                                                      type: string
                                                      description: |
                                                        Object field to distinguish between different types of control selections.
                                                    data:
                                                      type: array
                                                      items:
                                                        oneOf:
                                                          - $ref: '#/components/schemas/InputDraftInterlockedParticipantSelectionProfileCondition'
                                                          - $ref: '#/components/schemas/InputDraftInterlockedParticipantRangeProfileCondition'
                                                          - $ref: '#/components/schemas/InputDraftInterlockedParticipantZipProfileCondition'
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/InputDraftSingularRegularQuota'
                                                    grouped:
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/InputDraftGroupedRegularQuota'
                                            InputInterlockedDraftProfile:
                                              type: object
                                              required:
                                                - id
                                              properties:
                                                id:
                                                  $ref: '#/components/schemas/ProfileIDV2'
                                                name:
                                                  type: string
                                                  example: Age, Gender
                                                quotas_enabled:
                                                  type: boolean
                                                  description: Flag indicating if quotas are enabled.
                                                depends_on_questions:
                                                  type: array
                                                  description: Array of questionIDs that this profile depends on.
                                                  items:
                                                    type: integer
                                                quotas:
                                                  type: object
                                                  properties:
                                                    ungrouped:
                                                      type: array
                                                      items:
                                                        type: object
                                                        properties:
                                                          id:
                                                            type: string
                                                            format: ULID
                                                            example: 01HW8NWD653V44M5FXWD5FJD9Q
                                                          condition:
                                                            type: object
                                                            properties:
                                                              id:
                                                                $ref: '#/components/schemas/ConditionID'
                                                              option:
                                                                type: string
                                                                example: '1'
                                                          quota_percentage:
                                                            type: integer
                                                            description: The quota percentage for the template.
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 40
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/InputDraftParticipantProfile'
                                            ApplyProfilesRequestBody:
                                              type: object
                                              required:
                                                - locale
                                                - filling_goal
                                                - profile_adjustment_type
                                              properties:
                                                locale:
                                                  type: string
                                                  description: Locale of the target group.
                                                  example: eng_us
                                                start_at:
                                                  type: string
                                                  example: '2023-10-09T12:00:00.000Z'
                                                end_at:
                                                  type: string
                                                collects_pii:
                                                  type: boolean
                                                  example: false
                                                filling_goal:
                                                  type: integer
                                                  format: int64
                                                  example: 100
                                                  minimum: 1
                                                  maximum: 10000
                                                  description: Target group filling goal.
                                                profile_adjustment_type:
                                                  type: string
                                                  enum:
                                                    - percentage
                                                  example: percentage
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/InputDraftRegularProfile'
                                                interlocked_profile:
                                                  $ref: '#/components/schemas/InputInterlockedDraftProfile'
                                            schemas-ApplyProfilesResponse:
                                              type: object
                                              properties:
                                                locale:
                                                  type: string
                                                  description: Locale of the target group.
                                                  example: eng_us
                                                filling_goal:
                                                  type: integer
                                                  format: int64
                                                  example: 100
                                                  minimum: 1
                                                  maximum: 10000
                                                  description: Target group filling goal.
                                                profile_adjustment_type:
                                                  type: string
                                                  enum:
                                                    - percentage
                                                  example: percentage
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/OutputRegularProfile'
                                                interlocked_profile:
                                                  $ref: '#/components/schemas/OutputInterlockedProfile'
                                            BatchDeleteProfileQuotasRequestBody:
                                              type: object
                                              properties:
                                                profiles:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      profile_id:
                                                        $ref: '#/components/schemas/ProfileIDV2'
                                                      quotas:
                                                        type: array
                                                        description: IDs of the quotas you want to delete.
                                                        items:
                                                          type: string
                                                          format: ULID
                                            BatchDeleteProfileRequestBody:
                                              type: object
                                              properties:
                                                profiles:
                                                  type: array
                                                  description: IDs of the profiles you want to delete
                                                  items:
                                                    $ref: '#/components/schemas/ProfileIDV2'
                                              example:
                                                profiles:
                                                  - 01HW8NWD653V44M5FXWD5FJD9Q
                                                  - 01HW8CWD653M44M5FXWD5FJE9Q
                                            CreateInterlockedProfileRequestBody:
                                              type: object
                                              properties:
                                                target_group_filling_goal:
                                                  type: integer
                                                  format: int64
                                                  example: 100
                                                  minimum: 1
                                                  maximum: 10000
                                                  description: Target group filling goal.
                                                profiles:
                                                  type: array
                                                  items:
                                                    $ref: '#/components/schemas/ProfileIDV2'
                                            UpdateFillingGoalRequestBody:
                                              type: object
                                              description: Filling goal update request.
                                              properties:
                                                filling_goal:
                                                  type: integer
                                                  format: int64
                                                  example: 100
                                                  minimum: 1
                                                  maximum: 10000
                                                  description: Target group filling goal.
                                                profiles:
                                                  type: array
                                                  description: A list of profiles and filling goals with the associated profile IDs
                                                  items:
                                                    type: object
                                                    required:
                                                      - profile_id
                                                      - quotas
                                                    properties:
                                                      profile_id:
                                                        type: string
                                                        format: ULID
                                                        description: Profile identifier.
                                                        example: 01JBFEKDMTR4TVM6W05NN4JYR9
                                                      quotas:
                                                        type: array
                                                        description: A list of filling goals with the associated quota IDs
                                                        items:
                                                          type: object
                                                          required:
                                                            - quota_id
                                                            - filling_goal
                                                          properties:
                                                            quota_id:
                                                              type: string
                                                              description: The quota ID of the quota being updated
                                                              example: 01JBFEKDMTWHFA93BK0DSDGYWC
                                                            filling_goal:
                                                              $ref: '#/components/schemas/QuotaFillingGoal'
                                            GetTargetGroupQuotaDistributionResponse:
                                              type: object
                                              properties:
                                                quota_updates_allowed:
                                                  type: boolean
                                                  example: true
                                                quota_distribution:
                                                  type: array
                                                  items:
                                                    type: object
                                                    description: Container for the distributed value of a quota's filling goal
                                                    properties:
                                                      quota_id:
                                                        type: string
                                                        description: The quota ID of the quota being updated
                                                        example: 01JBFEKDMTWHFA93BK0DSDGYWC
                                                      filling_goal:
                                                        $ref: '#/components/schemas/QuotaFillingGoal'
                                            GetSupplyAllocationResponse:
                                              type: object
                                              properties:
                                                supply_allocations:
                                                  type: array
                                                  items:
                                                    type: object
                                                    properties:
                                                      id:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        example: 368100
                                                      completes:
                                                        type: integer
                                                        nullable: true
                                                        minimum: 0
                                                        example: 0
                                                      pre_screens:
                                                        nullable: true
                                                        type: integer
                                                        minimum: 0
                                                        example: 0
                                                    oneOf:
                                                      - type: object
                                                        title: SupplyAllocationGroupTypeRequest
                                                        properties:
                                                          name:
                                                            type: string
                                                            minLength: 1
                                                            example: Group A
                                                          percentage_max:
                                                            type: integer
                                                            nullable: false
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 44
                                                          percentage_min:
                                                            type: integer
                                                            nullable: true
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 78
                                                          total_remaining:
                                                            nullable: true
                                                            type: integer
                                                            example: 0
                                                          average_cpi:
                                                            allOf:
                                                              - $ref: '#/components/schemas/MonetaryAmount'
                                                          type:
                                                            type: string
                                                            enum:
                                                              - group
                                                            description: Descriptor of the Group Allocation type.
                                                          conversion_rate:
                                                            allOf:
                                                              - nullable: true
                                                              - $ref: '#/components/schemas/ConversionRate'
                                                          suppliers:
                                                            nullable: true
                                                            type: array
                                                            items:
                                                              allOf:
                                                                - $ref: '#/components/schemas/SupplierResponse'
                                                                - type: object
                                                                  properties:
                                                                    completes:
                                                                      type: integer
                                                                      nullable: true
                                                                      minimum: 0
                                                                      example: 0
                                                                    pre_screens:
                                                                      nullable: true
                                                                      type: integer
                                                                      minimum: 0
                                                                      example: 0
                                                      - type: object
                                                        title: SupplyAllocationExchangeType
                                                        properties:
                                                          percentage_max:
                                                            type: integer
                                                            nullable: false
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 44
                                                          percentage_min:
                                                            type: integer
                                                            nullable: true
                                                            minimum: 0
                                                            maximum: 100
                                                            example: 78
                                                          total_remaining:
                                                            nullable: true
                                                            type: integer
                                                            example: 0
                                                          average_cpi:
                                                            allOf:
                                                              - $ref: '#/components/schemas/MonetaryAmount'
                                                          conversion_rate:
                                                            allOf:
                                                              - nullable: true
                                                              - $ref: '#/components/schemas/ConversionRate'
                                                          type:
                                                            type: string
                                                            enum:
                                                              - exchange
                                                            description: Descriptor of the Exchange type.
                                                          suppliers:
                                                            nullable: true
                                                            type: array
                                                            items:
                                                              allOf:
                                                                - $ref: '#/components/schemas/SupplierResponse'
                                                                - type: object
                                                                  properties:
                                                                    completes:
                                                                      type: integer
                                                                      nullable: true
                                                                      minimum: 0
                                                                      example: 0
                                                                    pre_screens:
                                                                      nullable: true
                                                                      type: integer
                                                                      minimum: 0
                                                                      example: 0
                                                      - type: object
                                                        title: SupplyAllocationBlockedType
                                                        properties:
                                                          type:
                                                            type: string
                                                            enum:
                                                              - blocked
                                                            description: Descriptor of the Blocked type.
                                                          average_cpi:
                                                            allOf:
                                                              - $ref: '#/components/schemas/MonetaryAmount'
                                                          conversion_rate:
                                                            allOf:
                                                              - nullable: true
                                                              - $ref: '#/components/schemas/ConversionRate'
                                                          suppliers:
                                                            nullable: true
                                                            type: array
                                                            items:
                                                              allOf:
                                                                - $ref: '#/components/schemas/SupplierResponse'
                                                                - type: object
                                                                  properties:
                                                                    completes:
                                                                      type: integer
                                                                      nullable: true
                                                                      minimum: 0
                                                                      example: 0
                                                                    pre_screens:
                                                                      nullable: true
                                                                      type: integer
                                                                      minimum: 0
                                                                      example: 0
                                            SupplyAllocationCreateRequest:
                                              oneOf:
                                                - type: object
                                                  title: SupplyAllocationGroupType
                                                  properties:
                                                    percentage_max:
                                                      type: integer
                                                      nullable: false
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 44
                                                    percentage_min:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 78
                                                    name:
                                                      type: string
                                                      minLength: 1
                                                      example: Group A
                                                    type:
                                                      type: string
                                                      enum:
                                                        - group
                                                      description: Descriptor of the Group Allocation type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierId'
                                                  required:
                                                    - name
                                                    - type
                                                    - percentage_max
                                                - type: object
                                                  title: SupplyAllocationBlockedType
                                                  properties:
                                                    type:
                                                      type: string
                                                      enum:
                                                        - blocked
                                                      description: Descriptor of the Blocked type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierId'
                                                  required:
                                                    - type
                                            SupplyAllocationUpdateRequest:
                                              oneOf:
                                                - type: object
                                                  title: SupplyAllocationGroupType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    percentage_max:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 44
                                                    percentage_min:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 78
                                                    name:
                                                      type: string
                                                      minLength: 1
                                                      example: Group A
                                                    type:
                                                      type: string
                                                      enum:
                                                        - group
                                                      description: Descriptor of the Group Allocation type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierId'
                                                  required:
                                                    - name
                                                    - type
                                                    - percentage_max
                                                - type: object
                                                  title: SupplyAllocationExchangeType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    type:
                                                      type: string
                                                      enum:
                                                        - exchange
                                                      description: Descriptor of the Exchange type.
                                                    percentage_max:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 44
                                                    percentage_min:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 78
                                                  required:
                                                    - type
                                                    - percentage_max
                                                - type: object
                                                  title: SupplyAllocationBlockedType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    type:
                                                      type: string
                                                      enum:
                                                        - blocked
                                                      description: Descriptor of the Blocked type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierId'
                                                  required:
                                                    - type
                                            UpdateSupplyAllocationResponse:
                                              type: object
                                              properties:
                                                completes:
                                                  type: integer
                                                  nullable: true
                                                  minimum: 0
                                                  example: 0
                                                pre_screens:
                                                  nullable: true
                                                  type: integer
                                                  example: 0
                                              oneOf:
                                                - type: object
                                                  title: SupplyAllocationGroupType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    name:
                                                      type: string
                                                      minLength: 1
                                                      example: Group A
                                                    percentage_max:
                                                      type: integer
                                                      nullable: false
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 44
                                                    percentage_min:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 78
                                                    total_remaining:
                                                      nullable: true
                                                      type: integer
                                                      example: 0
                                                    type:
                                                      type: string
                                                      enum:
                                                        - group
                                                      description: Descriptor of the Group Allocation type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierResponse'
                                                - type: object
                                                  title: SupplyAllocationExchangeType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    percentage_max:
                                                      type: integer
                                                      nullable: false
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 44
                                                    percentage_min:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      maximum: 100
                                                      example: 78
                                                    total_remaining:
                                                      nullable: true
                                                      type: integer
                                                      example: 0
                                                    type:
                                                      type: string
                                                      enum:
                                                        - exchange
                                                      description: Descriptor of the Exchange type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierResponse'
                                                - type: object
                                                  title: SupplyAllocationBlockedType
                                                  properties:
                                                    id:
                                                      type: integer
                                                      nullable: true
                                                      minimum: 0
                                                      example: 368100
                                                    type:
                                                      type: string
                                                      enum:
                                                        - blocked
                                                      description: Descriptor of the Blocked type.
                                                    suppliers:
                                                      nullable: true
                                                      type: array
                                                      items:
                                                        $ref: '#/components/schemas/SupplierResponse'
                                            IndustryListItem:
                                              type: object
                                              description: Industry details.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: integer
                                                  description: Unique identifier of the industry.
                                                  example: 19
                                                code:
                                                  type: string
                                                  description: Unique text code of the industry.
                                                  example: politics
                                                name:
                                                  type: string
                                                  description: Human readable name of the industry.
                                                  example: Politics
                                            IndustryLockoutItem:
                                              type: object
                                              description: Industry lockout.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: integer
                                                  description: Unique identifier of the industry lockout.
                                                  example: 90
                                                code:
                                                  type: string
                                                  description: Unique text code of the industry lockout.
                                                  example: past_90_days
                                                name:
                                                  type: string
                                                  description: Human readable name of the industry lockout.
                                                  example: Past 90 Days / 3 Months
                                            IntegrationUseCaseListItem:
                                              type: object
                                              description: Integration use case.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: string
                                                  description: Use case ID.
                                                  example: manage_surveys
                                                name:
                                                  type: string
                                                  description: Use case name.
                                                  example: Manage surveys
                                                description:
                                                  type: string
                                                  description: Use case description.
                                                  example: Create, update, and retrieve surveys, allocations, groups, qualifications, and quotas.
                                            Locales:
                                              type: object
                                              properties:
                                                locales:
                                                  type: array
                                                  description: A list of suggested locales.
                                                  items:
                                                    type: object
                                                    properties:
                                                      country:
                                                        type: object
                                                        description: Details of the country based on the locale.
                                                        properties:
                                                          code:
                                                            type: string
                                                            description: The country code.
                                                          name:
                                                            type: string
                                                            description: The name of the country.
                                                      languages:
                                                        type: array
                                                        description: A list of supported country languages.
                                                        items:
                                                          type: object
                                                          properties:
                                                            is_preferred:
                                                              type: boolean
                                                              description: Indicates whether the country language is preferred.
                                                            name:
                                                              type: string
                                                              description: A human readable name of the country language.
                                                            code:
                                                              type: string
                                                              description: Country language code.
                                              example:
                                                locales:
                                                  - country:
                                                      code: in
                                                      name: India
                                                    languages:
                                                      - is_preferred: true
                                                        name: English
                                                        code: eng
                                                      - is_preferred: true
                                                        name: Hindi
                                                        code: hin
                                                      - is_preferred: false
                                                        name: Bengali
                                                        code: ben
                                                  - country:
                                                      code: us
                                                      name: United States
                                                    languages:
                                                      - is_preferred: true
                                                        name: English
                                                        code: eng
                                                      - is_preferred: true
                                                        name: Spanish
                                                        code: spa
                                                      - is_preferred: false
                                                        name: Chinese Simplified
                                                        code: chi
                                            StudyTypeListItem:
                                              type: object
                                              description: Study type details.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: integer
                                                  description: Unique identifier of the study type.
                                                  example: 1
                                                code:
                                                  type: string
                                                  description: Unique text code of the study type.
                                                  example: adhoc
                                                name:
                                                  type: string
                                                  description: Human readable name of the study type.
                                                  example: Adhoc
                                            SupplierDetailsItem:
                                              type: object
                                              description: Supplier details.
                                              readOnly: true
                                              properties:
                                                id:
                                                  type: integer
                                                  description: Unique identifier of the supplier.
                                                  example: 4321
                                                code:
                                                  type: string
                                                  description: Unique text code of the supplier.
                                                  example: ACE
                                                name:
                                                  type: string
                                                  description: Human readable name of the supplier.
                                                  example: Acme Inc

  responses:
  Error_Unauthorized:
  description: A request is unauthorized.
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: 1dcf0f40-f0d1-4cf6-8c00-c3d019d32faf
  object: authorization_error
  detail: you don't have the right permissions to perform this operation
  Error_Forbidden:
  description: A requested is forbidden.
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: fe68cdd2-ee87-4dbf-8950-63c5cbca94c7
  object: authorization_error
  detail: you don't have the right permissions to perform this operation
  Error_Internal:
  description: A request failed due to an internal error.
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: d94b8bb2-a540-4a91-9c05-2aa3ae9a5e1e
  object: unexpected_internal_error
  detail: an internal error has led to the failure of this operation
  Error_NotFound:
  description: A requested resource isn't found.
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: 7a5972ba-0825-4360-b852-fa2430e47034
  object: not_found_error
  detail: resource not found
  Error_BadRequest:
  description: A request is not valid and can't be processed.
  content:
  application/json:
  schema:
  oneOf: - $ref: '#/components/schemas/Error' - $ref: '#/components/schemas/InvalidParamsBadRequestError'
  example:
  id: 9e278238-d011-4e05-8327-1ce1d5d26254
  object: bad_request_error
  detail: Expected field 'foo' is missing.
  Precondition_Failed:
  description: Resource could not be modified due to wrong expected version
  headers:
  traceparent:
  $ref: '#/components/headers/Traceparent'
  tracestate:
  $ref: '#/components/headers/Tracestate'
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: 3d61d9c3-68ee-4026-b436-6e76a2b33932
  object: precondition_failed_error
  detail: resource could not be modified due to wrong expected version
  Error_BadRequest_DemandAPI:
  description: A request is not valid and can't be processed.
  headers:
  traceparent:
  $ref: '#/components/headers/Traceparent'
  tracestate:
  $ref: '#/components/headers/Tracestate'
  is-synthetic-traffic:
  $ref: '#/components/headers/IsSyntheticTraffic'
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/ClientErrorDemandAPI'
  Error_Internal_DemandAPI:
  description: A request failed due to an internal error.
  headers:
  traceparent:
  $ref: '#/components/headers/Traceparent'
  tracestate:
  $ref: '#/components/headers/Tracestate'
  is-synthetic-traffic:
  $ref: '#/components/headers/IsSyntheticTraffic'
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/InternalErrorDemandAPI'
  Error_MethodNotAllowed:
  description: A request is valid but not supported by the current state of the target resource.
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: 10e53384-803e-4cb6-b8c2-d93fa196ea8e
  object: method_not_allowed_error
  detail: Cannot complete a target group which is paused.
  Error_RateLimit:
  description: Rate limiting
  headers:
  traceparent:
  $ref: '#/components/headers/Traceparent'
  tracestate:
  $ref: '#/components/headers/Tracestate'
  retry-After:
  description: How long the user agent should wait before making a follow-up request.
  schema:
  type: integer
  format: int32
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/TooManyRequestsProblemDetails'
  Error_InvalidState:
  description: A request failed due to invalid state of the entity
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/Error'
  example:
  id: d94b8bb2-a540-4a91-9c05-2aa3ae9a5e1e
  object: invalid_state_error
  detail: The entity does not meet the required state.
  requestBodies:
  WebhookCreate:
  description: Create a new webhook request body.
  required: true
  content:
  application/json:
  schema:
  type: object
  description: A response containing the ID of the created webhook.
  required: - id - url - events
  properties:
  id:
  $ref: '#/components/schemas/WebhookID'
  url:
  $ref: '#/components/schemas/WebhookURL'
  events:
  $ref: '#/components/schemas/WebhookEvents'
  example:
  id: 7b8fe28a-7b60-4145-946b-fa1b68ae5de7
  url: https://example.com/webhook
  events: - survey_completed
  WebhookUpdate:
  description: Update an existing webhook request body.
  required: true
  content:
  application/json:
  schema:
  type: object
  description: A response containing the ID of the updated webhook.
  properties:
  url:
  $ref: '#/components/schemas/WebhookURL'
  events:
  $ref: '#/components/schemas/WebhookEvents'
  example:
  url: https://example.com/webhook
  events: - survey_completed
  headers:
  ETag:
  description: The `ETag` header provides a unique identifier, that represents the current version state of a particular resource.
  required: true
  schema:
  $ref: '#/components/schemas/ETag'
  IdempotencyKey:
  description: A shallow unique UUID that serves as a deduping mechanism. For mutable operations (POST/PUT), this header is MANDATORY.
  schema:
  $ref: '#/components/schemas/IdempotencyKey'
  Traceparent:
  description: The `traceparent` header primarily carries essential trace context information, including the trace ID and parent span ID as defined by the W3C trace context specification. It's used to pinpoint the position of an incoming request within the trace graph, facilitating the tracking of distributed operations.
  required: false
  schema:
  $ref: '#/components/schemas/Traceparent'
  Tracestate:
  description: The `tracestate` header complements the `traceparent` header by providing additional contextual information, thereby allowing for the enrichment of tracing context and offering more fine-grained control.
  required: false
  schema:
  $ref: '#/components/schemas/Tracestate'
  Location:
  description: The location of a resource. Must follow https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.2
  required: true
  schema:
  type: string
  description: This can be an URI reference pointing to a resource or the ID of the resource itself.
  example: - https://api.cint.com/demand/business-units - /demand/business-units - business-units - fe666fcd-490c-4cb4-b4e0-2f86e15c27e6
  IsSyntheticTraffic:
  description: 'Boolean value representing whether request is the product of synthetic traffic. By default, set to false. '
  schema:
  $ref: '#/components/schemas/IsSyntheticTraffic'
