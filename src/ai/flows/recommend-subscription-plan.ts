
'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending a subscription plan based on user viewing habits and preferences.
 *
 * - recommendSubscriptionPlan - A function that takes user viewing habits and preferences as input and returns a recommended subscription plan.
 * - RecommendSubscriptionPlanInput - The input type for the recommendSubscriptionPlan function.
 * - RecommendSubscriptionPlanOutput - The return type for the recommendSubscriptionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSubscriptionPlanInputSchema = z.object({
  viewingHabits: z
    .string()
    .describe(
      'A description of the user viewing habits, including frequency, duration, and content preferences.'
    ),
  preferences: z
    .string()
    .describe('The user preferences for subscription plans, such as budget and desired features.'),
});
export type RecommendSubscriptionPlanInput = z.infer<typeof RecommendSubscriptionPlanInputSchema>;

const RecommendSubscriptionPlanOutputSchema = z.object({
  recommendedPlan: z
    .string()
    .describe('The recommended subscription plan based on the user viewing habits and preferences.'),
  reasoning: z
    .string()

    .describe('The reasoning behind the recommendation, explaining why the plan is suitable for the user.'),
});
export type RecommendSubscriptionPlanOutput = z.infer<typeof RecommendSubscriptionPlanOutputSchema>;

export async function recommendSubscriptionPlan(input: RecommendSubscriptionPlanInput): Promise<RecommendSubscriptionPlanOutput> {
  return recommendSubscriptionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSubscriptionPlanPrompt',
  input: {schema: RecommendSubscriptionPlanInputSchema},
  output: {schema: RecommendSubscriptionPlanOutputSchema},
  prompt: `You are a subscription plan recommendation expert.

Based on the user's viewing habits and preferences, recommend the most suitable subscription plan.

Consider the following subscription plans:

1 ᴅᴀʏ - 200 ʳˢ
3 ᴅᴀʏ - 350 ʳˢ
7 ᴅᴀʏ - 500 ʳˢ
15 ᴅᴀʏ - 720 ʳˢ
1 ᴍᴏɴᴛʜ - 1000 ʳˢ
2 ᴍᴏɴᴛʜ - 1400 ʳˢ

Viewing Habits: {{{viewingHabits}}}
Preferences: {{{preferences}}}

Recommend the best plan and explain your reasoning.`,
});

const recommendSubscriptionPlanFlow = ai.defineFlow(
  {
    name: 'recommendSubscriptionPlanFlow',
    inputSchema: RecommendSubscriptionPlanInputSchema,
    outputSchema: RecommendSubscriptionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
