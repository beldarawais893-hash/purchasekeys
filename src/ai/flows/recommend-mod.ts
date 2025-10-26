'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending a mod based on user requirements.
 *
 * - recommendMod - a function that takes user requirements as input and returns a recommended mod.
 * - RecommendModInput - The input type for the recommendMod function.
 * - RecommendModOutput - The return type for the recommendMod function.
 */

import { ai } from '@/ai/genkit';
import { RecommendModInputSchema, RecommendModOutputSchema } from '@/ai/schemas/recommend-mod-schemas';
import type { RecommendModInput, RecommendModOutput } from '@/ai/schemas/recommend-mod-schemas';

export type { RecommendModInput, RecommendModOutput };


export async function recommendMod(input: RecommendModInput): Promise<RecommendModOutput> {
  return recommendModFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendModPrompt',
  input: { schema: RecommendModInputSchema },
  output: { schema: RecommendModOutputSchema },
  prompt: `You are a helpful assistant for a website that sells game mods. Your task is to recommend the best mod to a user based on their needs.

Here are the available mods and their descriptions:

- **Safe loader:** This is the safest option. It is designed for players who want to avoid detection and play without getting banned. It has basic features but is very reliable.
- **Infinite mod:** This is a powerful mod with a lot of features, including unlimited resources and abilities. It is less safe than the safe loader but offers a lot of power.
- **Ignis mod:** This is a balanced mod. It offers a good mix of powerful features and safety measures. A great all-rounder.
- **Monster mod:** This is the most powerful and feature-rich mod, designed for aggressive players who want to dominate. It carries the highest risk but offers the biggest advantages.

User Requirements: {{{userRequirements}}}

Based on the user's requirements, recommend ONE of the mods from the list above. Provide the name of the mod in the 'recommendedMod' field and a clear reason for your recommendation in the 'reasoning' field.
`,
});

const recommendModFlow = ai.defineFlow(
  {
    name: 'recommendModFlow',
    inputSchema: RecommendModInputSchema,
    outputSchema: RecommendModOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
