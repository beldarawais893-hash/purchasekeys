
'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useMemo, ReactNode } from 'react';

type PaymentParamsContextType = {
  plan: string;
  price: number;
};

const PaymentParamsContext = createContext<PaymentParamsContextType | null>(null);

export const PaymentParamsProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'Unknown Plan';
  const price = Number(searchParams.get('price')) || 0;

  const value = useMemo(() => ({ plan, price }), [plan, price]);

  return (
    <PaymentParamsContext.Provider value={value}>
      {children}
    </PaymentParamsContext.Provider>
  );
};

export const usePaymentParams = (): PaymentParamsContextType => {
  const context = useContext(PaymentParamsContext);
  if (!context) {
    throw new Error('usePaymentParams must be used within a PaymentParamsProvider');
  }
  return context;
};
