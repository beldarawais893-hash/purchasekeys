'use server';

import {
  recommendSubscriptionPlan,
  type RecommendSubscriptionPlanInput,
  type RecommendSubscriptionPlanOutput,
} from '@/ai/flows/recommend-subscription-plan';
import { kv } from '@vercel/kv';

export type Key = {
  id: string;
  value: string;
  plan: string;
  price: number;
  createdAt: string; // ISO string
  claimedAt?: string; // ISO string
  status: 'available' | 'claimed';
  utr?: string;
};


export async function getAiRecommendation(
  input: RecommendSubscriptionPlanInput
): Promise<RecommendSubscriptionPlanOutput> {
  if (!input.viewingHabits || !input.preferences) {
    throw new Error('Viewing habits and preferences are required.');
  }

  try {
    const result = await recommendSubscriptionPlan(input);
    return result;
  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    throw new Error(
      'Failed to get a recommendation from the AI. Please try again later.'
    );
  }
}

// Vercel KV actions for keys
export async function getKeys(): Promise<Key[]> {
  try {
    const keys = await kv.get<Key[]>('keys');
    return keys || [];
  } catch (error) {
    if (error instanceof Error && error.message.includes('WRONGTYPE')) {
      console.warn(
        'Vercel KV "keys" has wrong type, deleting and resetting. Error:',
        error.message
      );
      await kv.del('keys');
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

export async function saveKeys(keys: Key[]): Promise<void> {
  await kv.set('keys', keys);
}
