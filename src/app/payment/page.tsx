
'use client';

import { Suspense } from 'react';
import PaymentPageContent from './PaymentPageContent';
import { PaymentParamsProvider } from './use-payment-params';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">Loading Payment Details...</div>}>
        <PaymentParamsProvider>
            <PaymentPageContent />
        </PaymentParamsProvider>
    </Suspense>
  );
}
