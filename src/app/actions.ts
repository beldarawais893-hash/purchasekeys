
'use server';

import {
  recommendSubscriptionPlan,
  type RecommendSubscriptionPlanInput,
  type RecommendSubscriptionPlanOutput,
} from '@/ai/flows/recommend-subscription-plan';
import { kv } from '@vercel/kv';
import type { Key } from '@/lib/types';
import { z } from 'zod';
import { ai } from '@/ai/genkit';


// Zod Schema for input validation, kept within the primary server action file.
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

// Internal type for the AI model's output.
type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;
const VerifyPaymentOutputSchema = z.object({
  isPaymentValid: z.boolean().describe('Whether the payment details in the screenshot are valid and correct.'),
  reason: z.string().describe('A brief explanation of why the payment is considered invalid. Provide this only if isPaymentValid is false.'),
});


/**
 * Verifies payment details using a Genkit AI flow. This function is defined
 * directly within the main actions file to avoid 'use server' cross-file import issues.
 */
async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  const UPI_ID = 'paytmqr6fauyo@ptys';

  // Define the prompt for the AI model
  const prompt = ai.definePrompt({
    name: 'verifyPaymentPrompt',
    input: { schema: VerifyPaymentInputSchema },
    output: { schema: VerifyPaymentOutputSchema },
    prompt: `You are an expert payment verification agent. Your task is to analyze a payment screenshot and verify its authenticity based on the provided details.

You must meticulously check the following four conditions:
1.  Amount Match: The payment amount in the screenshot must exactly match the expected plan price of ₹{{{planPrice}}}.
2.  UPI ID Match: The recipient's UPI ID in the screenshot must be '${UPI_ID}'.
3.  UTR/Reference Number Match: The UTR, UPI reference number, or transaction ID in the screenshot must exactly match the user-provided UTR number: '{{{utrNumber}}}'.
4.  Screenshot Authenticity: The screenshot must look like a genuine, unaltered screenshot from a payment app. Check for inconsistencies in fonts, colors, or any signs of editing or watermarks.

Analyze the attached screenshot:
{{media url=screenshotDataUri}}

Based on your analysis, determine if the payment is valid.
- If all four conditions are met, set 'isPaymentValid' to true.
- If any condition fails, set 'isPaymentValid' to false and provide a clear, concise 'reason' explaining exactly which check failed (e.g., "Amount in screenshot does not match plan price.", "UTR number not found in screenshot.", "Recipient UPI ID is incorrect.", "Screenshot does not appear to be original."). Do not be conversational in your reason.`,
  });

  // Execute the prompt and return the structured output
  const { output } = await prompt(input);
  return output!;
}


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
    // 1. Verify with AI (now calling the local function)
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
