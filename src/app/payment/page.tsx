import { PaymentParamsProvider } from './use-payment-params';
import PaymentPageContent from './PaymentPageContent';
import { Suspense } from 'react';

// Use suspense to wait for the page to be rendered
export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentParamsProvider>
        <PaymentPageContent />
      </PaymentParamsProvider>
    </Suspense>
  );
}
