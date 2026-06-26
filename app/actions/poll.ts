"use server";

import { PollInput, PollInputSchema } from "../(main)/builder/zod.schema";
import { validate } from "../common/zod.middleware";
import { prisma } from "../lib/db";
import { getCurrentLoggedInUser } from "../utils";
import { ACTIVE } from "../utils/constants";

export const saveNewPoll = async (payload: PollInput, publish: boolean) => {
  try {
    const {
      title,
      description,
      anonymousResponses,
      authenticatedOnly,
      resultsVisibility,
      expiresAt,
      allowResponseEditing,
      timerEnabled,
      timerMinutes,
      questions,
    } = payload;
    const { id } = await getCurrentLoggedInUser();

    const newPoll = await prisma.poll.create({
      data: {
        title,
        description,
        allowAnonymous: anonymousResponses,
        authenticatedOnly,
        resultsVisibility,
        expiresAt,
        allowResponseEditing,
        isPublished: publish,
        responseTimer: timerEnabled,
        timerInMinutes: timerMinutes,
        creatorId: id,
        status: ACTIVE,
        questions: {
          create: questions.map((question, index) => ({
            title: question.title,
            isRequired: question.required,
            order: index + 1,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    return { success: true, pollId: newPoll.id };
  } catch (error) {
    console.error("Database seed error:", error);
    throw new Error("Failed to insert the validated survey payload.");
  }
};

export const savePoll = async (payload: any) => {
  const data = await validate(PollInputSchema, payload);
  const pollId = await saveNewPoll(data, true);
  return pollId;
};
