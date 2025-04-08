/**
 * Graphiti Check Enforcer Middleware
 * 
 * This middleware intercepts Cursor AI requests and enforces Graphiti knowledge graph checks
 * before allowing any new task to proceed.
 */

import { NextRequest, NextResponse } from 'next/server';

// Use a more robust session tracker with TTL for multi-user environments
interface SessionState {
  hasCheckedGraphiti: boolean;
  lastUpdated: number;
  taskType?: string;
  queryCount: number;
}

// Track if Graphiti has been checked for each session with expiration
const graphitiCheckTracker = new Map<string, SessionState>();

// Session timeout (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Clean expired sessions
const cleanExpiredSessions = () => {
  const now = Date.now();
  Array.from(graphitiCheckTracker.entries()).forEach(([sessionId, state]) => {
    if (now - state.lastUpdated > SESSION_TIMEOUT_MS) {
      graphitiCheckTracker.delete(sessionId);
      console.log(`[GraphitiEnforcer] Expired session removed: ${sessionId}`);
    }
  });
};

// Run cleanup every 10 minutes
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

// Helper to extract task information from the request with better error handling
function extractTaskInfo(req: NextRequest) {
  try {
    // Extract session ID with fallback mechanisms
    const sessionId = req.headers.get('x-session-id') || 
                     req.cookies.get('session-id')?.value ||
                     req.headers.get('x-request-id') ||
                     'default-session';
    
    // Determine if this is a new task based on conversation context
    const conversationContext = req.headers.get('x-conversation-context') || '';
    const isNewTask = conversationContext === 'new' || 
                     !conversationContext.includes('follow-up');
    
    // Get task type if specified
    const taskType = req.headers.get('x-task-type') || 'unknown';
    
    return { sessionId, isNewTask, taskType };
  } catch (error) {
    console.error('[GraphitiEnforcer] Error extracting task info:', error);
    // Fallback to secure defaults - require check if we can't determine status
    return {
      sessionId: `error-session-${Date.now()}`,
      isNewTask: true,
      taskType: 'unknown'
    };
  }
}

// Helper to check if the request contains Graphiti check calls with more robust parsing
function containsGraphitiCheck(req: NextRequest): boolean {
  try {
    // More robust body handling
    let bodyContent = '';
    
    // Try to get body as text
    if (req.body) {
      const bodyText = req.body.toString();
      if (bodyText) {
        bodyContent = bodyText;
      }
    }
    
    // Check headers for bypass cases (for testing/development)
    const bypassHeader = req.headers.get('x-graphiti-check-bypass');
    if (bypassHeader === process.env.GRAPHITI_BYPASS_SECRET) {
      console.log('[GraphitiEnforcer] Bypass header detected with valid secret');
      return true;
    }
    
    // Structured check pattern
    return bodyContent.includes('mcp_Graphiti_search_nodes') || 
           bodyContent.includes('search_nodes') ||
           bodyContent.includes('mcp_Graphiti_search_facts') ||
           bodyContent.includes('search_facts');
  } catch (error) {
    console.error('[GraphitiEnforcer] Error checking for Graphiti in request:', error);
    // Fail closed - require check if we can't determine
    return false;
  }
}

// Telemetry tracking
interface TelemetryRecord {
  timestamp: number;
  sessionId: string;
  action: 'check' | 'bypass' | 'block' | 'complete';
  taskType?: string;
  success: boolean;
}

const telemetryBuffer: TelemetryRecord[] = [];
const MAX_TELEMETRY_BUFFER = 100;

// Simple in-memory telemetry recording
function recordTelemetry(record: TelemetryRecord) {
  telemetryBuffer.push(record);
  if (telemetryBuffer.length > MAX_TELEMETRY_BUFFER) {
    // In production, we would send this to a telemetry service
    // For now, just trim the buffer
    telemetryBuffer.splice(0, 20);
  }
  // Log telemetry
  console.log(`[GraphitiTelemetry] ${record.action} | ${record.sessionId} | ${record.success}`);
}

/**
 * Middleware function to enforce Graphiti checks with enhanced tracking and error handling
 */
export async function graphitiCheckEnforcer(
  req: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Skip non-CursorAI requests
  if (!req.headers.get('user-agent')?.includes('CursorAI')) {
    return next();
  }

  const { sessionId, isNewTask, taskType } = extractTaskInfo(req);

  // Initialize or update session
  if (!graphitiCheckTracker.has(sessionId)) {
    graphitiCheckTracker.set(sessionId, { 
      hasCheckedGraphiti: false, 
      lastUpdated: Date.now(),
      taskType,
      queryCount: 0
    });
  } else {
    // Update existing session
    const session = graphitiCheckTracker.get(sessionId)!;
    session.lastUpdated = Date.now();
    session.queryCount++;
    graphitiCheckTracker.set(sessionId, session);
  }

  const sessionState = graphitiCheckTracker.get(sessionId)!;

  // If this is a new task and Graphiti hasn't been checked yet
  if (isNewTask && !sessionState.hasCheckedGraphiti) {
    // If this request contains a Graphiti check, mark it as checked
    if (containsGraphitiCheck(req)) {
      sessionState.hasCheckedGraphiti = true;
      graphitiCheckTracker.set(sessionId, sessionState);
      
      console.log(`[GraphitiEnforcer] Graphiti check detected for session ${sessionId}`);
      
      // Record successful check telemetry
      recordTelemetry({
        timestamp: Date.now(),
        sessionId,
        action: 'check',
        taskType: sessionState.taskType,
        success: true
      });
      
      return next();
    }

    // This is a new task without a Graphiti check, block it
    console.warn(`[GraphitiEnforcer] Blocking request - missing Graphiti check for session ${sessionId}`);
    
    // Record blocked request telemetry
    recordTelemetry({
      timestamp: Date.now(),
      sessionId,
      action: 'block',
      taskType: sessionState.taskType,
      success: false
    });
    
    return new NextResponse(
      JSON.stringify({
        error: 'GRAPHITI_CHECK_REQUIRED',
        message: 'Before starting any task, you must check the Graphiti knowledge graph for relevant information.',
        requiredProcedure: 'Use mcp_Graphiti_search_nodes and mcp_Graphiti_search_facts before proceeding.',
        documentation: 'For more information, see docs/cursor-ai-graphiti-procedure.md',
        sessionId // Include session ID for tracking
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Graphiti-Session': sessionId
        }
      }
    );
  }

  // Clear the check flag when the task is completed
  if (req.headers.get('x-task-status') === 'completed') {
    // Don't delete the session, just reset the check flag
    sessionState.hasCheckedGraphiti = false;
    graphitiCheckTracker.set(sessionId, sessionState);
    
    console.log(`[GraphitiEnforcer] Task completed, resetting check state for session ${sessionId}`);
    
    // Record task completion telemetry
    recordTelemetry({
      timestamp: Date.now(),
      sessionId,
      action: 'complete',
      taskType: sessionState.taskType,
      success: true
    });
  }

  // Record bypass telemetry for non-blocked requests
  if (sessionState.hasCheckedGraphiti) {
    recordTelemetry({
      timestamp: Date.now(),
      sessionId,
      action: 'bypass',
      taskType: sessionState.taskType,
      success: true
    });
  }

  return next();
} 

// Export telemetry data for dashboard access
export function getGraphitiTelemetry() {
  return {
    activeSessions: Array.from(graphitiCheckTracker.entries()).map(([id, state]) => ({
      sessionId: id,
      lastUpdated: new Date(state.lastUpdated).toISOString(),
      hasCheckedGraphiti: state.hasCheckedGraphiti,
      taskType: state.taskType,
      queryCount: state.queryCount
    })),
    telemetry: [...telemetryBuffer]
  };
} 