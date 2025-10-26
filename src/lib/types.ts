export type SubscriptionPlan = {
  id: number;
  duration: string;
  price: number;
  currency: string;
};

export type Key = {
  id: string;
  value: string;
  mod: string; // Added mod field
  plan: string;
  price: number;
  createdAt: string; // ISO string
  claimedAt?: string; // ISO string
  status: 'available' | 'claimed';
  utr?: string;
};
