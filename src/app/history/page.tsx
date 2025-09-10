import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
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
