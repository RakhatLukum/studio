"use client";

import type { User } from 'firebase/auth';
import { Copy, Download, Save, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { TailorResumeOutput } from '@/ai/flows/tailor-resume-to-job-description';
import { generateDocx } from '@/lib/docx-generator';
import MarkdownPreview from './MarkdownPreview';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TailorResultProps = {
  result: TailorResumeOutput | null;
  loading: boolean;
  onSave: () => void;
  user: User | null;
};

export default function TailorResult({ result, loading, onSave, user }: TailorResultProps) {
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
    if (result?.tailoredMd) {
      generateDocx(result.tailoredMd);
      toast({
        title: 'Downloading DOCX...',
        description: 'Your DOCX file is being generated.',
      });
    }
  };
  
  const handleDownloadPdf = () => {
    if (result?.tailoredMd) {
      const pdf = generatePdf(result.tailoredMd);
      pdf.save("tailored-resume.pdf");
      toast({
        title: 'Downloading PDF...',
        description: 'Your PDF file is being generated.',
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

  const scoreTextColor = (score: number) => {
    if (score > 75) return 'text-primary';
    if (score > 50) return 'text-accent';
    return 'text-destructive';
  }

  const progressColor = (score: number) => {
    if (score > 75) return '[&>div]:bg-primary';
    if (score > 50) return '[&>div]:bg-accent';
    return '[&>div]:bg-destructive';
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
                  <span className={`text-xl font-bold ${scoreTextColor(result.matchScore)}`}>{Math.round(result.matchScore)}%</span>
                </div>
                <Progress value={result.matchScore} className={`h-3 ${progressColor(result.matchScore)}`} />
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
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={handleCopy} variant="secondary" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="flex-1">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={handleDownloadDocx}>
                      Download as DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPdf}>
                      Download as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={onSave} variant="outline" className="flex-1" disabled={!user}>
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