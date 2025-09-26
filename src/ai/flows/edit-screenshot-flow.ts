'use server';

/**
 * @fileOverview A Genkit flow for editing screenshots based on a prompt.
 *
 * - editScreenshot - A function that edits a screenshot based on a textual prompt.
 * - EditScreenshotInput - The input type for the editScreenshot function.
 * - EditScreenshotOutput - The return type for the editScreenshot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EditScreenshotInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot to be edited, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  prompt: z.string().describe('The instruction for how to edit the screenshot, e.g., "remove the watermark".'),
});
export type EditScreenshotInput = z.infer<typeof EditScreenshotInputSchema>;

const EditScreenshotOutputSchema = z.object({
  editedScreenshotDataUri: z
    .string()
    .describe(
      "The edited screenshot, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type EditScreenshotOutput = z.infer<typeof EditScreenshotOutputSchema>;

export async function editScreenshot(
  input: EditScreenshotInput
): Promise<EditScreenshotOutput> {
  return editScreenshotFlow(input);
}

const editScreenshotFlow = ai.defineFlow(
  {
    name: 'editScreenshotFlow',
    inputSchema: EditScreenshotInputSchema,
    outputSchema: EditScreenshotOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: input.screenshotDataUri } },
            { text: input.prompt },
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!media || !media.url) {
        throw new Error('Failed to edit screenshot. The model did not return an image.');
    }

    return { editedScreenshotDataUri: media.url };
  }
);
