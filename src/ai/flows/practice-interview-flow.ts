'use server';

/**
 * @fileOverview An AI agent that simulates a job interview.
 *
 * - practiceInterview - A function that provides an interview question and feedback on the user's answer.
 * - PracticeInterviewInput - The input type for the practiceInterview function.
 * - PracticeInterviewOutput - The return type for the practiceInterview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PracticeInterviewInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is interviewing for.'),
  question: z.string().describe('The current interview question the user is answering. Use "START" for the first question.'),
  answer: z.string().optional().describe('The user\'s answer to the current question.'),
  chatHistory: z.string().optional().describe('The history of the conversation so far.'),
});
export type PracticeInterviewInput = z.infer<typeof PracticeInterviewInputSchema>;

const PracticeInterviewOutputSchema = z.object({
  feedback: z.string().describe('Constructive feedback on the user\'s answer, including soft-skills analysis (clarity, confidence, STAR method) and tips for improvement. If it\'s the first question, this should be an empty string.'),
  nextQuestion: z.string().describe('The next logical interview question based on the job role and conversation history.'),
});
export type PracticeInterviewOutput = z.infer<typeof PracticeInterviewOutputSchema>;

export async function practiceInterview(input: PracticeInterviewInput): Promise<PracticeInterviewOutput> {
  return practiceInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'practiceInterviewPrompt',
  input: { schema: PracticeInterviewInputSchema },
  output: { schema: PracticeInterviewOutputSchema },
  prompt: `You are an expert interviewer conducting a mock interview for a student.

Job Role: {{{jobRole}}}

Conversation History:
{{{chatHistory}}}

Current Question: {{{question}}}
User's Answer: {{{answer}}}

INSTRUCTIONS:
1.  If the 'question' is "START", this is the beginning of the interview. Do not provide feedback. Generate a relevant opening question (e.g., "Tell me about yourself" or a question about their interest in the role).
2.  If there is a user 'answer', provide constructive feedback. This feedback must analyze the answer for:
    - **Clarity and Conciseness:** Was the answer easy to understand?
    - **Relevance:** Did the answer directly address the question?
    - **Structure (STAR method):** Did the user effectively describe the Situation, Task, Action, and Result?
    - **Impact:** Did the user quantify their achievements?
    - **Soft Skills:** Assess the tone for confidence and professionalism.
    Your feedback should be in Markdown format, with bullet points for each area of analysis.
3.  After providing feedback (or if it's the first question), generate the *next* logical interview question. The questions should follow a natural interview progression.
4.  Do not repeat questions that are already in the chat history.

Generate your response now.
`,
});

const practiceInterviewFlow = ai.defineFlow(
  {
    name: 'practiceInterviewFlow',
    inputSchema: PracticeInterviewInputSchema,
    outputSchema: PracticeInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
