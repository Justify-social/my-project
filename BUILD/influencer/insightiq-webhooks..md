Webhooks Integration Markdown File
markdown

Copy
# Webhooks Integration for InsightIQ API

This document outlines the setup, processing, and best practices for integrating InsightIQ webhooks, which deliver asynchronous updates (e.g., account changes, content updates) to avoid polling. It supplements the `openapi.v1.yml` specification and addresses Task 3.4 (Webhook Handler) in `refactor-insight-iq.md`. Some details (e.g., event types, signature verification) are pending from InsightIQ support.

## 1. Overview

Webhooks allow InsightIQ to notify your application of asynchronous events (e.g., `ACCOUNTS.*`, content updates under Engagement, transactions under Income). Instead of polling, your server exposes an endpoint that InsightIQ calls with event data (e.g., `account_id`, `content_ids`). You fetch full data using InsightIQ’s bulk retrieval API.

### Key Features
- **Purpose**: Avoid resource-intensive polling for asynchronous updates.
- **Events**: Updates for profiles (Identity), content (Engagement), transactions (Income), etc.
- **Payload**: Lightweight, containing IDs (e.g., `account_id`, `content_ids`) to fetch via API.
- **Security**: Signature verification and IP allow-listing (details pending).
- **Delivery**: At-least-once, with retries and a 5-second timeout.

## 2. Webhook Management

Webhook CRUD operations are likely managed via endpoints in `openapi.v1.yml` (under `/v1/webhooks`), but specific paths are not detailed in the provided documentation. The following are inferred based on standard RESTful patterns and the InsightIQ webhook guide. Confirm with InsightIQ support or check the developer dashboard.

### Assumed Endpoints
- **List Webhooks**: `GET /v1/webhooks`
  - Retrieves all registered webhooks.
- **Create Webhook**: `POST /v1/webhooks`
  - Registers a new webhook endpoint.
  - Example Request:
    ```json
    {
      "url": "https://your-domain.com/webhooks/insightiq",
      "events": ["ACCOUNTS.*", "CONTENTS.*"], // Pending specific event types
      "secret": "<your-signing-secret>" // For signature verification
    }
Retrieve Webhook: GET /v1/webhooks/{id}
Gets details for a specific webhook.
Update Webhook: PUT /v1/webhooks/{id}
Modifies an existing webhook.
Delete Webhook: DELETE /v1/webhooks/{id}
Removes a webhook.
Test Webhook: POST /v1/webhooks/{id}/send
Sends a test notification to verify setup.
Configuration
Environments: Configure webhooks separately for sandbox (https://api.sandbox.insightiq.ai), staging (https://api.staging.insightiq.ai), and production (https://api.insightiq.ai).
Action: Register webhooks via the InsightIQ dashboard or API after obtaining credentials.
Note: Confirm endpoint availability and event types (e.g., ACCOUNTS.CREATED, CONTENTS.UPDATED) with InsightIQ support, as openapi.v1.yml references “ACCOUNTS.*” but lacks specifics.

3. Payload Format
Webhooks are delivered via POST requests with a JSON payload containing event metadata and IDs for fetching full data. The exact format is pending, but based on the InsightIQ documentation, payloads are lightweight and include IDs.

Example Payload (Inferred)
json

Copy
{
  "event": "ACCOUNTS.UPDATED", // Pending confirmation
  "id": "wh_1234567890abcdef", // Unique webhook ID
  "timestamp": "2025-04-30T12:34:56Z", // ISO 8601
  "data": {
    "account_id": "abc123",
    "content_ids": ["c1", "c2", "c3"] // Up to 100 IDs
  }
}
Characteristics
Method: POST
Content-Type: application/json
Size: Up to 100 IDs per event to keep payloads lightweight.
Environment: Payloads are environment-specific (sandbox, staging, production).
Action: Request specific event types and payload schemas from InsightIQ support to finalize the handler.

4. Security
InsightIQ webhooks support signature verification and IP allow-listing to ensure authenticity and security. Details are incomplete in the provided documentation.

Signature Verification
Header: Likely Webhook-Signature or similar (e.g., Webhook-Signature: <signature>).
Algorithm: Assumed HMAC-SHA256 using a secret key provided during webhook registration.
Process:
Extract the signature from the header.
Compute HMAC-SHA256 of the raw request body using your secret.
Compare the computed signature with the provided one.
Reject the request if signatures don’t match.
Example (Pseudo-Code):
typescript

Copy
import crypto from 'crypto';

function verifyWebhookSignature(req: Request, secret: string): boolean {
  const signature = req.headers['webhook-signature'] as string;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}
Note: Confirm the header name, algorithm, and secret format with InsightIQ support.

IP Allow-Listing
InsightIQ likely restricts webhook requests to specific IP addresses for each environment.
Assumed IPs (pending confirmation):
Sandbox: 54.211.40.75, 3.82.72.201
Staging: 3.211.223.93, 44.216.173.40
Production: 3.211.223.93, 44.216.173.40
Action: Configure your server to accept requests only from these IPs. Update firewall rules or use a middleware:
typescript

Copy
const ALLOWED_IPS = ['54.211.40.75', '3.82.72.201', '3.211.223.93', '44.216.173.40'];

function restrictIP(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip;
  if (!ALLOWED_IPS.includes(clientIp)) {
    return res.status(403).json({ error: 'Forbidden IP' });
  }
  next();
}
Action: Request the official IP list from InsightIQ support.

5. Processing Workflow
Follow this workflow to handle InsightIQ webhooks efficiently:

Verify Signature: Validate the request using the signature header and secret.
Acknowledge Promptly: Respond with 200 OK within 5 seconds to avoid retries.
Persist Payload: Store the raw JSON in a database or message queue (e.g., Redis, RabbitMQ) for asynchronous processing.
Bulk Retrieve Data: Use the bulk retrieval API to fetch full records for the provided IDs.
Process Asynchronously: Update your database or application state in a separate thread/worker.
Example Handler (TypeScript/Express)
typescript

Copy
import { Request, Response } from 'express';
import { verifyWebhookSignature } from './webhookUtils'; // Implement based on support details
import { queueWebhookPayload } from './queueService'; // E.g., Redis or RabbitMQ

export async function webhookHandler(req: Request, res: Response) {
  // Verify signature
  const secret = process.env.INSIGHTIQ_WEBHOOK_SECRET || '';
  if (!verifyWebhookSignature(req, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Acknowledge immediately
  res.status(200).json({ status: 'Received' });

  // Queue payload for async processing
  const payload = req.body; // { event, id, timestamp, data: { account_id, content_ids } }
  await queueWebhookPayload(payload);
}

// Async worker to process payload
export async function processWebhookPayload(payload: any) {
  const { data: { account_id, content_ids } } = payload;
  const response = await fetch('https://api.insightiq.ai/v1/contents/search', {
    method: 'POST',
    headers: {
      Authorization: 'Basic <credentials>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: content_ids }),
  });
  const { data } = await response.json();
  // Save data to database (e.g., Prisma)
}
6. Bulk Retrieval Endpoint
To fetch full data for webhook IDs, use the bulk retrieval API:

Endpoint: POST /v1/<resource>/search (e.g., /v1/contents/search, /v1/accounts/search)
Request Body:
json

Copy
{
  "ids": ["id1", "id2", "..."] // Up to 100 IDs
}
Response Body:
json

Copy
{
  "data": [
    { /* Full object for id1 */ },
    { /* Full object for id2 */ },
    ...
  ]
}
Example:
typescript

Copy
async function fetchBulkContent(ids: string[]): Promise<any[]> {
  const response = await fetch('https://api.insightiq.ai/v1/contents/search', {
    method: 'POST',
    headers: {
      Authorization: 'Basic <credentials>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  const { data } = await response.json();
  return data;
}
7. Retry Policy and Idempotency
Retries: InsightIQ ensures at-least-once delivery with 3 retries:
After 1 minute.
After 5 minutes.
After 6 hours.
Timeout: 5 seconds per request. Respond within this window to avoid retries.
Idempotency:
Use the unique id field in the payload to detect and discard duplicates.
Example:
typescript

Copy
async function queueWebhookPayload(payload: any) {
  const { id } = payload;
  const exists = await db.webhook.exists({ webhookId: id });
  if (exists) return; // Skip duplicate
  await db.webhook.create({ webhookId: id, data: payload });
  // Queue for processing
}
Failure Handling:
If your system fails repeatedly, InsightIQ may disable the webhook and notify you via email.
Fix the issue and request re-enablement via support@insightiq.ai.
8. Ordering and Delivery Semantics
No Guaranteed Order: Events may arrive out of sequence. Design your handler to process events independently (e.g., store by id and reconcile later).
Not Time-Critical: Webhooks may be delayed (milliseconds to seconds). For time-sensitive use cases, consider polling InsightIQ’s API, but note potential rate limits.
9. Best Practices
Immediate Acknowledgment: Respond with 200 OK before processing to meet the 5-second timeout.
Asynchronous Processing: Handle payloads in a separate thread or worker to avoid blocking.
Batch Processing: Use the bulk retrieval API to minimize API calls and avoid rate limits.
Idempotency: Check the id field to prevent duplicate processing during retries.
Monitoring: Log webhook failures and monitor for disabled webhooks. Re-enable via support if needed.
Security: Implement signature verification and IP allow-listing once details are provided.
Error Handling: Handle API errors (e.g., rate limits, invalid IDs) gracefully:
typescript

Copy
async function fetchBulkContent(ids: string[]): Promise<any[]> {
  try {
    const response = await fetch('https://api.insightiq.ai/v1/contents/search', { ... });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Bulk fetch failed:', error);
    // Retry or queue for later
    throw error;
  }
}
10. Integration with InsightIQ Project
This webhook setup supports Task 3.4 in refactor-insight-iq.md. Key considerations:

Dependencies: Requires openapi.v1.yml for endpoint schemas (e.g., Account, Content) and TypeScript types in src/types/insightiq.ts.
Blockers: Specific event types, payload schemas, and signature verification details are pending. Contact support:
markdown

Copy
Subject: Urgent: Webhook Details for API Integration

Dear InsightIQ Support Team,

I’m implementing the webhook handler for your API (Task 3.4) using `openapi.v1.yml` and the `Handling Webhooks` guide. I need:
- Specific event types (e.g., `ACCOUNTS.CREATED`, `CONTENTS.UPDATED`).
- Example payload schemas.
- Signature verification details (header, algorithm, secret format).
- Official IP allow-list for sandbox, staging, and production.
These are critical blockers for our project. Please provide or direct me to the relevant documentation.

Thank you,
[Your Name]
Next Steps:
Implement the handler with placeholder signature verification.
Update insight-iq-contracts.md:
markdown

Copy
- [x] Obtain webhook documentation
  - Status: Acquired `docs/insightiq/webhooks-integration.md`. Pending event types, payloads, and signature details.
  - Action: Awaiting support response.
Proceed with Phase 4 (Type Definitions) and other unblocked tasks.
11. Future Enhancements
InsightIQ plans to enhance the bulk retrieval API with additional filtering attributes. Share your use cases with support@insightiq.ai to influence future features.

Source: InsightIQ Developer Docs, powered by Stoplight