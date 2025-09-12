
"use client";

export default function PromptLabPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prompt Lab</h1>
        <p className="text-muted-foreground">Experiment with and save different system prompts for the AI.</p>
      </div>
       <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold">Feature Disabled</h2>
          <p className="text-muted-foreground mt-2">
              Sign-in functionality has been removed, so the Prompt Lab is not available.
          </p>
      </div>
    </div>
  );
}
