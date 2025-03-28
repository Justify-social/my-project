/**
 * Graphiti Check Enforcer Middleware
 * 
 * This middleware intercepts Cursor AI requests and enforces Graphiti knowledge graph checks
 * before allowing any new task to proceed.
 */

import { NextRequest, NextResponse } from 'next/server';

// Track if Graphiti has been checked for each session
const graphitiCheckTracker = new Map<string, boolean>();

// Helper to extract task information from the request
function extractTaskInfo(req: NextRequest) {
  try {
    // Parse the request body to extract task information
    // This will depend on how tasks are structured in your system
    return {
      sessionId: req.headers.get('x-session-id') || 'default-session',
      isNewTask: true, // Logic to determine if this is a new task
      taskType: 'unknown' // The type of task being performed
    };
  } catch (error) {
    console.error('Error extracting task info:', error);
    return {
      sessionId: 'error-session',
      isNewTask: true,
      taskType: 'unknown'
    };
  }
}

// Helper to check if the request contains Graphiti check calls
function containsGraphitiCheck(req: NextRequest): boolean {
  // Check request body for Graphiti search calls
  const body = req.body ? JSON.stringify(req.body) : '';
  
  return body.includes('mcp_Graphiti_search_nodes') || 
         body.includes('search_nodes') ||
         body.includes('mcp_Graphiti_search_facts') ||
         body.includes('search_facts');
}

/**
 * Middleware function to enforce Graphiti checks
 */
export async function graphitiCheckEnforcer(
  req: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Skip non-CursorAI requests
  if (!req.headers.get('user-agent')?.includes('CursorAI')) {
    return next();
  }

  const { sessionId, isNewTask } = extractTaskInfo(req);

  // If this is a new task and Graphiti hasn't been checked yet
  if (isNewTask && !graphitiCheckTracker.get(sessionId)) {
    // If this request contains a Graphiti check, mark it as checked
    if (containsGraphitiCheck(req)) {
      graphitiCheckTracker.set(sessionId, true);
      console.log(`[GraphitiEnforcer] Graphiti check detected for session ${sessionId}`);
      return next();
    }

    // This is a new task without a Graphiti check, block it
    console.warn(`[GraphitiEnforcer] Blocking request - missing Graphiti check for session ${sessionId}`);
    
    return new NextResponse(
      JSON.stringify({
        error: 'GRAPHITI_CHECK_REQUIRED',
        message: 'Before starting any task, you must check the Graphiti knowledge graph for relevant information.',
        requiredProcedure: 'Use mcp_Graphiti_search_nodes and mcp_Graphiti_search_facts before proceeding.'
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Clear the check flag when the task is completed
  if (req.headers.get('x-task-status') === 'completed') {
    graphitiCheckTracker.delete(sessionId);
    console.log(`[GraphitiEnforcer] Task completed, resetting check state for session ${sessionId}`);
  }

  return next();
} 