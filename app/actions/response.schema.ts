import { z } from "zod";

export const AnswerInputSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export const ResponseInputSchema = z.object({
  pollId: z.string().min(1),
  answers: z.array(AnswerInputSchema),
  // Auto-submitted when the response timer runs out — saves partial answers,
  // so the "all required questions" check is skipped for these.
  auto: z.boolean().optional().default(false),
});

export type ResponseInput = z.infer<typeof ResponseInputSchema>;
