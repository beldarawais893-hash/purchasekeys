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
  prompt: `You are an advanced payment verification expert with a keen eye for fraudulent and tampered screenshots. Your task is to meticulously analyze a payment screenshot and verify it against the provided details.

  **Primary Verification Steps:**
  1.  **Examine the Screenshot for Key Details:** Look for the receiver's UPI ID, the amount paid, and the UTR/Transaction ID in the image.
  2.  **Compare Details:**
      *   Does the UPI ID in the screenshot match the expected UPI ID ('{{expectedUpiId}}')?
      *   Does the amount in the screenshot match the expected amount ('{{expectedAmount}}')?
      *   Does the UTR/Transaction ID in the screenshot match the user-provided UTR ('{{utrNumber}}')?
  3.  **If any of the above details do not match, immediately fail the verification.** Provide a clear reason like "Amount does not match.", "UTR not found in screenshot.", or "UPI ID mismatch."

  **Fraud & Tampering Detection (Crucial Second-Level Check):**
  *   **Analyze Image Integrity:** Scrutinize the screenshot for any signs of digital alteration. Look for mismatched fonts, inconsistent text alignment, pixelation around key text areas (Amount, UTR), or unnatural spacing.
  *   **Check for Illegal Content:** Inspect the image for any unprofessional watermarks, irrelevant or suspicious text, or any visual elements that are not typical for a genuine payment confirmation screen.
  *   **Font and Style Consistency:** Ensure that the font type, size, and color are consistent throughout the screenshot, as they would be in a real app. Any deviation could indicate tampering.

  **Final Decision Logic:**
  -   If the primary verification passes BUT you detect **any sign of tampering or illegal content**, you MUST set 'isVerified' to 'false'. The reason should clearly state the suspicion, e.g., "Screenshot appears to be edited or tampered with," or "Suspicious watermark detected on screenshot."
  -   If the image is unclear, invalid, or not a payment screenshot at all, set 'isVerified' to 'false' and state the reason.
  -   Only if **all** primary details match AND there are **zero signs of tampering** should you set 'isVerified' to 'true' with the reason "Payment verified successfully.".

  **Input Data:**
  -   Expected UPI ID: {{{expectedUpiId}}}
  -   Expected Amount: {{{expectedAmount}}}
  -   User-entered UTR: {{{utrNumber}}}
  -   Payment Screenshot: {{media url=screenshotDataUri}}

  Analyze the screenshot with extreme prejudice for fraud and provide your verification result in the specified JSON format.`,
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
