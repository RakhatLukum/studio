
import type { FieldValue, Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  createdAt: FieldValue;
}

export interface TailoredResume {
  id: string;
  userId: string;
  resumeOriginal: string;
  jobDescription: string;
  language: 'en' | 'ru' | 'kz';
  tailoredResumeMd: string;
  changeLog: string[];
  matchScore: number;
  scoreRationale: string;
  promptVersion?: string;
  createdAt: string; // ISO String
}

export interface CreatedResume {
  id: string;
  userId: string;
  formData: any; // Store the form data used to generate the resume
  generatedResumeMd: string;
  createdAt: FieldValue | Timestamp;
}

export interface CareerRecommendation {
    id: string;
    userId: string;
    interests: string;
    recommendations: {
        careerName: string;
        rationale: string;
    }[];
    createdAt: FieldValue | Timestamp;
}

export interface DevelopmentPlan {
    id: string;
    userId: string;
    careerName: string;
    developmentPlanMd: string;
    createdAt: FieldValue | Timestamp;
}

export interface InterviewSession {
    id: string;
    userId: string;
    jobRole: string;
    chatHistory: {
        role: 'user' | 'assistant' | 'feedback';
        content: string;
    }[];
    summary: string;
    createdAt: FieldValue | Timestamp;
}

// Union type for all history items
export type HistoryItem = (
    | ({ type: 'resume' } & TailoredResume)
    | ({ type: 'created_resume' } & CreatedResume)
    | ({ type: 'career' } & CareerRecommendation)
    | ({ type: 'plan' } & DevelopmentPlan)
    | ({ type: 'interview' } & InterviewSession)
) & { createdAt: any }; // Ensure createdAt is available on all for sorting

    