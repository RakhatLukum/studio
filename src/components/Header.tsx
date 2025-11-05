
"use client";

import Link from 'next/link';
import { Sparkles, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">MansUP</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-1">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Career Advisor
            </Link>
            <Link href="/cv-builder" className="transition-colors hover:text-foreground/80 text-foreground/60">
                CV Builder
            </Link>
            <Link href="/interview-prep" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Interview Prep
            </Link>
            <Link href="/tailor" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Tailor
            </Link>
            {user && !user.isAnonymous && (
              <>
                <Link href="/history" className="transition-colors hover:text-foreground/80 text-foreground/60">
                    History
                </Link>
              </>
            )}
        </nav>
        <div className="flex items-center justify-end">
          {isUserLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>
                      {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.isAnonymous ? 'Anonymous User' : user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

    