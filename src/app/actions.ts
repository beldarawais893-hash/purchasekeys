'use server';

import {
  recommendSubscriptionPlan,
  type RecommendSubscriptionPlanInput,
  type RecommendSubscriptionPlanOutput,
} from '@/ai/flows/recommend-subscription-plan';

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
