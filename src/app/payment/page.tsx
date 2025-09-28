
import { Suspense } from 'react';
import PaymentPageContent from './PaymentPageContent';
import { AppHeader } from '@/components/header';

function PaymentPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-xl">Loading Payment Details...</div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="flex min-h-screen flex-col">
       <AppHeader />
       <main className="flex-grow">
          <Suspense fallback={<PaymentPageFallback />}>
            <PaymentPageContent />
          </Suspense>
      </main>
    </div>
  );
}
