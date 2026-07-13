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

// `datetime-local` inputs are minute-precision local strings (no seconds/tz),
// e.g. "2026-07-09T14:30". Parse leniently: empty → no expiry.
const expiresAtSchema = z
  .string()
  .nullable()
  .optional()
  .transform((val, ctx) => {
    if (!val) return null;
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid expiry date and time",
      });
      return z.NEVER;
    }
    return date;
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
  expiresAt: expiresAtSchema,
  allowResponseEditing: z.boolean().default(false),
  timerEnabled: z.boolean().default(false),
  timerMinutes: z.number().int().nonnegative().default(0),
});

export type PollInput = z.infer<typeof PollInputSchema>;

// Drafts are works-in-progress: nothing is required, empty title/questions/
// options are all allowed so a creator can save and come back later. The shape
// stays assignable to PollInput so `saveNewPoll` can persist either one.
const DraftQuestionSchema = z.object({
  id: z.string().optional(),
  title: z.string().default(""),
  type: z.enum(ALLOWED_QUESTION_TYPES).default(SINGLE),
  required: z.boolean().default(false),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().default(""),
      }),
    )
    .default([]),
});

export const DraftPollSchema = z.object({
  title: z.string().default(""),
  description: z.string().optional(),
  questions: z.array(DraftQuestionSchema).default([]),
  anonymousResponses: z.boolean().default(false),
  authenticatedOnly: z.boolean().default(false),
  resultsVisibility: z.boolean().default(false),
  expiresAt: expiresAtSchema,
  allowResponseEditing: z.boolean().default(false),
  timerEnabled: z.boolean().default(false),
  timerMinutes: z.number().int().nonnegative().default(0),
});

export type DraftPollInput = z.infer<typeof DraftPollSchema>;
