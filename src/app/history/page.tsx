
"use client";

import HistoryList from '@/components/HistoryList';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function HistoryPage() {
    const { user, isUserLoading } = useUser();
    
    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user || user.isAnonymous) {
        return (
            <div className="container mx-auto px-4 py-8 sm:py-12">
                 <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <h2 className="text-xl font-semibold">Please Sign In</h2>
                    <p className="text-muted-foreground mt-2">
                        You need to have an account to view your tailoring history.
                    </p>
                    <Link href="/login" className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
                <p className="text-muted-foreground">Review your past resume tailoring sessions.</p>
            </div>
            <HistoryList />
        </div>
    );
}
