"use client";

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

import type { TailorResumeOutput } from '@/ai/flows/tailor-resume-to-job-description';
import { tailorResume } from '@/ai/flows/tailor-resume-to-job-description';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import ResumeForm from '@/components/ResumeForm';
import TailorResult from '@/components/TailorResult';
import type { Run } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResumeOutput | null>(null);
  const [formValues, setFormValues] = useState<{ resumeText: string; jobDescription: string; language: 'en' | 'ru' | 'kz' } | null>(null);
  const { toast } = useToast();

  const handleTailor = async (values: {
    resumeText: string;
    jobDescription: string;
    language: 'en' | 'ru' | 'kz';
  }) => {
    setLoading(true);
    setResult(null);
    setFormValues(values);
    try {
      const tailoredResult = await tailorResume(values);
      setResult(tailoredResult);
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to tailor resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user) {
        toast({
            title: 'Sign in Required',
            description: 'You must be signed in to save your results to history.',
            variant: 'destructive',
        });
        return;
    }
    if (!result || !formValues) return;

    try {
      const runData: Omit<Run, 'id' | 'createdAt'> = {
        uid: user.uid,
        resumeOriginal: formValues.resumeText,
        jobDescription: formValues.jobDescription,
        language: formValues.language,
        tailoredMd: result.tailoredMd,
        changeLog: result.changeLog,
        matchScore: result.matchScore,
        scoreRationale: result.scoreRationale,
        promptVersion: 'default',
      };

      await addDoc(collection(db, 'runs'), {
        ...runData,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Saved to History',
        description: 'Your tailored resume has been saved.',
      });
    } catch (error) {
      console.error('Error saving to history:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the result to your history.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Welcome to AI Resume Tailor</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Get started by pasting your resume and a job description below.
            </p>
        </div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResumeForm onSubmit={handleTailor} loading={loading} />
            <TailorResult result={result} loading={loading} onSave={handleSaveToHistory} user={user} />
        </div>
    </div>
  );
}
