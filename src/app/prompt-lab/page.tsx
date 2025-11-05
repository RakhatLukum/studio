
"use client";

import { useState } from 'react';
import PromptLabForm from '@/components/PromptLabForm';
import PromptVersionList from '@/components/PromptVersionList';
import { useUser } from '@/firebase';
import Link from 'next/link';


export default function PromptLabPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || user.isAnonymous) {
      return (
          <div className="container mx-auto px-4 py-8 sm:py-12">
               <div className="text-center py-16 border-dashed border-2 rounded-lg">
                  <h2 className="text-xl font-semibold">Please Sign In</h2>
                  <p className="text-muted-foreground mt-2">
                      You need to have an account to use the Prompt Lab.
                  </p>
                  <Link href="/login" className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">
                      Sign In
                  </Link>
              </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prompt Lab</h1>
        <p className="text-muted-foreground">Experiment with and save different system prompts for the AI.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <PromptLabForm onPromptSaved={() => setRefreshKey(prev => prev + 1)} />
        <PromptVersionList key={refreshKey} />
      </div>
    </div>
  );
}
