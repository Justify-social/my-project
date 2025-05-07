// src/lib/ai/brandlift_prompts.ts

import { BrandLiftStudyData } from '@/types/brand-lift'; // Assuming types are correctly defined

// --- Constants and Configuration ---
const AI_MODEL = 'gpt-4o-mini'; // Or 'gpt-4o' for higher quality but potentially slower/more expensive

const QUESTION_GENERATION_SYSTEM_PROMPT = `
You are an expert survey designer specializing in Brand Lift studies. Your task is to generate relevant, engaging, and methodologically sound survey questions based on campaign context. Adhere strictly to the following guidelines:

1.  **Format:** Output *only* a YAML list of questions. Each question must have: number, text, type (SINGLE_CHOICE or MULTIPLE_CHOICE), objective, kpi_association (string, nullable), is_randomized (boolean, default false), is_mandatory (boolean, default true), and options (a list of {text: string, image_description: string (brief, culturally sensitive suggestion for image/GIF)}).
2.  **Tone:** Conversational, social media-friendly, lowercase (except proper nouns/brands).
3.  **Question Types:** Primarily SINGLE_CHOICE or MULTIPLE_CHOICE.
4.  **Options:** 2-5 options per question. Options should be mutually exclusive and collectively exhaustive where appropriate. Include "none of the above" or similar if needed. Provide a brief, culturally sensitive image/GIF *description* for *each* answer option (e.g., "Smiling person using phone", "Confused emoji GIF").
5.  **Content:** Questions should measure awareness, recall, consideration, preference, intent, or message association based on the provided KPIs and campaign context.
6.  **Relevance:** Ensure questions directly relate to the campaign goals and primary/secondary KPIs.
7.  **Quantity:** Generate approximately 5-7 relevant questions unless specified otherwise.
8.  **YAML Structure Example (ensure this block is treated as a string within the prompt):
    \`\`\`yaml
    - number: 1
      text: 'how familiar are you with the [Brand Name] brand?' # YAML strings quoted
      type: SINGLE_CHOICE
      objective: 'gauge baseline brand awareness.'
      kpi_association: BRAND_AWARENESS
      is_randomized: false
      is_mandatory: true
      options:
        - text: 'very familiar'
          image_description: 'brand logo prominently displayed'
        - text: 'somewhat familiar'
          image_description: 'person looking thoughtfully at product'
        - text: 'not familiar at all'
          image_description: 'blank thought bubble'
        - text: 'none/other'
          image_description: 'question mark icon'
    - number: 2
      text: 'another question...'
      # ... more questions ...
    \`\`\`
`;

const VISUAL_SUGGESTION_SYSTEM_PROMPT = `
You are a creative assistant specializing in sourcing culturally sensitive and relevant visuals (images/GIFs) for survey questions. Based on the question text and answer options provided, suggest *brief descriptions* for appropriate, engaging, and unbiased visuals. Focus on descriptions that are easy to search for (e.g., "Smiling diverse group using laptops", "Animated thumbs up GIF"). Avoid overly complex or specific suggestions. Maintain a neutral and globally appropriate tone.
`;

// --- Prompt Generation Functions ---

/**
 * Creates the prompt for generating survey questions based on study context.
 * @param study - The BrandLiftStudy data containing context.
 * @returns The formatted prompt string.
 */
export function createQuestionGenerationPrompt(study: Partial<BrandLiftStudyData>): string {
    const campaignNameForPrompt = (study.campaign as any)?.campaignName || 'the campaign\'s associated marketing efforts';
    const brandName = (study.campaign as any)?.campaignName?.split(' ')[0] || 'the brand';

    const context = `
Campaign Context: ${campaignNameForPrompt}
Study Name: ${study.name ?? 'N/A'}
Funnel Stage Focus: ${study.funnelStage ?? 'N/A'}
Primary KPI: ${study.primaryKpi ?? 'N/A'}
Secondary KPIs: ${study.secondaryKpis?.join(', ') || 'None'}
`;

    const userPrompt = `
Please generate approximately 5-7 survey questions in YAML format based on the following study and campaign context. The primary brand for this study is \"${brandName}\". Focus questions on measuring the specified KPIs, particularly the primary KPI: ${study.primaryKpi ?? 'N/A'}. Remember to include image/GIF descriptions for each answer option.\n\n**Study & Campaign Context:**\n${context}\n`;
    return userPrompt;
}

/**
 * Creates a prompt specifically for suggesting visuals for a given question and its options.
 * (Note: Less used if question gen prompt includes image descriptions, but useful for refining)
 * @param questionText - The text of the survey question.
 * @param options - An array of answer option texts.
 * @returns The formatted prompt string.
 */
export function createVisualSuggestionPrompt(questionText: string, options: string[]): string {
    const optionsList = options.map((opt, i) => `  ${i + 1}. ${opt}`).join('\n');
    const userPrompt = `
For the following survey question and options, provide brief, culturally sensitive image/GIF descriptions for each option:\n\n**Question:** ${questionText}\n\n**Options:**\n${optionsList}\n\n**Output Format:**\nReturn a list of descriptions corresponding to the options.\nExample:\n1. Description for option 1\n2. Description for option 2\n...\n`;
    return userPrompt;
}

// --- Export Configuration ---
export const AiConfig = {
    model: AI_MODEL,
    questionGenSystemPrompt: QUESTION_GENERATION_SYSTEM_PROMPT,
    visualSystemPrompt: VISUAL_SUGGESTION_SYSTEM_PROMPT,
};