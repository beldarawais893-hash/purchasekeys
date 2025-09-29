
'use client';

import { Suspense } from 'react';
import SuccessPageContent from './SuccessPageContent';
import { AppHeader } from '@/components/header';

function SuccessPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}

export default function SuccessPage() {
  return (
     <div className="flex min-h-screen flex-col">
       <main className="flex-grow">
          <Suspense fallback={<SuccessPageFallback />}>
            <SuccessPageContent />
          </Suspense>
      </main>
    </div>
  );
}
