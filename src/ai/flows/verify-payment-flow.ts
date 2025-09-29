'use server';
/**
 * @fileOverview A Genkit flow for verifying payment details from a screenshot.
 *
 * - verifyPayment - A function that handles the payment verification process.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { VerifyPaymentInput } from '@/app/actions';
import { VerifyPaymentInputSchema } from '@/app/actions';


const UPI_ID = '9058895955-c289@axl';


const VerifyPaymentOutputSchema = z.object({
  isPaymentValid: z.boolean().describe('Whether the payment details in the screenshot are valid and correct.'),
  reason: z.string().describe('A brief explanation of why the payment is considered invalid. Provide this only if isPaymentValid is false.'),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentPrompt',
  input: {schema: VerifyPaymentInputSchema},
  output: {schema: VerifyPaymentOutputSchema},
  prompt: `You are an expert payment verification agent. Your task is to analyze a payment screenshot and verify its authenticity based on the provided details.

You must meticulously check the following three conditions:
1.  Amount Match: The payment amount in the screenshot must exactly match the expected plan price of ₹{{{planPrice}}}.
2.  UPI ID Match: The recipient's UPI ID in the screenshot must be '${UPI_ID}'.
3.  UTR/Reference Number Match: The UTR, UPI reference number, or transaction ID in the screenshot must exactly match the user-provided UTR number: '{{{utrNumber}}}'.

Analyze the attached screenshot:
{{media url=screenshotDataUri}}

Based on your analysis, determine if the payment is valid.
- If all three conditions are met, set 'isPaymentValid' to true.
- If any condition fails, set 'isPaymentValid' to false and provide a clear, concise 'reason' explaining exactly which check failed (e.g., "Amount in screenshot does not match plan price.", "UTR number not found in screenshot.", "Recipient UPI ID is incorrect."). Do not be conversational in your reason.`,
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
