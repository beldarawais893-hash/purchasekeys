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
