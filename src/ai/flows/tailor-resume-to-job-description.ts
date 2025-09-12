'use server';

/**
 * @fileOverview A resume tailoring AI agent. It rewrites a resume to match a specific job description, returning the tailored resume, a list of changes, a match score, and a rationale.
 *
 * - tailorResume - A function that handles the resume tailoring process.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resumeText: z.string().describe('The text of the resume to be tailored.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
  language: z
    .string()
    .default('en')
    .describe('The language of the resume and job description.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  tailoredMd: z
    .string()
    .describe(
      'The tailored resume in Markdown format, with sections: Contact Information, Summary, Skills, Experience, Projects, Education.'
    ),
  changeLog: z.array(z.string()).describe('A bulleted list of what changed in the resume and why.'),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0 to 100 indicating how well the resume matches the job description.'),
  scoreRationale: z
    .string()
    .describe('A 2-4 sentence rationale explaining the match score, including strengths and gaps.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert career coach and technical editor.
Task: Rewrite the user\'s resume to best match the target job description.
Constraints:
- Extract contact information (name, email, phone, links) and place it at the top.
- Keep truthful: do NOT fabricate experience, dates, or employers.
- Emphasize relevant hard skills, tools, and impact (metrics if present).
- Remove or downplay irrelevant content.
- Adjust tone for recruiters: concise, bullet-based, action verbs.
Output strictly as JSON with these fields:
{
  "tailored_md": "... (Markdown resume with sections: Contact Information, Summary, Skills, Experience, Projects, Education) ...",
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

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
