import { z } from 'genkit';

export const RecommendModInputSchema = z.object({
  userRequirements: z
    .string()
    .describe(
      'A description of what the user is looking for in a mod.'
    ),
});
export type RecommendModInput = z.infer<typeof RecommendModInputSchema>;

export const RecommendModOutputSchema = z.object({
  recommendedMod: z
    .string()
    .describe('The name of the recommended mod. Must be one of: Safe loader, Infinite mod, Ignis mod, Monster mod.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the recommendation, explaining why this mod is suitable for the user.'),
});
export type RecommendModOutput = z.infer<typeof RecommendModOutputSchema>;
