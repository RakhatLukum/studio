
import type { Timestamp } from 'firebase/firestore';

export interface Run {
  id: string;
  uid: string;
  resumeOriginal: string;
  jobDescription: string;
  language: 'en' | 'ru' | 'kz';
  tailoredMd: string;
  changeLog: string[];
  matchScore: number;
  scoreRationale: string;
  promptVersion?: string;
  createdAt: Timestamp;
}

export interface PromptVersion {
  id: string;
  uid: string;
  systemPrompt: string;
  versionLabel: string;
  createdAt: Timestamp;
}
