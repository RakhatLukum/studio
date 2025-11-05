
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  AuthErrorCodes,
} from 'firebase/auth';
import { LogIn, UserPlus, Ghost } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !user.isAnonymous && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const newUser = userCredential.user;
        if (firestore) {
          const userRef = doc(firestore, 'users', newUser.uid);
          setDocumentNonBlocking(userRef, {
            id: newUser.uid,
            email: newUser.email,
            createdAt: serverTimestamp(),
          }, { merge: true });
        }
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      toast({
        title: isSignUp ? 'Account Created' : 'Signed In',
        description: isSignUp
          ? 'Welcome! You have been successfully signed up.'
          : 'Welcome back! You have been successfully signed in.',
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.EMAIL_EXISTS:
            description = 'This email is already in use. Please sign in or use a different email.';
            break;
          case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
          case 'auth/invalid-credential': // Catches both new and old error codes
            description = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case AuthErrorCodes.WEAK_PASSWORD:
            description = 'The password is too weak. Please use at least 6 characters.';
            break;
          default:
            description = `An authentication error occurred. Please try again. (${error.code})`;
            break;
        }
      }
      toast({
        title: isSignUp ? 'Sign-up failed' : 'Sign-in failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Signed In Anonymously',
        description: 'You can now use the app as a guest.',
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Anonymous Sign-in Failed',
        description: 'Could not sign in as a guest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || (user && !user.isAnonymous)) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Enter your details to create a new account.'
              : 'Sign in to access your tailored resumes and history.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Processing...'
                ) : isSignUp ? (
                  <>
                    <UserPlus className="mr-2" /> Sign Up
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="underline"
              disabled={loading}
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue as
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleAnonymousSignIn}
            disabled={loading}
          >
            <Ghost className="mr-2" />
            Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
