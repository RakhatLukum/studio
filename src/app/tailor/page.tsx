
"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { collection, serverTimestamp } from 'firebase/firestore';

import type { TailorResumeOutput } from '@/ai/flows/tailor-resume-to-job-description';
import { tailorResume } from '@/ai/flows/tailor-resume-to-job-description';
import ResumeForm from '@/components/ResumeForm';
import TailorResult from '@/components/TailorResult';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';

export default function TailorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResumeOutput | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleTailor = async (values: {
    resumeText: string;
    jobDescription: string;
    language: 'en' | 'ru' | 'kz';
  }) => {
    setLoading(true);
    setResult(null);
    try {
      const tailoredResult = await tailorResume(values);
      setResult(tailoredResult);

      if (user && firestore) {
        const historyRef = collection(firestore, 'users', user.uid, 'history');
        addDocumentNonBlocking(historyRef, {
          type: 'resume',
          userId: user.uid,
          resumeOriginal: values.resumeText,
          jobDescription: values.jobDescription,
          language: values.language,
          tailoredResumeMd: tailoredResult.tailoredMd,
          changeLog: tailoredResult.changeLog,
          matchScore: tailoredResult.matchScore,
          scoreRationale: tailoredResult.scoreRationale,
          createdAt: serverTimestamp(),
          promptVersion: 'default' // Placeholder
        });
      }

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

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Resume Tailor</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Get started by pasting your resume and a job description below.
            </p>
        </div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResumeForm onSubmit={handleTailor} loading={loading} />
            <TailorResult result={result} loading={loading} />
        </div>
    </div>
  );
}

    