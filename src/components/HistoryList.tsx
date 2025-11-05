
"use client";

import { useMemo } from 'react';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { HistoryItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import MarkdownPreview from './MarkdownPreview';
import { Bot, Briefcase, ClipboardList, FileText, Lightbulb, User, FilePlus, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateDocx } from '@/lib/docx-generator';
import jsPDF from 'jspdf';

const formatDate = (date: Timestamp | string | Date) => {
    if (!date) return '';
    if (date instanceof Timestamp) {
        return formatDistanceToNow(date.toDate(), { addSuffix: true });
    }
    // Handle Firestore serverTimestamp which might be null initially
    if (typeof date === 'object' && date !== null && 'toDate' in date) {
        return formatDistanceToNow((date as Timestamp).toDate(), { addSuffix: true });
    }
    try {
        const d = new Date(date as any);
        if (isNaN(d.getTime())) return 'Just now'; // Fallback for invalid date
        return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
        return 'Just now';
    }
}

const ResumeHistoryItem = ({ item }: { item: Extract<HistoryItem, { type: 'resume' }> }) => (
    <>
        <div className='flex-1'>
            <p className="font-semibold text-primary truncate">{item.jobDescription.split('\n')[0]}</p>
            <p className="text-sm text-muted-foreground mt-1">
                {formatDate(item.createdAt)}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <Badge variant="outline" className={`font-mono`}>{Math.round(item.matchScore)}%</Badge>
            <Badge variant="secondary">{item.language.toUpperCase()}</Badge>
        </div>
    </>
);

const CreatedResumeHistoryItem = ({ item }: { item: Extract<HistoryItem, { type: 'created_resume' }> }) => (
    <>
        <div className='flex-1'>
            <p className="font-semibold text-primary truncate">Created Resume: {item.formData.fullName}</p>
            <p className="text-sm text-muted-foreground mt-1">
                {formatDate(item.createdAt)}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-muted-foreground" />
        </div>
    </>
);

const CareerHistoryItem = ({ item }: { item: Extract<HistoryItem, { type: 'career' }> }) => (
    <>
        <div className='flex-1'>
            <p className="font-semibold text-primary truncate">Career Recommendations</p>
            <p className="text-sm text-muted-foreground mt-1">
                Based on interests: {item.interests.substring(0, 50)}...
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary">{item.recommendations.length} Careers</Badge>
        </div>
    </>
);

const PlanHistoryItem = ({ item }: { item: Extract<HistoryItem, { type: 'plan' }> }) => (
    <>
        <div className='flex-1'>
            <p className="font-semibold text-primary truncate">Development Plan</p>
            <p className="text-sm text-muted-foreground mt-1">
                For career: {item.careerName}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
        </div>
    </>
);

const InterviewHistoryItem = ({ item }: { item: Extract<HistoryItem, { type: 'interview' }> }) => (
     <>
        <div className='flex-1'>
            <p className="font-semibold text-primary truncate">Interview Practice</p>
            <p className="text-sm text-muted-foreground mt-1">
                For role: {item.jobRole}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary">{item.chatHistory.filter(c => c.role === 'user').length} Answers</Badge>
        </div>
    </>
);

const DownloadButtons = ({ content }: { content: string }) => {
    const { toast } = useToast();

    const generatePdf = (markdownContent: string) => {
        const doc = new jsPDF();
        const lines = markdownContent.split('\n');
        let y = 15;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;
    
        const checkPageBreak = (spaceNeeded: number) => {
            if (y + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        }
    
        for (const line of lines) {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
    
            if (line.startsWith('# ')) {
                checkPageBreak(12);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22);
                doc.text(line.substring(2), margin, y);
                y += 12;
            } else if (line.startsWith('## ')) {
                checkPageBreak(10);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text(line.substring(3), margin, y);
                y += 10;
            } else if (line.startsWith('### ')) {
                checkPageBreak(8);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text(line.substring(4), margin, y);
                y += 8;
            } else if (line.startsWith('- ')) {
                checkPageBreak(7);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                const text = `• ${line.substring(2)}`;
                const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - margin * 2 - 5);
                doc.text(splitText, margin + 5, y);
                y += (splitText.length * 7);
            } else if (line.trim() === '') {
                y += 5;
            } else {
                checkPageBreak(7);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                const splitText = doc.splitTextToSize(line, doc.internal.pageSize.width - margin * 2);
                doc.text(splitText, margin, y);
                y += (splitText.length * 7);
            }
        }
        return doc;
    };
      
    const handleDownloadDocx = () => {
        if (content) {
          generateDocx(content);
          toast({
            title: 'Downloading DOCX...',
            description: 'Your DOCX file is being generated.',
          });
        }
    };
      
    const handleDownloadPdf = () => {
        if (content) {
          const pdf = generatePdf(content);
          pdf.save("mansup-report.pdf");
          toast({
            title: 'Downloading PDF...',
            description: 'Your PDF file is being generated.',
          });
        }
    };

    return (
        <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                <Download className="mr-2 h-4 w-4" /> DOCX
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
        </div>
    )
}


export default function HistoryList() {
  const { user } = useUser();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'history'), 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
  }, [firestore, user]);
  
  const { data: historyItems, isLoading } = useCollection<HistoryItem>(historyQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">Please sign in to view your history.</p>;
  }

  if (!historyItems || historyItems.length === 0) {
    return <p className="text-center text-muted-foreground">You have no saved history yet.</p>;
  }
  
  const renderContent = (item: HistoryItem) => {
    switch (item.type) {
        case 'resume':
            return <div className="space-y-6">
                 <div>
                   <h4 className="font-semibold mb-2">Tailored Resume</h4>
                   <div className="p-4 border rounded-md bg-background max-h-96 overflow-y-auto">
                    <MarkdownPreview content={item.tailoredResumeMd} />
                   </div>
                   <DownloadButtons content={item.tailoredResumeMd} />
                 </div>
                 <div>
                   <h4 className="font-semibold mb-2">Score Rationale</h4>
                   <p className="text-sm italic p-4 border rounded-md bg-background">{item.scoreRationale}</p>
                 </div>
               </div>;
        case 'created_resume':
            return <>
                <div className="p-4 border rounded-md bg-background max-h-96 overflow-y-auto">
                    <MarkdownPreview content={item.generatedResumeMd} />
                </div>
                <DownloadButtons content={item.generatedResumeMd} />
            </>;
        case 'career':
            return <div className="space-y-4">
                {item.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-md bg-background">
                        <h4 className="font-bold text-lg text-primary">{rec.careerName}</h4>
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                           <MarkdownPreview content={rec.rationale} />
                        </div>
                    </div>
                ))}
            </div>;
        case 'plan':
            return <>
                <div className="p-4 border rounded-md bg-background max-h-96 overflow-y-auto">
                    <MarkdownPreview content={item.developmentPlanMd} />
                </div>
                <DownloadButtons content={item.developmentPlanMd} />
            </>;
        case 'interview':
             return <div className="space-y-4">
                <div>
                   <h4 className="font-semibold mb-2">Interview Summary & Feedback</h4>
                   <div className="p-4 border rounded-md bg-background">
                        <MarkdownPreview content={item.summary} />
                   </div>
                   <DownloadButtons content={item.summary} />
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Full Transcript</h4>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto p-4 border rounded-md">
                        {item.chatHistory.map((msg, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className={`grid h-10 w-10 place-items-center rounded-full ${msg.role === 'user' ? 'bg-secondary' : 'bg-muted'}`}>
                              {msg.role === 'user' ? <User /> : (msg.role === 'feedback' ? <Lightbulb className="text-accent" /> : <Bot />)}
                            </div>
                            <div className="flex-1 rounded-lg p-4 bg-background border">
                              <MarkdownPreview content={msg.content} />
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
             </div>;
    }
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {historyItems.map((item) => (
        <AccordionItem value={item.id} key={item.id} className="border-none">
           <Card>
            <AccordionTrigger className="p-6 text-left hover:no-underline">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                {item.type === 'resume' && <ResumeHistoryItem item={item} />}
                {item.type === 'created_resume' && <CreatedResumeHistoryItem item={item} />}
                {item.type === 'career' && <CareerHistoryItem item={item} />}
                {item.type === 'plan' && <PlanHistoryItem item={item} />}
                {item.type === 'interview' && <InterviewHistoryItem item={item} />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
               {renderContent(item)}
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
