
"use client";

import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { TailoredResume } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import MarkdownPreview from './MarkdownPreview';

export default function HistoryList() {
  const { user } = useUser();
  const firestore = useFirestore();

  const runsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'tailoredResumes'), 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
  }, [firestore, user]);
  
  const { data: runs, isLoading } = useCollection<TailoredResume>(runsQuery);


  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Please sign in to view your history.</p>;
  }

  if (!runs || runs.length === 0) {
    return <p className="text-center text-muted-foreground">You have no saved runs yet.</p>;
  }
  
  const scoreColor = (score: number) => {
    if (score > 75) return 'bg-primary/10 text-primary border-primary/20';
    if (score > 50) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {runs.map((run) => (
        <AccordionItem value={run.id} key={run.id} className="border-none">
           <Card>
            <AccordionTrigger className="p-6 text-left hover:no-underline">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                <div className='flex-1'>
                  <p className="font-semibold text-primary truncate">{run.jobDescription.split('\n')[0]}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {run.createdAt && formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`font-mono ${scoreColor(run.matchScore)}`}>{Math.round(run.matchScore)}%</Badge>
                    <Badge variant="secondary">{run.language.toUpperCase()}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
               <div className="space-y-6">
                 <div>
                   <h4 className="font-semibold mb-2">Tailored Resume</h4>
                   <div className="p-4 border rounded-md bg-background max-h-96 overflow-y-auto">
                    <MarkdownPreview content={run.tailoredResumeMd} />
                   </div>
                 </div>
                 <div>
                   <h4 className="font-semibold mb-2">Score Rationale</h4>
                   <p className="text-sm text-muted-foreground italic p-4 border rounded-md bg-background">{run.scoreRationale}</p>
                 </div>
               </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
