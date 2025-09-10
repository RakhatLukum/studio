// src/ai/flows/resume-match-score-flow.ts
'use server';

/**
 * @fileOverview An AI agent that provides a match score between a resume and a job description, along with a rationale.
 *
 * - resumeMatchScore - A function that calculates the match score and provides a rationale.
 * - ResumeMatchScoreInput - The input type for the resumeMatchScore function.
 * - ResumeMatchScoreOutput - The return type for the resumeMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeMatchScoreInputSchema = z.object({
  resumeText: z.string().describe('The text of the resume to be evaluated.'),
  jobDescription: z.string().describe('The job description to match against the resume.'),
  language:	z.string().default('en').describe('The language of the resume and job description.'),
});
export type ResumeMatchScoreInput = z.infer<typeof ResumeMatchScoreInputSchema>;

const ResumeMatchScoreOutputSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score (0-100) indicating how well the resume matches the job description.'),
  scoreRationale: z
    .string()
    .describe('A brief rationale for the match score, explaining strengths and gaps.'),
});
export type ResumeMatchScoreOutput = z.infer<typeof ResumeMatchScoreOutputSchema>;

export async function resumeMatchScore(
  input: ResumeMatchScoreInput
): Promise<ResumeMatchScoreOutput> {
  return resumeMatchScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeMatchScorePrompt',
  input: {schema: ResumeMatchScoreInputSchema},
  output: {schema: ResumeMatchScoreOutputSchema},
  prompt: `You are an expert career coach.
Task: Evaluate how well the user's resume matches the target job description.

Output strictly as JSON with these fields:
{
  "match_score": 0-100,
  "score_rationale": "2-4 sentences on strengths/gaps"
}

LANGUAGE: {{{language}}}
JOB DESCRIPTION:
{{{jobDescription}}}

ORIGINAL RESUME:
{{{resumeText}}}

Evaluate now. Give a match score and rationale.`,
});

const resumeMatchScoreFlow = ai.defineFlow(
  {
    name: 'resumeMatchScoreFlow',
    inputSchema: ResumeMatchScoreInputSchema,
    outputSchema: ResumeMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
