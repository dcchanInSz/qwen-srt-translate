import { tool } from "ai";
import { z } from "zod";

export const checkEmpty = tool({
  description:
    "Verify no translated segments are empty. Returns indices of empty translations that need retranslation.",
  inputSchema: z.object({
    translations: z.array(z.string()).describe("Translated texts, one per segment, in order"),
  }),
  execute: async ({ translations }) => {
    const emptyIndices: number[] = [];
    translations.forEach((t, i) => {
      if (!t || !t.trim()) emptyIndices.push(i);
    });
    return {
      totalSegments: translations.length,
      emptyIndices,
      emptyCount: emptyIndices.length,
      allValid: emptyIndices.length === 0,
    };
  },
});
