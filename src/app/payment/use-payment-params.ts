
'use client';

import React, { createContext, useContext } from 'react';
import { useSearchParams } from 'next/navigation';

type PaymentParams = {
  plan: string | null;
  price: string | null;
};

const PaymentParamsContext = createContext<PaymentParams>({
  plan: null,
  price: null,
});

export const PaymentParamsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const price = searchParams.get('price');
  const value = { plan, price };

  return (
    <PaymentParamsContext.Provider value={value}>
      {children}
    </PaymentParamsContext.Provider>
  );
};

export const usePaymentParams = () => {
  const context = useContext(PaymentParamsContext);
  if (!context) {
    throw new Error(
      'usePaymentParams must be used within a PaymentParamsProvider'
    );
  }
  return context;
};
