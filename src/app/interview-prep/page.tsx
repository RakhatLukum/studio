
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { practiceInterview } from '@/ai/flows/practice-interview-flow';
import { summarizeInterview } from '@/ai/flows/summarize-interview-flow';
import { Loader2, Send, Bot, Lightbulb, User, Save, Mic, MicOff, Download } from 'lucide-react';
import MarkdownPreview from '@/components/MarkdownPreview';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateDocx } from '@/lib/docx-generator';
import jsPDF from 'jspdf';


type Message = {
  role: 'user' | 'assistant' | 'feedback';
  content: string;
};

// SpeechRecognition type definition for browser compatibility
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function InterviewPrepPage() {
  const [jobRole, setJobRole] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);


  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setCurrentAnswer(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({ title: 'Speech Recognition Error', description: `Error: ${event.error}. Please try again.`, variant: 'destructive'});
        setIsRecording(false);
      };
    }
  }, [toast]);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole) {
      toast({
        title: 'Job Role Required',
        description: 'Please enter a job role to start the interview.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setHistory([]);
    setCurrentQuestion('');
    try {
      const result = await practiceInterview({ jobRole, question: 'START', answer: '' });
      setCurrentQuestion(result.nextQuestion);
      setHistory([{ role: 'assistant', content: result.nextQuestion }]);
      setIsInterviewStarted(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to start the interview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    if (!currentAnswer) return;

    setLoading(true);
    const newHistory: Message[] = [...history, { role: 'user', content: currentAnswer }];
    setHistory(newHistory);
    setCurrentAnswer('');

    try {
      const result = await practiceInterview({
        jobRole,
        question: currentQuestion,
        answer: currentAnswer,
        chatHistory: history.map(m => `${m.role}: ${m.content}`).join('\n'),
      });
      
      const finalHistory: Message[] = [
        ...newHistory,
        { role: 'feedback', content: result.feedback },
        { role: 'assistant', content: result.nextQuestion }
      ];
      setHistory(finalHistory);
      setCurrentQuestion(result.nextQuestion);

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to get feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveInterview = async () => {
      if (!user || !firestore || history.length === 0) {
          toast({ title: 'Cannot Save', description: 'You must be logged in and have an active interview.', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      setIsSummaryLoading(true);
      setIsSummaryDialogOpen(true);
      setSummaryContent('');

      try {
        const { summary } = await summarizeInterview({ jobRole, chatHistory: JSON.stringify(history) });
        setSummaryContent(summary);
        
        const historyRef = collection(firestore, 'users', user.uid, 'history');
        await addDocumentNonBlocking(historyRef, {
            type: 'interview',
            userId: user.uid,
            jobRole,
            chatHistory: history,
            summary,
            createdAt: serverTimestamp(),
        });

        toast({ title: 'Interview Saved & Summarized', description: 'Your interview session has been saved to your history.'});
        
        // Reset state after closing dialog
        // setHistory([]);
        // setCurrentQuestion('');
        // setJobRole('');
        // setIsInterviewStarted(false);

      } catch (error) {
          console.error('Error saving interview:', error);
          toast({ title: 'Save Failed', description: 'Could not save the interview session.', variant: 'destructive' });
          setIsSummaryDialogOpen(false);
      } finally {
          setIsSaving(false);
          setIsSummaryLoading(false);
      }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
        toast({ title: 'Not Supported', description: 'Speech recognition is not supported in your browser.', variant: 'destructive'});
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setCurrentAnswer('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleCloseSummaryDialog = () => {
    setIsSummaryDialogOpen(false);
    setHistory([]);
    setCurrentQuestion('');
    setJobRole('');
    setIsInterviewStarted(false);
  }

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
    if (summaryContent) {
      generateDocx(summaryContent);
      toast({
        title: 'Downloading DOCX...',
        description: 'Your DOCX file is being generated.',
      });
    }
  };
  
  const handleDownloadPdf = () => {
    if (summaryContent) {
      const pdf = generatePdf(summaryContent);
      pdf.save("interview-summary.pdf");
      toast({
        title: 'Downloading PDF...',
        description: 'Your PDF file is being generated.',
      });
    }
  };


  const Skeleton = () => (
    <div className="flex items-start gap-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
        <Bot />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
  
  const PlanSkeleton = () => (
    <div className="space-y-6">
       <div className="space-y-2">
        <div className="h-6 w-1/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
      </div>
       <div className="space-y-2">
        <div className="h-6 w-1/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
      </div>
       <div className="space-y-2">
        <div className="h-6 w-1/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  )

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Interview Prep</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Practice your interview skills with an AI. Get instant feedback on your answers.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          {!isInterviewStarted && (
            <Card>
              <CardHeader>
                <CardTitle>Start Your Mock Interview</CardTitle>
                <CardDescription>Enter the job role you want to practice for.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartInterview} className="flex gap-4">
                  <Input
                    placeholder="e.g., Software Engineer, Product Manager..."
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !jobRole}>
                    {loading ? <Loader2 className="animate-spin" /> : "Start"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isInterviewStarted && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Mock Interview: {jobRole}</CardTitle>
                    <CardDescription>Answer the questions below.</CardDescription>
                  </div>
                  {user && (
                      <Button variant="outline" size="sm" onClick={handleSaveInterview} disabled={isSaving || loading}>
                          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                          Save & End
                      </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6 max-h-[50vh] overflow-y-auto p-4">
                  {history.map((msg, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`grid h-10 w-10 place-items-center rounded-full ${msg.role === 'user' ? 'bg-secondary' : 'bg-muted'}`}>
                        {msg.role === 'user' ? <User /> : (msg.role === 'feedback' ? <Lightbulb className="text-accent" /> : <Bot />)}
                      </div>
                      <div className="flex-1 rounded-lg p-4 bg-background border">
                        <MarkdownPreview content={msg.content} />
                      </div>
                    </div>
                  ))}
                  {loading && <Skeleton />}
                </CardContent>
              </Card>

              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <Textarea
                  placeholder="Click the mic to record or type your answer here..."
                  className="min-h-[150px]"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={loading}
                />
                <div className="flex gap-4">
                    <Button type="button" variant={isRecording ? 'destructive' : 'outline'} size="icon" onClick={toggleRecording} disabled={loading}>
                        {isRecording ? <MicOff /> : <Mic />}
                    </Button>
                    <Button type="submit" className="w-full" disabled={loading || !currentAnswer}>
                        {loading ? (
                        <>
                            <Loader2 className="animate-spin" /> Analyzing...
                        </>
                        ) : (
                        <>
                            <Send /> Submit Answer
                        </>
                        )}
                    </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isSummaryDialogOpen} onOpenChange={handleCloseSummaryDialog}>
        <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
            <DialogTitle>Interview Summary: {jobRole}</DialogTitle>
            <DialogDescription>Here is your performance report and recommendations.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
          {isSummaryLoading ? <PlanSkeleton /> : (
            summaryContent && <MarkdownPreview content={summaryContent} />
          )}
        </div>
        <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={handleDownloadDocx} disabled={isSummaryLoading || !summaryContent}>
                <Download className="mr-2 h-4 w-4" /> DOCX
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isSummaryLoading || !summaryContent}>
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={handleCloseSummaryDialog}>Close</Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
