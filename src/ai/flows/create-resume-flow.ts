
'use server';

/**
 * @fileOverview An AI agent that creates a resume from scratch based on user-provided information.
 *
 * - createResume - A function that generates a complete resume.
 * - CreateResumeInput - The input type for the createResume function.
 * - CreateResumeOutput - The return type for the createResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExperienceSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  dates: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  degree: z.string(),
  school: z.string(),
  dates: z.string(),
});

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
});

const CreateResumeInputSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string().optional(),
  professionalSummary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
});
export type CreateResumeInput = z.infer<typeof CreateResumeInputSchema>;

const CreateResumeOutputSchema = z.object({
  generatedResumeMd: z.string().describe('The complete resume formatted in Markdown. It should include sections for Contact Information, Summary, Skills, Experience, Education, and Projects (if provided).'),
});
export type CreateResumeOutput = z.infer<typeof CreateResumeOutputSchema>;

export async function createResume(input: CreateResumeInput): Promise<CreateResumeOutput> {
  return createResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createResumePrompt',
  input: { schema: CreateResumeInputSchema },
  output: { schema: CreateResumeOutputSchema },
  prompt: `You are an expert resume writer. Your task is to create a professional, well-formatted resume in Markdown based on the structured information provided by the user.

Follow this structure precisely:
1.  **Contact Information:** At the very top, list the Full Name as a main heading (#), followed by Email, Phone, and LinkedIn profile URL on separate lines.
2.  **Summary:** A section titled "## Summary" containing the professional summary.
3.  **Skills:** A section titled "## Skills" containing a comma-separated list of skills.
4.  **Experience:** (Only if provided) A section titled "## Experience". For each job, create a sub-heading (###) with the Job Title and Company. On the next line, list the dates. Below that, use bullet points for each item in the description.
5.  **Education:** (Only if provided) A section titled "## Education". For each entry, create a sub-heading (###) with the Degree and School. On the next line, list the dates.
6.  **Projects:** (Only if provided) A section titled "## Projects". For each project, create a sub-heading (###) with the Project Name. Below that, use bullet points for the description and include the URL if available.

Ensure the final output is a single Markdown string.

USER INFORMATION:
- Full Name: {{{fullName}}}
- Email: {{{email}}}
- Phone: {{{phone}}}
- LinkedIn: {{{linkedin}}}
- Professional Summary: {{{professionalSummary}}}
- Skills: {{{skills}}}
- Experience:
{{#each experience}}
  - Job Title: {{{this.jobTitle}}}
    Company: {{{this.company}}}
    Dates: {{{this.dates}}}
    Description: {{{this.description}}}
{{/each}}
- Education:
{{#each education}}
  - Degree: {{{this.degree}}}
    School: {{{this.school}}}
    Dates: {{{this.dates}}}
{{/each}}
- Projects:
{{#each projects}}
  - Name: {{{this.name}}}
    Description: {{{this.description}}}
    URL: {{{this.url}}}
{{/each}}

Generate the Markdown resume now.
`,
});

const createResumeFlow = ai.defineFlow(
  {
    name: 'createResumeFlow',
    inputSchema: CreateResumeInputSchema,
    outputSchema: CreateResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
