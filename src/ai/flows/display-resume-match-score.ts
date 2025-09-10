// src/ai/flows/display-resume-match-score.ts
'use server';

/**
 * @fileOverview A resume tailoring AI agent that provides a match score and rationale.
 *
 * - displayResumeMatchScore - A function that handles the resume tailoring process and returns a match score with rationale.
 * - DisplayResumeMatchScoreInput - The input type for the displayResumeMatchScore function.
 * - DisplayResumeMatchScoreOutput - The return type for the displayResumeMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayResumeMatchScoreInputSchema = z.object({
  resumeText: z.string().describe('The text of the resume to be tailored.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  language: z
    .string()
    .default('en')
    .describe('The language of the resume and job description.'),
});
export type DisplayResumeMatchScoreInput = z.infer<
  typeof DisplayResumeMatchScoreInputSchema
>;

const DisplayResumeMatchScoreOutputSchema = z.object({
  tailoredResumeMd: z
    .string()
    .describe('The tailored resume in Markdown format.'),
  changeLog: z.array(z.string()).describe('A bulleted list of changes made.'),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score (0-100) indicating how well the resume matches the job description.'),
  scoreRationale: z
    .string()
    .describe('A brief rationale for the match score, explaining strengths and gaps.'),
});
export type DisplayResumeMatchScoreOutput = z.infer<
  typeof DisplayResumeMatchScoreOutputSchema
>;

export async function displayResumeMatchScore(
  input: DisplayResumeMatchScoreInput
): Promise<DisplayResumeMatchScoreOutput> {
  return displayResumeMatchScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'displayResumeMatchScorePrompt',
  input: {schema: DisplayResumeMatchScoreInputSchema},
  output: {schema: DisplayResumeMatchScoreOutputSchema},
  prompt: `You are an expert career coach and technical editor.
Task: Rewrite the user's resume to best match the target job description.
Constraints:
- Keep truthful: do NOT fabricate experience, dates, or employers.
- Emphasize relevant hard skills, tools, and impact (metrics if present).
- Remove or downplay irrelevant content.
- Adjust tone for recruiters: concise, bullet-based, action verbs.
Output strictly as JSON with these fields:
{
  "tailored_md": "... (Markdown resume with sections: Summary, Skills, Experience, Projects, Education) ...",
  "change_log": ["...bulleted list of what changed and why..."],
  "match_score": 0-100,
  "score_rationale": "2-4 sentences on strengths/gaps"
}

LANGUAGE: {{{language}}}
JOB DESCRIPTION:
{{{jobDescription}}}

ORIGINAL RESUME:
{{{resumeText}}}

Rewrite now.`,
});

const displayResumeMatchScoreFlow = ai.defineFlow(
  {
    name: 'displayResumeMatchScoreFlow',
    inputSchema: DisplayResumeMatchScoreInputSchema,
    outputSchema: DisplayResumeMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
