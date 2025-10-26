'use client';

import { Suspense } from 'react';
import { AppHeader } from '@/components/header';
import { PurchaseSchedule } from '@/components/purchase-schedule';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PurchasePageContent() {
    const searchParams = useSearchParams();
    const mod = searchParams.get('mod') || 'your mod';

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 flex-grow">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/home"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
            </div>
            <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm animate-border-glow">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold font-headline">Purchase Plan for <span className="text-primary">{mod}</span></CardTitle>
                    <CardDescription className="text-center">Select a subscription plan below to activate {mod}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PurchaseSchedule />
                </CardContent>
            </Card>
        </div>
    )
}


function PurchasePageFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-xl">Loading Plans...</div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <div className="flex min-h-screen flex-col">
       <AppHeader />
       <main className="flex-grow">
          <Suspense fallback={<PurchasePageFallback />}>
            <PurchasePageContent />
          </Suspense>
      </main>
    </div>
  );
}
