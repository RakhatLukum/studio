
'use server';

/**
 * @fileOverview An AI agent that summarizes a mock interview session.
 *
 * - summarizeInterview - A function that provides a summary and improvement tips.
 * - SummarizeInterviewInput - The input type for the summarizeInterview function.
 * - SummarizeInterviewOutput - The return type for the summarizeInterview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeInterviewInputSchema = z.object({
  jobRole: z.string().describe('The job role the user interviewed for.'),
  chatHistory: z.string().describe('The JSON string of the entire chat history, including user answers and AI feedback.'),
});
export type SummarizeInterviewInput = z.infer<typeof SummarizeInterviewInputSchema>;

const SummarizeInterviewOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the interview performance in Markdown. It should highlight strengths and provide a bulleted list of the top 3 areas for improvement with actionable advice.'),
});
export type SummarizeInterviewOutput = z.infer<typeof SummarizeInterviewOutputSchema>;

export async function summarizeInterview(input: SummarizeInterviewInput): Promise<SummarizeInterviewOutput> {
  return summarizeInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInterviewPrompt',
  input: { schema: SummarizeInterviewInputSchema },
  output: { schema: SummarizeInterviewOutputSchema },
  prompt: `You are an expert career coach reviewing a mock interview transcript.

Job Role: {{{jobRole}}}

Interview Transcript (JSON):
{{{chatHistory}}}

INSTRUCTIONS:
Your task is to provide a concise, high-level summary of the candidate's performance.
The summary must be in Markdown format and include:
1.  A brief paragraph highlighting the candidate's strengths (e.g., strong technical knowledge, good use of STAR method in some answers).
2.  A bulleted list of the top 3 most critical areas for improvement.
3.  For each improvement area, provide a specific, actionable tip. For example, instead of "be more confident," suggest "try practicing answers in front of a mirror to observe body language and reduce filler words."

Generate the summary now.
`,
});

const summarizeInterviewFlow = ai.defineFlow(
  {
    name: 'summarizeInterviewFlow',
    inputSchema: SummarizeInterviewInputSchema,
    outputSchema: SummarizeInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
