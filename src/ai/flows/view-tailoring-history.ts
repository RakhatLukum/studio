// src/ai/flows/view-tailoring-history.ts
'use server';

/**
 * @fileOverview Retrieves the tailoring history for a user.
 *
 * - viewTailoringHistory - A function that retrieves the tailoring history.
 * - ViewTailoringHistoryInput - The input type for the viewTailoringHistory function.
 * - ViewTailoringHistoryOutput - The return type for the viewTailoringHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ViewTailoringHistoryInputSchema = z.object({
  userId: z.string().describe('The ID of the user whose history is being retrieved.'),
});
export type ViewTailoringHistoryInput = z.infer<
  typeof ViewTailoringHistoryInputSchema
>;

const ViewTailoringHistoryOutputSchema = z.array(
  z.object({
    createdAt: z.string().describe('The timestamp of when the tailoring was performed.'),
    language: z.string().describe('The language used for tailoring.'),
    matchScore: z.number().describe('The match score of the tailoring.'),
    resumeText: z.string().describe('The text of the resume used for tailoring.'),
    jobDescription: z.string().describe('The job description used for tailoring.'),
    tailoredResumeMd: z.string().describe('The tailored resume in Markdown format.'),
    changeLog: z.array(z.string()).describe('A bulleted list of changes made.'),
    scoreRationale: z
      .string()
      .describe('A brief rationale for the match score, explaining strengths and gaps.'),
  })
);
export type ViewTailoringHistoryOutput = z.infer<
  typeof ViewTailoringHistoryOutputSchema
>;

export async function viewTailoringHistory(
  input: ViewTailoringHistoryInput
): Promise<ViewTailoringHistoryOutput> {
  return viewTailoringHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'viewTailoringHistoryPrompt',
  input: {schema: ViewTailoringHistoryInputSchema},
  output: {schema: ViewTailoringHistoryOutputSchema},
  prompt: `You are a service that retrieves resume tailoring history for a user.

  Given a user ID, retrieve the last 20 resume tailoring runs from Firestore.  Include the createdAt, language, match score, resume text, job description, tailored resume, change log and score rationale for each run.
  Return the data as a JSON array.
`,
});

const viewTailoringHistoryFlow = ai.defineFlow(
  {
    name: 'viewTailoringHistoryFlow',
    inputSchema: ViewTailoringHistoryInputSchema,
    outputSchema: ViewTailoringHistoryOutputSchema,
  },
  async input => {
    // This is just a placeholder since firestore is not available in this environment.  The real implementation will retrieve data from firestore.
    const dummyData: ViewTailoringHistoryOutput = [
      {
        createdAt: new Date().toISOString(),
        language: 'en',
        matchScore: 75,
        resumeText: 'Dummy resume text',
        jobDescription: 'Dummy job description',
        tailoredResumeMd: 'Dummy tailored resume in markdown',
        changeLog: ['Added more keywords', 'Improved formatting'],
        scoreRationale: 'Good match but needs more experience',
      },
    ];

    return dummyData;
  }
);
