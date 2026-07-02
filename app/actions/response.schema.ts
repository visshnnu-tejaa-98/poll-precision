import { z } from "zod";

export const AnswerInputSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export const ResponseInputSchema = z.object({
  pollId: z.string().min(1),
  answers: z.array(AnswerInputSchema),
});

export type ResponseInput = z.infer<typeof ResponseInputSchema>;
