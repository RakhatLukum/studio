
"use client";

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold">AI Resume Tailor</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-1">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Tailor
            </Link>
            <Link href="/career-advisor" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Career Advisor
            </Link>
            <Link href="/interview-prep" className="transition-colors hover:text-foreground/80 text-foreground">
                Interview Prep
            </Link>
        </nav>
      </div>
    </header>
  );
}
