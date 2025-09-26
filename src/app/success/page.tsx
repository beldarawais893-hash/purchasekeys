
'use client';

import { Suspense } from 'react';
import SuccessPageContent from './SuccessPageContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
