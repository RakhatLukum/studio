
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { recommendCareers, type RecommendCareersOutput } from '@/ai/flows/recommend-careers-flow';
import { createDevelopmentPlan, type CreateDevelopmentPlanOutput } from '@/ai/flows/create-development-plan-flow';
import { Sparkles, ClipboardList } from 'lucide-react';
import MarkdownPreview from '@/components/MarkdownPreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';


export default function CareerAdvisorPage() {
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendCareersOutput | null>(null);
  const [plan, setPlan] = useState<CreateDevelopmentPlanOutput | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const careerResult = await recommendCareers({ interests });
      setResult(careerResult);
    } catch (error) {
      console.error('Error recommending careers:', error);
      toast({
        title: 'An error occurred',
        description: 'Failed to recommend careers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (careerName: string) => {
    setIsPlanLoading(true);
    setPlan(null);
    setSelectedCareer(careerName);
    try {
        const planResult = await createDevelopmentPlan({ careerName });
        setPlan(planResult);
    } catch (error) {
        console.error('Error creating development plan:', error);
        toast({
            title: 'An error occurred',
            description: 'Failed to create a development plan. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsPlanLoading(false);
    }
  }

  const ResultSkeleton = () => (
    <div className="space-y-4 mt-6">
      <div className="space-y-2">
        <div className="h-6 w-1/2 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-1/2 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
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
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Career Advisor</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Discover career paths that align with your passions and interests.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Your Interests</CardTitle>
            <CardDescription>
              Describe your hobbies, passions, and what you enjoy doing. The more detail, the better!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="e.g., I love building things with Lego, solving complex puzzles, playing strategy games, and I'm fascinated by space exploration..."
                className="min-h-[200px]"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading || !interests}>
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Recommend Careers'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Suggested Career Paths</CardTitle>
            <CardDescription>Based on your interests, here are a few potential directions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <ResultSkeleton />}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                <Sparkles className="h-12 w-12 mb-4" />
                <p>Your career recommendations will appear here.</p>
              </div>
            )}
            {result && (
                <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                        <Card key={index} className="p-4">
                            <h3 className="font-bold text-lg text-primary">{rec.careerName}</h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                <MarkdownPreview content={rec.rationale} />
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => handleCreatePlan(rec.careerName)}>
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Create Development Plan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>3-Month Development Plan: {selectedCareer}</DialogTitle>
                                    <DialogDescription>
                                    A suggested plan to get you started.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                                  {isPlanLoading ? <PlanSkeleton /> : (
                                    plan && <MarkdownPreview content={plan.developmentPlanMd} />
                                  )}
                                </div>
                                </DialogContent>
                            </Dialog>
                        </Card>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
