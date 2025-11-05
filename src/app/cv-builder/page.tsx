
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createResume, type CreateResumeOutput } from '@/ai/flows/create-resume-flow';
import MarkdownPreview from '@/components/MarkdownPreview';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  dates: z.string().min(1, "Dates are required"),
  description: z.string().min(1, "Description is required"),
});

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School is required"),
  dates: z.string().min(1, "Dates are required"),
});

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().optional(),
});

const cvBuilderSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  linkedin: z.string().optional(),
  professionalSummary: z.string().min(10, "Summary must be at least 10 characters"),
  skills: z.string().min(1, "Please list at least one skill"),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema).optional(),
});

type CvBuilderFormValues = z.infer<typeof cvBuilderSchema>;

export default function CvBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateResumeOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<CvBuilderFormValues>({
    resolver: zodResolver(cvBuilderSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      professionalSummary: '',
      skills: '',
      experience: [{ jobTitle: '', company: '', dates: '', description: '' }],
      education: [{ degree: '', school: '', dates: '' }],
      projects: [],
    },
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });
  
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: 'projects',
  });

  const onSubmit = async (values: CvBuilderFormValues) => {
    setLoading(true);
    setResult(null);
    try {
      const resumeResult = await createResume({
        ...values,
        skills: values.skills.split(',').map(s => s.trim())
      });
      setResult(resumeResult);

       if (user && firestore) {
            const historyRef = collection(firestore, 'users', user.uid, 'history');
            addDocumentNonBlocking(historyRef, {
                type: 'created_resume',
                userId: user.uid,
                formData: values,
                generatedResumeMd: resumeResult.generatedResumeMd,
                createdAt: serverTimestamp(),
            });
        }
      toast({ title: 'Resume Created!', description: 'Your new resume has been generated below.' });
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({ title: 'An error occurred', description: 'Failed to create resume. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">CV Builder</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Fill out the form below, and our AI will generate a professional resume for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Provide the details for your new resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Details */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Personal Details</h3>
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="linkedin" render={({ field }) => (
                        <FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                {/* Professional Summary */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Professional Summary</h3>
                    <FormField control={form.control} name="professionalSummary" render={({ field }) => (
                        <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                {/* Skills */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Skills</h3>
                    <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Input {...field} placeholder="e.g. React, TypeScript, Project Management" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                {/* Experience */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Work Experience</h3>
                  {experienceFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                      <FormField control={form.control} name={`experience.${index}.jobTitle`} render={({ field }) => (
                        <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (
                        <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`experience.${index}.dates`} render={({ field }) => (
                        <FormItem><FormLabel>Dates (e.g., Jan 2022 - Present)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description / Achievements</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExperience(index)}><Trash2 className="text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ jobTitle: '', company: '', dates: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Experience</Button>
                </div>

                {/* Education */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Education</h3>
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                        <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                            <FormItem><FormLabel>Degree / Certificate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`education.${index}.school`} render={({ field }) => (
                            <FormItem><FormLabel>School / Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`education.${index}.dates`} render={({ field }) => (
                            <FormItem><FormLabel>Dates (e.g., Aug 2018 - May 2022)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}><Trash2 className="text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ degree: '', school: '', dates: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Education</Button>
                </div>
                
                {/* Projects */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Projects</h3>
                  {projectFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                        <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => (
                            <FormItem><FormLabel>Project URL (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProject(index)}><Trash2 className="text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendProject({ name: '', description: '', url: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Project</Button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating CV</> : <><Sparkles className="mr-2 h-4 w-4" />Generate CV</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="sticky top-24 h-fit">
          <CardHeader>
            <CardTitle>Generated Resume</CardTitle>
            <CardDescription>Your AI-generated resume will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {loading && <div><Loader2 className="mx-auto my-12 h-10 w-10 animate-spin text-primary" /></div>}
            {!loading && result && (
              <div className="p-4 border rounded-md bg-muted/20 max-h-[70vh] overflow-y-auto">
                <MarkdownPreview content={result.generatedResumeMd} />
              </div>
            )}
            {!loading && !result && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                    <Sparkles className="h-12 w-12 mb-4" />
                    <p>Your generated resume will be shown here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    