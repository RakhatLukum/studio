'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { practiceInterview, type PracticeInterviewOutput } from '@/ai/flows/practice-interview-flow';
import { Loader2, Send, Bot, Lightbulb, User } from 'lucide-react';
import MarkdownPreview from '@/components/MarkdownPreview';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant' | 'feedback';
  content: string;
};

export default function InterviewPrepPage() {
  const [jobRole, setJobRole] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Interview Prep</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Practice your interview skills with an AI. Get instant feedback on your answers.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {!currentQuestion && history.length === 0 && (
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
                  {loading && <Loader2 className="animate-spin" />}
                  {!loading && "Start"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mock Interview: {jobRole}</CardTitle>
                <CardDescription>Answer the questions below.</CardDescription>
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
                placeholder="Type your answer here..."
                className="min-h-[150px]"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={loading}
              />
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
}