
"use client";

import { useState } from 'react';
import PromptLabForm from '@/components/PromptLabForm';
import PromptVersionList from '@/components/PromptVersionList';
import { useAuth } from '@/context/AuthContext';

export default function PromptLabPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  const handlePromptSaved = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prompt Lab</h1>
        <p className="text-muted-foreground">Experiment with and save different system prompts for the AI.</p>
      </div>
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <PromptLabForm onPromptSaved={handlePromptSaved} />
          </div>
          <div className="md:col-span-2">
            <PromptVersionList key={refreshKey} />
          </div>
        </div>
      ) : (
         <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-semibold">Sign in to get started</h2>
            <p className="text-muted-foreground mt-2">
                Please sign in to experiment with and save new prompt versions.
            </p>
        </div>
      )}
    </div>
  );
}
