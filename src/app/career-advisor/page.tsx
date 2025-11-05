
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { recommendCareers, type RecommendCareersOutput } from '@/ai/flows/recommend-careers-flow';
import { createDevelopmentPlan, type CreateDevelopmentPlanOutput } from '@/ai/flows/create-development-plan-flow';
import { findLocalOpportunities, type FindLocalOpportunitiesOutput } from '@/ai/flows/find-local-opportunities-flow';
import { Sparkles, ClipboardList, MapPin, Loader2, Search } from 'lucide-react';
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
  
  const [opportunities, setOpportunities] = useState<FindLocalOpportunitiesOutput | null>(null);
  const [isOpportunitiesLoading, setIsOpportunitiesLoading] = useState(false);

  const [selectedCareer, setSelectedCareer] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState({ plan: false, opportunities: false });

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
    setIsDialogOpen(prev => ({...prev, plan: true}));
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
        setIsDialogOpen(prev => ({...prev, plan: false}));
    } finally {
        setIsPlanLoading(false);
    }
  }

  const handleFindOpportunities = (careerName: string) => {
    setSelectedCareer(careerName);
    setOpportunities(null);
    setIsDialogOpen(prev => ({...prev, opportunities: true}));
    setIsOpportunitiesLoading(true);
    
    if (!navigator.geolocation) {
        toast({ title: "Geolocation not supported", description: "Your browser doesn't support Geolocation.", variant: 'destructive'});
        setIsOpportunitiesLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const opportunitiesResult = await findLocalOpportunities({
                careerName,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setOpportunities(opportunitiesResult);
        } catch (error) {
            console.error('Error finding opportunities:', error);
            toast({ title: 'Error finding opportunities', description: 'Could not fetch local opportunities.', variant: 'destructive'});
        } finally {
            setIsOpportunitiesLoading(false);
        }
    }, (error) => {
        console.error('Geolocation error:', error);
        toast({ title: "Location Error", description: "Could not get your location. Please allow location access.", variant: 'destructive'});
        setIsOpportunitiesLoading(false);
        setIsDialogOpen(prev => ({...prev, opportunities: false}));
    });
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

  const OpportunitiesSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
                <div className="h-5 w-2/3 rounded-md bg-muted animate-pulse mb-2" />
                <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded-md bg-muted animate-pulse mt-1" />
            </div>
        ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Career Advisor</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Discover career paths that align with your passions and get a plan to achieve them.
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Recommend Careers
                  </>
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
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Dialog open={isDialogOpen.plan && selectedCareer === rec.careerName} onOpenChange={(open) => setIsDialogOpen(p => ({...p, plan: open}))}>
                                  <DialogTrigger asChild>
                                      <Button variant="secondary" size="sm" onClick={() => handleCreatePlan(rec.careerName)}>
                                          <ClipboardList className="mr-2 h-4 w-4" />
                                          Dev Plan
                                      </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                      <DialogTitle>3-Month Development Plan: {selectedCareer}</DialogTitle>
                                      <DialogDescription>A suggested plan to get you started on your path.</DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                                    {isPlanLoading ? <PlanSkeleton /> : (
                                      plan && <MarkdownPreview content={plan.developmentPlanMd} />
                                    )}
                                  </div>
                                  </DialogContent>
                              </Dialog>
                              
                              <Dialog open={isDialogOpen.opportunities && selectedCareer === rec.careerName} onOpenChange={(open) => setIsDialogOpen(p => ({...p, opportunities: open}))}>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" size="sm" onClick={() => handleFindOpportunities(rec.careerName)}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Find Internships
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                      <DialogTitle>Local Opportunities: {selectedCareer}</DialogTitle>
                                      <DialogDescription>Internships and companies near you.</DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                                    {isOpportunitiesLoading ? <OpportunitiesSkeleton /> : (
                                      opportunities && (
                                        opportunities.opportunities.length > 0 ? (
                                          <div className="space-y-4">
                                            {opportunities.opportunities.map((opp, i) => (
                                                <Card key={i} className="p-4">
                                                  <a href={opp.website} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">{opp.name}</a>
                                                  <p className="text-sm text-muted-foreground">{opp.address}</p>
                                                  {opp.rating && <p className="text-sm text-muted-foreground">Rating: {opp.rating} / 5</p>}
                                                </Card>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center text-muted-foreground py-8">
                                            <Search className="h-10 w-10 mx-auto mb-2" />
                                            <p>No opportunities found nearby.</p>
                                            <p className="text-xs">Try broadening your career search term.</p>
                                          </div>
                                        )
                                      )
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
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
