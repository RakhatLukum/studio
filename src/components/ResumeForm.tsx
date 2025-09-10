"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type React from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  resumeText: z.string().min(100, { message: 'Resume must be at least 100 characters.' }),
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters.' }),
  language: z.enum(['en', 'ru', 'kz']),
});

type ResumeFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  loading: boolean;
};

export default function ResumeForm({ onSubmit, loading }: ResumeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
      jobDescription: '',
      language: 'en',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' && file.size <= 10000) { // 10KB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          form.setValue('resumeText', text);
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a .txt file smaller than 10KB.",
          variant: "destructive"
        })
      }
    }
    event.target.value = ''; // Reset file input
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resume Details</CardTitle>
        <CardDescription>Enter your resume and the job description to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Your Resume</FormLabel>
                    <Button asChild variant="outline" size="sm">
                      <Label>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload .txt
                        <input type="file" accept=".txt" className="sr-only" onChange={handleFileChange} />
                      </Label>
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Paste your resume here..." className="min-h-[250px] resize-y" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the job description here..." className="min-h-[200px] resize-y" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="en" />
                        </FormControl>
                        <FormLabel className="font-normal">English</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ru" />
                        </FormControl>
                        <FormLabel className="font-normal">Russian</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="kz" />
                        </FormControl>
                        <FormLabel className="font-normal">Kazakh</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Tailoring...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tailor Resume
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
