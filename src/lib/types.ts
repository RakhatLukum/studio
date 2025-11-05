
import type { FieldValue } from 'firebase/firestore';

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

export interface Prompt {
  id: string;
  versionLabel: string;
  promptText: string;
  createdAt: FieldValue;
  uid?: string; // Add uid for ownership
}
