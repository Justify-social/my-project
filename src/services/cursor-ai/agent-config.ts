/**
 * CursorAI Agent Configuration Service
 *
 * Provides configuration for CursorAI agents.
 */

// Base system message template
const BASE_AGENT_SYSTEM_MESSAGE = `
You are a helpful CursorAI assistant.
`;

// Additional instruction sets that can be included
const INSTRUCTION_SETS = {
  DEFAULT: `Please assist with the user's request.`,
  DEVELOPMENT: `When working with code, always follow best practices and coding standards.`,
  CONTENT: `When generating content, ensure it is clear, concise, and relevant.`,
  DESIGN: `When working on design tasks, consider user experience and accessibility.`,
};

/**
 * Configuration for CursorAI agent instances
 */
export interface AgentConfig {
  systemMessage: string;
  requireVerification: boolean; // Kept this as it might be generically useful
  customInstructions?: string;
}

/**
 * Creates a configuration for a CursorAI agent.
 */
export function createAgentConfig(
  type: keyof typeof INSTRUCTION_SETS = 'DEFAULT',
  customInstructions?: string
): AgentConfig {
  const instructionSet = INSTRUCTION_SETS[type];

  // Build the system message
  const systemMessage = `${BASE_AGENT_SYSTEM_MESSAGE}
${instructionSet}
${customInstructions || ''}`;

  return {
    systemMessage,
    requireVerification: true, // Assuming this is still desired
    customInstructions,
  };
}
