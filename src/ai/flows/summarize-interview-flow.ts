
'use server';

/**
 * @fileOverview An AI agent that summarizes a mock interview session and provides improvement recommendations.
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
  summary: z.string().describe('A comprehensive summary of the interview performance in Markdown. It should highlight strengths, provide a bulleted list of the top 3-4 areas for improvement with actionable advice, and suggest specific online courses with links to address weaknesses.'),
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
Your task is to provide a comprehensive, high-level summary of the candidate's performance in Markdown.
The summary MUST include the following sections:

1.  **Overall Performance:** A brief paragraph highlighting the candidate's strengths (e.g., strong technical knowledge, good use of STAR method in some answers).
2.  **Areas for Improvement:** A bulleted list of the top 3-4 most critical areas for improvement. For each area, provide a specific, actionable tip. For example, instead of "be more confident," suggest "try practicing answers in front of a mirror to observe body language and reduce filler words."
3.  **Recommended Courses:** A section titled "### Recommended Courses to Help You Improve". Based on the identified weaknesses, suggest 2-3 specific online courses. You MUST provide a valid, clickable markdown link for each course. For example, if the user struggled with selling their skills, recommend a course on communication or persuasion from a reputable platform like Coursera, edX, or a Google Certificate. If they struggled with technical questions, recommend a specific technical course.

Generate the detailed summary now.
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
