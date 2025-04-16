/**
 * CursorAI Agent Configuration Service
 *
 * Provides configuration for CursorAI agents to ensure they check Graphiti before starting any task.
 * This service injects the necessary rules and instructions into agent system messages.
 */

// Base system message template that includes the Graphiti check requirement
const BASE_AGENT_SYSTEM_MESSAGE = `
You are a helpful CursorAI assistant. Before starting any task, you MUST follow this procedure:

1. Use mcp_Graphiti_search_nodes to find existing preferences, procedures or facts relevant to the task
2. Filter by entity type when searching (e.g., "Preference" or "Procedure")
3. Use mcp_Graphiti_search_facts to uncover relationships or relevant factual data
4. Review all matches before taking any action
5. Follow any discovered procedures or preferences exactly

This step is MANDATORY and cannot be skipped under any circumstances.
`;

// Additional instruction sets that can be included
const INSTRUCTION_SETS = {
  DEFAULT: `Ensure you check the Graphiti knowledge graph before every task.`,
  DEVELOPMENT: `When working with code, always check for coding standards and patterns in Graphiti.`,
  CONTENT: `When generating content, check Graphiti for brand voice, style guidelines, and content preferences.`,
  DESIGN: `When working on design tasks, check Graphiti for brand colors, UI components, and design patterns.`,
};

/**
 * Configuration for CursorAI agent instances
 */
export interface AgentConfig {
  systemMessage: string;
  enforceGraphitiCheck: boolean;
  requireVerification: boolean;
  customInstructions?: string;
}

/**
 * Creates a configuration for a CursorAI agent with enforced Graphiti checks
 */
export function createAgentConfig(
  type: keyof typeof INSTRUCTION_SETS = 'DEFAULT',
  customInstructions?: string
): AgentConfig {
  const instructionSet = INSTRUCTION_SETS[type];

  // Build the system message with required Graphiti checking
  const systemMessage = `${BASE_AGENT_SYSTEM_MESSAGE}
${instructionSet}
${customInstructions || ''}`;

  return {
    systemMessage,
    enforceGraphitiCheck: true, // Always enforce Graphiti checks
    requireVerification: true, // Require verification after task completion
    customInstructions,
  };
}

/**
 * Validates a user query or instruction to ensure it includes Graphiti checks
 * for new tasks where applicable
 */
export function validateUserQuery(
  query: string,
  previousQueries: string[] = []
): { valid: boolean; reason?: string } {
  // If this is the first query in a session, no check required yet
  if (previousQueries.length === 0) {
    return { valid: true };
  }

  // Check if this appears to be a new task (not follow-up to previous)
  const seemsLikeNewTask = !isFollowUpQuery(query);

  if (seemsLikeNewTask) {
    // For new tasks, check if any previous queries in this session included Graphiti checks
    const hasGraphitiCheck = previousQueries.some(
      q =>
        q.includes('mcp_Graphiti_search_nodes') ||
        q.includes('search_nodes') ||
        q.includes('mcp_Graphiti_search_facts') ||
        q.includes('search_facts')
    );

    if (!hasGraphitiCheck) {
      return {
        valid: false,
        reason: 'Before starting a new task, you must check the Graphiti knowledge graph.',
      };
    }
  }

  return { valid: true };
}

/**
 * Helper to determine if a query is likely a follow-up
 */
function isFollowUpQuery(query: string): boolean {
  const followUpPhrases = [
    'continue',
    'go on',
    'proceed',
    'next',
    'and then',
    'what about',
    'additionally',
    'also',
    'furthermore',
    'can you',
    'please',
    'now',
  ];

  // Check if query starts with any follow-up phrases
  const startsWithFollowUp = followUpPhrases.some(phrase =>
    query.toLowerCase().trim().startsWith(phrase)
  );

  // Check for pronouns referring to previous context
  const hasReferentialPronouns = /\b(it|this|that|these|those)\b/i.test(query);

  return startsWithFollowUp || hasReferentialPronouns;
}
