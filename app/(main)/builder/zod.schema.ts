import { ALLOWED_QUESTION_TYPES, SINGLE } from "@/app/utils/constants";
import { z } from "zod";

export const QuestionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Option text is required"),
});

export const QuestionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Question title is required"),
  type: z.enum(ALLOWED_QUESTION_TYPES).default(SINGLE),
  required: z.boolean().default(false),
  options: z
    .array(QuestionOptionSchema)
    .min(1, "At least one option is required"),
});

export const PollInputSchema = z.object({
  title: z.string().min(1, "Poll title is required"),
  description: z.string().optional(),
  questions: z
    .array(QuestionSchema)
    .min(1, "At least one question is required"),
  anonymousResponses: z.boolean().default(false),
  authenticatedOnly: z.boolean().default(false),
  resultsVisibility: z.boolean().default(false),
  expiresAt: z
    .string()
    .datetime({ local: true })
    .or(z.literal(""))
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  allowResponseEditing: z.boolean().default(false),
  timerEnabled: z.boolean().default(false),
  timerMinutes: z.number().int().nonnegative().default(0),
});

export type PollInput = z.infer<typeof PollInputSchema>;
