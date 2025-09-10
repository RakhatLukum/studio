"use client";

import { Copy, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { TailorResumeOutput } from '@/ai/flows/tailor-resume-to-job-description';
import MarkdownPreview from './MarkdownPreview';

type TailorResultProps = {
  result: TailorResumeOutput | null;
  loading: boolean;
  onSave: () => void;
};

export default function TailorResult({ result, loading, onSave }: TailorResultProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (result?.tailoredMd) {
      navigator.clipboard.writeText(result.tailoredMd);
      toast({
        title: 'Copied to clipboard!',
        description: 'The tailored resume has been copied.',
      });
    }
  };

  const ResultSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="pt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );

  const scoreColor = (score: number) => {
    if (score > 75) return 'bg-green-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Tailored Resume</CardTitle>
        <CardDescription>Here are the results. Review, copy, or save to your history.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[600px]">
        {loading ? <ResultSkeleton /> : (
          result ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Match Score</h3>
                  <span className={`text-xl font-bold ${scoreColor(result.matchScore).replace('bg-','text-')}`}>{Math.round(result.matchScore)}%</span>
                </div>
                <Progress value={result.matchScore} className="h-3 [&>div]:bg-primary" />
              </div>

              <Tabs defaultValue="resume" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
                  <TabsTrigger value="changes">Change Log</TabsTrigger>
                  <TabsTrigger value="rationale">Rationale</TabsTrigger>
                </TabsList>
                <TabsContent value="resume" className="mt-4 p-4 border rounded-md min-h-[300px] bg-muted/20">
                    <MarkdownPreview content={result.tailoredMd} />
                </TabsContent>
                <TabsContent value="changes" className="mt-4 p-4 border rounded-md min-h-[300px] bg-muted/20">
                  <ul className="space-y-2 list-disc pl-5">
                    {result.changeLog.map((change, index) => (
                      <li key={index} className="text-sm">{change}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="rationale" className="mt-4 p-4 border rounded-md min-h-[300px] bg-muted/20">
                  <p className="text-sm italic text-muted-foreground">{result.scoreRationale}</p>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-4 pt-4">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button onClick={onSave} variant="outline" className="flex-1">
                  <Save className="mr-2 h-4 w-4" /> Save to History
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4" />
              <p>Your tailored resume results will appear here.</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
