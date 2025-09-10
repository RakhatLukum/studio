
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import type { PromptVersion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

type PromptVersionListProps = {
    key?: number;
}

export default function PromptVersionList({ key }: PromptVersionListProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchVersions = async () => {
        setLoading(true);
        try {
          const versionsRef = collection(db, 'promptVersions');
          const q = query(
            versionsRef,
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const querySnapshot = await getDocs(q);
          const userVersions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromptVersion));
          setVersions(userVersions);
        } catch (error) {
          console.error("Error fetching prompt versions:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVersions();
    } else {
        setLoading(false);
    }
  }, [user, key]);
  
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

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Versions</CardTitle>
                <CardDescription>Your last 3 saved prompt versions.</CardDescription>
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
        <CardDescription>Your last 3 saved prompt versions.</CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No prompt versions saved yet.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {versions.map((version) => (
              <AccordionItem value={version.id} key={version.id} className="border rounded-md px-4">
                <AccordionTrigger className="py-4 hover:no-underline">
                    <div className='flex flex-col items-start text-left gap-1'>
                        <p className="font-semibold text-primary">{version.versionLabel}</p>
                        <p className="text-xs text-muted-foreground">
                            {version.createdAt && formatDistanceToNow(version.createdAt.toDate(), { addSuffix: true })}
                        </p>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-48 w-full rounded-md border bg-muted/50 p-4">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{version.systemPrompt}</pre>
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
