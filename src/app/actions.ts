'use server';

import {
  recommendSubscriptionPlan,
  type RecommendSubscriptionPlanInput,
  type RecommendSubscriptionPlanOutput,
} from '@/ai/flows/recommend-subscription-plan';
import {
  verifyPayment,
  type VerifyPaymentInput,
  type VerifyPaymentOutput,
} from '@/ai/flows/verify-payment-flow';
import {
  editScreenshot,
  type EditScreenshotInput,
  type EditScreenshotOutput,
} from '@/ai/flows/edit-screenshot-flow';
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

export async function verifyPaymentWithAi(
  input: VerifyPaymentInput
): Promise<VerifyPaymentOutput> {
  if (
    !input.screenshotDataUri ||
    !input.utrNumber ||
    !input.expectedAmount ||
    !input.expectedUpiId
  ) {
    throw new Error('All verification details are required.');
  }

  try {
    const result = await verifyPayment(input);
    return result;
  } catch (error) {
    console.error('Error during AI payment verification:', error);
    throw new Error(
      'Failed to verify payment with AI. Please try again later.'
    );
  }
}

export async function editScreenshotWithAi(
  input: EditScreenshotInput
): Promise<EditScreenshotOutput> {
  if (!input.screenshotDataUri || !input.prompt) {
    throw new Error('Screenshot and prompt are required.');
  }

  try {
    const result = await editScreenshot(input);
    return result;
  } catch (error) {
    console.error('Error during AI screenshot editing:', error);
    throw new Error(
      'Failed to edit screenshot with AI. Please try again later.'
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
