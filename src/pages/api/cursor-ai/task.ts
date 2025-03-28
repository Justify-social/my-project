/**
 * CursorAI Task API Endpoint
 * 
 * This API endpoint handles CursorAI task requests. It will only succeed if
 * the agent has checked Graphiti first, which is enforced by middleware.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { validateUserQuery } from '../../../services/cursor-ai';

type TaskRequest = {
  query: string;
  previousQueries?: string[];
  sessionId?: string;
};

type TaskResponse = {
  success: boolean;
  message: string;
  result?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed',
      error: 'Only POST requests are supported'
    });
  }

  try {
    // Parse the request body
    const { query, previousQueries = [] } = req.body as TaskRequest;
    
    // Validate that Graphiti checks have been performed if this is a new task
    const validation = validateUserQuery(query, previousQueries);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason || 'Invalid request',
        error: 'GRAPHITI_CHECK_REQUIRED'
      });
    }
    
    // Process the task (in a real application, this would do actual work)
    const result = {
      taskProcessed: true,
      queryLength: query.length,
      timestamp: new Date().toISOString()
    };
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Task processed successfully',
      result
    });
  } catch (error) {
    console.error('Error processing CursorAI task:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 