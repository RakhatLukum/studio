
"use client";

import HistoryList from '@/components/HistoryList';
import { useAuth } from '@/context/AuthContext';

export default function HistoryPage() {
    const { user } = useAuth();
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
            <p className="text-muted-foreground">Review your past resume tailoring sessions.</p>
        </div>
        {user ? <HistoryList /> : (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <h2 className="text-xl font-semibold">Sign in to view your history</h2>
                <p className="text-muted-foreground mt-2">
                    Please sign in to view your past resume tailoring sessions.
                </p>
            </div>
        )}
        </div>
    );
}
