'use server';

/**
 * @fileOverview A Genkit flow for verifying payment screenshots.
 *
 * - verifyPayment - A function that verifies payment details from a screenshot.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VerifyPaymentInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  utrNumber: z.string().describe('The UTR/Transaction ID entered by the user.'),
  expectedAmount: z.string().describe('The expected payment amount for the plan.'),
  expectedUpiId: z.string().describe('The expected UPI ID of the receiver.'),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isVerified: z
    .boolean()
    .describe('Whether the payment is verified based on the screenshot.'),
  reason: z
    .string()
    .describe(
      'The reason for the verification status. E.g., "Payment verified successfully." or "Amount mismatch.".'
    ),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentPrompt',
  input: { schema: VerifyPaymentInputSchema },
  output: { schema: VerifyPaymentOutputSchema },
  prompt: `You are a payment verification expert. Your task is to analyze a payment screenshot and verify it against the provided details.

  **Verification Steps:**
  1.  **Examine the Screenshot:** Look for the UPI ID, the amount paid, and the UTR/Transaction ID in the image.
  2.  **Compare Details:**
      *   Does the UPI ID in the screenshot match the expected UPI ID ('{{expectedUpiId}}')?
      *   Does the amount in the screenshot match the expected amount ('{{expectedAmount}}')?
      *   Does the UTR/Transaction ID in the screenshot match the user-provided UTR ('{{utrNumber}}')?
  3.  **Make a Decision:**
      *   If all three details match, set 'isVerified' to true.
      *   If any detail does not match, set 'isVerified' to false and provide a clear reason (e.g., "Amount does not match.", "UTR not found in screenshot.", "UPI ID mismatch.").
      *   If the image is unclear, invalid, or not a payment screenshot, set 'isVerified' to false and state the reason.

  **Input Data:**
  -   Expected UPI ID: {{{expectedUpiId}}}
  -   Expected Amount: {{{expectedAmount}}}
  -   User-entered UTR: {{{utrNumber}}}
  -   Payment Screenshot: {{media url=screenshotDataUri}}

  Analyze the screenshot and provide your verification result in the specified JSON format.`,
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
