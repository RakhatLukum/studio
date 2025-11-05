
'use server';

/**
 * @fileOverview An AI agent that recommends career paths based on user interests.
 *
 * - recommendCareers - A function that suggests careers.
 * - RecommendCareersInput - The input type for the recommendCareers function.
 * - RecommendCareersOutput - The return type for the recommendCareers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendCareersInputSchema = z.object({
  interests: z.string().describe('A description of the user\'s hobbies, passions, and interests.'),
});
export type RecommendCareersInput = z.infer<typeof RecommendCareersInputSchema>;

const RecommendCareersOutputSchema = z.object({
  recommendations: z.array(z.object({
    careerName: z.string().describe('The name of the suggested career path or profession.'),
    rationale: z.string().describe('A detailed, 2-4 sentence explanation of why this career matches the user\'s interests, written in Markdown.'),
  })).describe('A list of 3-5 career recommendations.'),
});
export type RecommendCareersOutput = z.infer<typeof RecommendCareersOutputSchema>;

export async function recommendCareers(input: RecommendCareersInput): Promise<RecommendCareersOutput> {
  return recommendCareersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendCareersPrompt',
  input: { schema: RecommendCareersInputSchema },
  output: { schema: RecommendCareersOutputSchema },
  prompt: `You are an expert career advisor for students.
Your task is to recommend 3-5 potential career paths based on the student's stated interests.
For each recommendation, provide a compelling rationale explaining how it connects to their passions.

USER'S INTERESTS:
{{{interests}}}

Generate the recommendations now.
`,
});

const recommendCareersFlow = ai.defineFlow(
  {
    name: 'recommendCareersFlow',
    inputSchema: RecommendCareersInputSchema,
    outputSchema: RecommendCareersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
