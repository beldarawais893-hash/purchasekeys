
'use server';

import {
  recommendSubscriptionPlan,
  type RecommendSubscriptionPlanInput,
  type RecommendSubscriptionPlanOutput,
} from '@/ai/flows/recommend-subscription-plan';
import { 
  verifyPayment, 
} from '@/ai/flows/verify-payment-flow';
import { kv } from '@vercel/kv';
import type { Key } from '@/lib/types';
import { z } from 'zod';

export const VerifyPaymentInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  utrNumber: z.string().describe('The UTR/transaction reference number provided by the user.'),
  planPrice: z.string().describe('The price of the subscription plan the user is paying for.'),
  planDuration: z.string().describe('The duration of the subscription plan.'),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isPaymentValid: z.boolean().describe('Whether the payment details in the screenshot are valid and correct.'),
  reason: z.string().describe('A brief explanation of why the payment is considered invalid. Provide this only if isPaymentValid is false.'),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;


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
): Promise<{ success: boolean; message: string; claimedKey?: Key }> {
  // Validate input with Zod schema
  const parsedInput = VerifyPaymentInputSchema.safeParse(input);
  if (!parsedInput.success) {
     return { success: false, message: 'Invalid input provided.' };
  }

  try {
    // 1. Verify with AI
    const verificationResult = await verifyPayment(parsedInput.data);

    if (!verificationResult.isPaymentValid) {
      return { success: false, message: verificationResult.reason || 'Payment details could not be verified. Please check and try again.' };
    }

    const allKeys = await getKeys();

    // 2. Check if UTR has been used before
    const utrExists = allKeys.some(key => key.utr === input.utrNumber && key.status === 'claimed');
    if (utrExists) {
      return { success: false, message: 'This UTR number has already been used to claim a key.' };
    }

    // 3. Find an available key for the plan
    const availableKey = allKeys.find(key => key.plan === input.planDuration && key.status === 'available');

    if (!availableKey) {
      return { success: false, message: `Sorry, no keys are currently available for the ${input.planDuration} plan. Please contact the owner.` };
    }

    // 4. Claim the key
    const claimedKey: Key = {
      ...availableKey,
      status: 'claimed',
      claimedAt: new Date().toISOString(),
      utr: input.utrNumber,
    };

    // 5. Update the keys in the database
    const updatedKeys = allKeys.map(key => key.id === claimedKey.id ? claimedKey : key);
    await saveKeys(updatedKeys);

    return {
      success: true,
      message: 'Payment verified successfully!',
      claimedKey: claimedKey,
    };

  } catch (error) {
    console.error('Error during AI payment verification:', error);
    // Provide a more generic error to the user for security
    return { success: false, message: 'An unexpected error occurred during verification. Please try again later or contact support.' };
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
