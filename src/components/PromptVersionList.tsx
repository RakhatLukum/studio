
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Prompt } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

type PromptVersionListProps = {
    key?: number;
}

export default function PromptVersionList({ key }: PromptVersionListProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const promptsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'prompts'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user, key]);

  const { data: versions, isLoading } = useCollection<Prompt>(promptsQuery);
  
  const ListSkeleton = () => (
      <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </CardContent>
            </Card>
        ))}
      </div>
  )

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Versions</CardTitle>
                <CardDescription>Your last 5 saved prompt versions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ListSkeleton />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Versions</CardTitle>
        <CardDescription>Your last 5 saved prompt versions.</CardDescription>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No prompt versions saved yet.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {versions.map((version) => (
              <AccordionItem value={version.id} key={version.id} className="border rounded-md px-4">
                <AccordionTrigger className="py-4 hover:no-underline">
                    <div className='flex flex-col items-start text-left gap-1'>
                        <p className="font-semibold text-primary">{version.versionLabel}</p>
                        <p className="text-xs text-muted-foreground">
                            {version.createdAt && formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-48 w-full rounded-md border bg-muted/50 p-4">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{version.promptText}</pre>
                    </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
