
"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  systemPrompt: z.string().min(50, { message: 'System prompt must be at least 50 characters.' }),
  versionLabel: z.string().min(3, { message: 'Version label must be at least 3 characters.' }),
});

type PromptLabFormProps = {
  onPromptSaved: () => void;
};

const defaultPrompt = `You are an expert career coach and technical editor.
Task: Rewrite the user's resume to best match the target job description.
Constraints:
- Keep truthful: do NOT fabricate experience, dates, or employers.
- Emphasize relevant hard skills, tools, and impact (metrics if present).
- Remove or downplay irrelevant content.
- Adjust tone for recruiters: concise, bullet-based, action verbs.
Output strictly as JSON with these fields:
{
  "tailored_md": "... (Markdown resume with sections: Summary, Skills, Experience, Projects, Education) ...",
  "change_log": ["...bulleted list of what changed and why..."],
  "match_score": 0-100,
  "score_rationale": "2-4 sentences on strengths/gaps"
}`;

export default function PromptLabForm({ onPromptSaved }: PromptLabFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: defaultPrompt,
      versionLabel: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to save a prompt.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'promptVersions'), {
        uid: user.uid,
        systemPrompt: values.systemPrompt,
        versionLabel: values.versionLabel,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Prompt Saved",
        description: `Version "${values.versionLabel}" has been saved.`,
      });
      form.reset({ systemPrompt: values.systemPrompt, versionLabel: '' });
      onPromptSaved();
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Save Failed",
        description: "Could not save the prompt version.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Prompt Version</CardTitle>
        <CardDescription>Create and save a new version of the system prompt.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the system prompt..." className="min-h-[300px] resize-y font-mono text-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="versionLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., v1.2-more-concise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Version'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
