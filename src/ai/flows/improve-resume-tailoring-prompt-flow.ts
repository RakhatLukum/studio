// src/ai/flows/improve-resume-tailoring-prompt-flow.ts
'use server';

/**
 * @fileOverview An AI agent that allows prompt engineers to iterate on the system prompt for resume tailoring and view previous versions.
 *
 * - improveResumeTailoringPrompt - A function that saves, retrieves, and displays system prompts for A/B testing.
 * - ImproveResumeTailoringPromptInput - The input type for the improveResumeTailoringPrompt function.
 * - ImproveResumeTailoringPromptOutput - The return type for the improveResumeTailoringPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveResumeTailoringPromptInputSchema = z.object({
  systemPrompt: z.string().describe('The system prompt to be saved.'),
  versionLabel: z.string().describe('A label for the version of the system prompt.'),
});
export type ImproveResumeTailoringPromptInput = z.infer<
  typeof ImproveResumeTailoringPromptInputSchema
>;

const ImproveResumeTailoringPromptOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the system prompt was saved successfully.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type ImproveResumeTailoringPromptOutput = z.infer<
  typeof ImproveResumeTailoringPromptOutputSchema
>;

export async function improveResumeTailoringPrompt(
  input: ImproveResumeTailoringPromptInput
): Promise<ImproveResumeTailoringPromptOutput> {
  return improveResumeTailoringPromptFlow(input);
}

const improveResumeTailoringPromptFlow = ai.defineFlow(
  {
    name: 'improveResumeTailoringPromptFlow',
    inputSchema: ImproveResumeTailoringPromptInputSchema,
    outputSchema: ImproveResumeTailoringPromptOutputSchema,
  },
  async input => {
    // Placeholder implementation: In a real application, this would save
    // the system prompt and version label to a database.
    console.log(
      `Saving system prompt version ${input.versionLabel}: ${input.systemPrompt}`
    );
    return {
      success: true,
      message: `System prompt version ${input.versionLabel} saved successfully.`,
    };
  }
);
