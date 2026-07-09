"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../lib/db";
import { ACTIVE } from "../utils/constants";
import { ResponseInputSchema } from "./response.schema";

type SubmitResult =
  | { success: true; responseId: string }
  | { success: false; error: string };

// Whether the currently signed-in user has already responded to this poll.
// Anonymous visitors always return false (we don't track them across sessions).
export const hasRespondedToPoll = async (
  pollId: string,
): Promise<boolean> => {
  const clerk = await currentUser();
  if (!clerk) return false;
  const email = clerk.emailAddresses[0]?.emailAddress;
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return false;

  const existing = await prisma.response.findUnique({
    where: { pollId_respondentId: { pollId, respondentId: user.id } },
    select: { id: true },
  });
  return Boolean(existing);
};

export const submitPollResponse = async (
  payload: unknown,
): Promise<SubmitResult> => {
  const parsed = ResponseInputSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid response payload." };
  }
  const { pollId, answers, auto } = parsed.data;

  // 1. Load the poll from the DB (source of truth).
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: {
      isPublished: true,
      status: true,
      expiresAt: true,
      authenticatedOnly: true,
      allowAnonymous: true,
      allowResponseEditing: true,
      questions: {
        select: {
          id: true,
          isRequired: true,
          options: { select: { id: true } },
        },
      },
    },
  });

  // 2. Guards (authoritative — the client checks are UX only).
  if (!poll || !poll.isPublished) {
    return { success: false, error: "This poll is not available." };
  }
  if (poll.status !== ACTIVE) {
    return { success: false, error: "This poll is not accepting responses." };
  }
  if (poll.expiresAt && poll.expiresAt <= new Date()) {
    return { success: false, error: "This poll has expired." };
  }

  // 3. Resolve the respondent + enforce the response mode.
  const clerk = await currentUser();
  const mustAuthenticate = poll.authenticatedOnly || !poll.allowAnonymous;
  if (!clerk && mustAuthenticate) {
    return { success: false, error: "Please sign in to respond to this poll." };
  }

  let respondentId: string | null = null;
  if (clerk) {
    const email = clerk.emailAddresses[0]?.emailAddress;
    if (email) {
      const dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkUserId: clerk.id },
        create: {
          email,
          clerkUserId: clerk.id,
          firstName: clerk.firstName ?? "",
          lastName: clerk.lastName ?? "",
        },
      });
      respondentId = dbUser.id;
    }
  }
  const isAnonymous = respondentId === null;

  // 4. Backend validation against the DB copy of the poll.
  const questionById = new Map(poll.questions.map((q) => [q.id, q]));
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.optionId]));

  // On timer auto-submit we save whatever is filled, so required questions are
  // only enforced for a manual submit.
  if (!auto) {
    for (const question of poll.questions) {
      if (question.isRequired && !answerByQuestion.has(question.id)) {
        return {
          success: false,
          error: "Please answer all required questions.",
        };
      }
    }
  }
  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question || !question.options.some((o) => o.id === answer.optionId)) {
      return { success: false, error: "Invalid answer submitted." };
    }
  }

  // 5. Existing response handling for signed-in users.
  if (respondentId) {
    const existing = await prisma.response.findUnique({
      where: { pollId_respondentId: { pollId, respondentId } },
      select: { id: true },
    });
    if (existing) {
      if (!poll.allowResponseEditing) {
        return {
          success: false,
          error: "You have already responded to this poll.",
        };
      }
      // Editing allowed: replace the answers.
      await prisma.$transaction([
        prisma.answer.deleteMany({ where: { responseId: existing.id } }),
        prisma.answer.createMany({
          data: answers.map((a) => ({
            responseId: existing.id,
            questionId: a.questionId,
            optionId: a.optionId,
          })),
        }),
        prisma.response.update({
          where: { id: existing.id },
          data: { submittedAt: new Date() },
        }),
      ]);
      return { success: true, responseId: existing.id };
    }
  }

  // 6. Create the response + answers (nested create is transactional).
  try {
    const response = await prisma.response.create({
      data: {
        pollId,
        respondentId,
        isAnonymous,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId,
          })),
        },
      },
      select: { id: true },
    });
    return { success: true, responseId: response.id };
  } catch (error) {
    // Unique violation on (pollId, respondentId) → duplicate submit race.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "You have already responded to this poll.",
      };
    }
    console.error("submitPollResponse error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
};
