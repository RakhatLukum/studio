
'use server';

/**
 * @fileOverview An AI agent that creates a personal development plan for a student.
 *
 * - createDevelopmentPlan - A function that generates a 3-month development plan.
 * - CreateDevelopmentPlanInput - The input type for the createDevelopmentPlan function.
 * - CreateDevelopmentPlanOutput - The return type for the createDevelopmentPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateDevelopmentPlanInputSchema = z.object({
  careerName: z.string().describe('The career path for which to generate a development plan.'),
});
export type CreateDevelopmentPlanInput = z.infer<typeof CreateDevelopmentPlanInputSchema>;

const CreateDevelopmentPlanOutputSchema = z.object({
    developmentPlanMd: z.string().describe('A 3-month personal development plan in Markdown format. It should be structured by month and include key skills to learn, project ideas, and specific Google courses or certificates to pursue.'),
});
export type CreateDevelopmentPlanOutput = z.infer<typeof CreateDevelopmentPlanOutputSchema>;

export async function createDevelopmentPlan(input: CreateDevelopmentPlanInput): Promise<CreateDevelopmentPlanOutput> {
  return createDevelopmentPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createDevelopmentPlanPrompt',
  input: { schema: CreateDevelopmentPlanInputSchema },
  output: { schema: CreateDevelopmentPlanOutputSchema },
  prompt: `You are an expert career coach creating a plan for a student interested in pursuing a career as a {{{careerName}}}.
Your task is to generate a concise, actionable 3-month personal development plan.

The plan should be structured in Markdown format with the following sections for each month:
- ## Month 1: Foundational Skills
- ## Month 2: Practical Application
- ## Month 3: Specialization and Portfolio Building

For each month, include:
- **Key Skills:** A bulleted list of 3-4 essential skills to focus on.
- **Project Idea:** A simple, practical project idea to apply the learned skills.
- **Google Resources:** A bulleted list of 1-2 highly relevant courses, certificates, or learning materials from Google. You MUST include a valid, clickable markdown link (e.g., [Course Name](https://...)) for each resource (e.g., Google Career Certificates on Coursera, Google Skillshop, Google Codelabs).

Keep the descriptions brief and to the point. The output must be a single Markdown string.

CAREER: {{{careerName}}}

Generate the 3-month development plan now.
`,
});

const createDevelopmentPlanFlow = ai.defineFlow(
  {
    name: 'createDevelopmentPlanFlow',
    inputSchema: CreateDevelopmentPlanInputSchema,
    outputSchema: CreateDevelopmentPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
