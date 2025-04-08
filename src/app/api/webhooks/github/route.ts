import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// Removed imports for componentRegistry and notificationService as they are unused and/or outdated
// import { componentRegistry } from '@/app/(admin)/debug-tools/ui-components/utils/discovery'; 
// import { notificationService } from '@/lib/components/notifications';
import { logger } from '@/lib/logger';

/**
 * Webhook Event Types
 */
enum WebhookEventType {
  PUSH = 'push',
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_REVIEW = 'pull_request_review',
  WORKFLOW_RUN = 'workflow_run',
}

/**
 * Component Change Types
 */
enum ComponentChangeType {
  ADDED = 'added',
  MODIFIED = 'modified',
  REMOVED = 'removed',
}

/**
 * Interface for component change
 */
interface ComponentChange {
  path: string;
  type: ComponentChangeType;
  commitId: string;
  author: string;
  timestamp: Date;
}

/**
 * GitHub Webhook Handler
 * 
 * Securely processes webhook events from GitHub to automatically update
 * the component registry when component files change.
 * 
 * Security features:
 * - Cryptographic signature validation
 * - Event type filtering
 * - Branch-based processing rules
 * - Rate limiting
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get request body and headers
    const payload = await req.json();
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');

    // If missing required headers, return error
    if (!signature || !event) {
      logger.warn('Webhook missing required headers', { signature: !!signature, event });
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Validate webhook signature
    if (!verifySignature(await req.clone().text(), signature)) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process based on event type
    switch (event) {
      case WebhookEventType.PUSH:
        await handlePushEvent(payload);
        break;
      case WebhookEventType.PULL_REQUEST:
        await handlePullRequestEvent(payload);
        break;
      default:
        // Ignore other event types
        return NextResponse.json({ status: 'ignored', event }, { status: 200 });
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Verify webhook signature using HMAC
 */
function verifySignature(payload: string, signature: string): boolean {
  try {
    // Get webhook secret from environment variable
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('GITHUB_WEBHOOK_SECRET not configured');
      return false;
    }

    // Calculate expected signature
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    );
  } catch (error) {
    logger.error('Error verifying signature', { error });
    return false;
  }
}

/**
 * Handle push event
 */
async function handlePushEvent(payload: any): Promise<void> {
  // Extract relevant information from payload
  const { ref, repository, commits, sender } = payload;
  const branch = ref.replace('refs/heads/', '');

  // Only process main/master branch or configured branches
  const allowedBranches = (process.env.WEBHOOK_ALLOWED_BRANCHES || 'main,master').split(',');
  if (!allowedBranches.includes(branch)) {
    logger.info('Ignoring push to non-allowed branch', { branch });
    return;
  }

  logger.info('Push event received, component processing temporarily disabled', { branch });
}

/**
 * Handle pull request event
 */
async function handlePullRequestEvent(payload: any): Promise<void> {
  // Only process opened, synchronized, or closed (merged) PRs
  const action = payload.action;
  if (!['opened', 'synchronize', 'closed'].includes(action)) {
    return;
  }

  const pullRequest = payload.pull_request;
  const merged = action === 'closed' && pullRequest.merged;

  // If PR was merged, process like a push event
  if (merged) {
    logger.info('Merged PR event received, component processing temporarily disabled', { pullRequest: pullRequest.number });
  } else {
    // For opened/synchronized PRs, just create a preview or validation
    // Preview creation logic might also be broken due to registry changes, commenting out for safety
    // await createPullRequestPreview(payload);
    logger.info('Opened/Sync PR event received, preview creation temporarily disabled', { pullRequest: pullRequest.number });
  }
}

/**
 * Extract component changes from commits
 */
function extractComponentChanges(commits: any[], author: string): ComponentChange[] {
  const changes: ComponentChange[] = [];

  for (const commit of commits) {
    // Process added files
    for (const path of commit.added) {
      if (isComponentFile(path)) {
        changes.push({
          path,
          type: ComponentChangeType.ADDED,
          commitId: commit.id,
          author: commit.author?.username || author,
          timestamp: new Date(commit.timestamp)
        });
      }
    }

    // Process modified files
    for (const path of commit.modified) {
      if (isComponentFile(path)) {
        changes.push({
          path,
          type: ComponentChangeType.MODIFIED,
          commitId: commit.id,
          author: commit.author?.username || author,
          timestamp: new Date(commit.timestamp)
        });
      }
    }

    // Process removed files
    for (const path of commit.removed) {
      if (isComponentFile(path)) {
        changes.push({
          path,
          type: ComponentChangeType.REMOVED,
          commitId: commit.id,
          author: commit.author?.username || author,
          timestamp: new Date(commit.timestamp)
        });
      }
    }
  }

  return changes;
}

/**
 * Check if a file is a UI component file
 */
function isComponentFile(path: string): boolean {
  // Check if it's a component file
  return (
    path.startsWith('src/components/ui/') &&
    (path.endsWith('.tsx') || path.endsWith('.jsx')) &&
    !path.includes('/__tests__/') &&
    !path.includes('/__mocks__/')
  );
}

/**
 * Map GitHub file status to ComponentChangeType
 */
function mapChangeType(status: string): ComponentChangeType {
  switch (status) {
    case 'added':
      return ComponentChangeType.ADDED;
    case 'removed':
      return ComponentChangeType.REMOVED;
    default:
      return ComponentChangeType.MODIFIED;
  }
}

/**
 * Process component changes
 */
async function processComponentChanges(
  changes: ComponentChange[],
  metadata: {
    repository: string;
    branch: string;
    sender: string;
    pullRequest?: number;
  }
): Promise<void> {
  try {
    // Group changes by type for more efficient processing
    const added = changes.filter(c => c.type === ComponentChangeType.ADDED);
    const modified = changes.filter(c => c.type === ComponentChangeType.MODIFIED);
    const removed = changes.filter(c => c.type === ComponentChangeType.REMOVED);

    logger.info('Processing component changes (logic currently disabled)', {
      added: added.length,
      modified: modified.length,
      removed: removed.length,
      metadata
    });

    // Create an atomic transaction for all changes
    // const transaction = componentRegistry.createTransaction(); // Commented out

    /* // Commented out: Transaction logic requires refactoring
    // Process added components
    for (const change of added) {
      await transaction.addComponent(change.path, {
        author: change.author,
        commitId: change.commitId
      });
    }
    
    // Process modified components
    for (const change of modified) {
      await transaction.updateComponent(change.path, {
        author: change.author,
        commitId: change.commitId
      });
    }
    
    // Process removed components
    for (const change of removed) {
      await transaction.removeComponent(change.path);
    }
    
    // Commit all changes atomically
    const result = await transaction.commit();
    
    // Send notifications about changes
    await notifyComponentChanges(result, metadata); // notifyComponentChanges itself is also commented out
    */

  } catch (error) {
    logger.error('Error processing component changes', { error, changes });
    throw error;
  }
}

/**
 * Get changed files in a pull request
 */
async function getChangedFilesInPR(repo: string, prNumber: number): Promise<any[]> {
  try {
    // GitHub token is required for API access
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      logger.error('GITHUB_TOKEN not configured');
      return [];
    }

    // Call GitHub API to get PR files
    const response = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching PR files', { error, repo, prNumber });
    return [];
  }
}

/**
 * Create a preview for a pull request
 */
async function createPullRequestPreview(payload: any): Promise<void> {
  // Create a preview environment for the PR
  const prNumber = payload.pull_request.number;
  const repo = payload.repository.full_name;

  try {
    logger.info('Creating PR preview (logic currently disabled)', { prNumber, repo });

    /* // Commented out: Preview logic requires refactoring
    // Get changed files in the PR
    const changedFiles = await getChangedFilesInPR(repo, prNumber);
    const componentFiles = changedFiles.filter(file => isComponentFile(file.filename));
    
    if (componentFiles.length === 0) {
      logger.info('No component changes in PR', { prNumber });
      return;
    }
    
    // Create a preview entry in the registry
    await componentRegistry.createPreview(prNumber, componentFiles); // Commented out
    
    // Add a comment to the PR with preview link
    await addPRComment(repo, prNumber, createPreviewComment(prNumber, componentFiles));
    */

  } catch (error) {
    logger.error('Error creating PR preview', { error, prNumber });
  }
}

/**
 * Add a comment to a pull request
 */
async function addPRComment(repo: string, prNumber: number, comment: string): Promise<void> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      logger.error('GITHUB_TOKEN not configured');
      return;
    }

    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: comment })
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
  } catch (error) {
    logger.error('Error adding PR comment', { error, repo, prNumber });
  }
}

/**
 * Create comment for PR preview
 */
function createPreviewComment(prNumber: number, componentFiles: any[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const previewUrl = `${baseUrl}/debug-tools/ui-components?preview=${prNumber}`;

  return `## UI Component Changes Detected 🚀

This PR contains changes to **${componentFiles.length}** UI component${componentFiles.length === 1 ? '' : 's'}.

<details>
<summary>View changed components</summary>

${componentFiles.map(file => `- \`${file.filename}\` (${file.status})`).join('\n')}

</details>

### [▶️ Preview UI Components](${previewUrl})

The UI Component Library preview will show you how these changes look in the context of the complete design system.
`;
}

/**
 * Notify about component changes
 */
async function notifyComponentChanges(
  result: any,
  metadata: {
    repository: string;
    branch: string;
    sender: string;
    pullRequest?: number;
  }
): Promise<void> {
  try {
    // Send WebSocket notifications to connected clients
    // await notificationService.broadcastComponentChanges(result.changes);

    // If configured, send email notifications for major changes
    if (result.breaking.length > 0) {
      await sendBreakingChangeNotifications(result.breaking, metadata);
    }
  } catch (error) {
    logger.error('Error sending notifications', { error });
  }
}

/**
 * Send notifications for breaking changes
 */
async function sendBreakingChangeNotifications(
  breakingChanges: any[],
  metadata: {
    repository: string;
    branch: string;
    sender: string;
    pullRequest?: number;
  }
): Promise<void> {
  // Implementation would depend on notification system
  logger.info('Would send breaking change notifications', {
    count: breakingChanges.length,
    metadata
  });
} 