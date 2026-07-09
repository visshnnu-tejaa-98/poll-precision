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
    console.error("Database saveNewPoll error:", error);
    throw new Error("Failed to insert the validated survey payload.");
  }
};

export const savePoll = async (payload: unknown) => {
  const data = await validate(PollInputSchema, payload);
  const pollId = await saveNewPoll(data, true);
  return pollId;
};

export const getPollById = async (pollId: string) => {
  try {
    const poll = await prisma.poll.findFirst({
      where: { id: pollId, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        expiresAt: true,
        authenticatedOnly: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            isRequired: true,
            options: {
              select: { id: true, text: true },
            },
          },
        },
      },
    });
    return poll;
  } catch (error) {
    console.error("Database getPollById error:", error);
    throw new Error("Failed to get the poll.");
  }
};

export const getMyPolls = async () => {
  const { clerkUserId } = await getCurrentLoggedInUser();

  try {
    const polls = await prisma.poll.findMany({
      where: { creator: { clerkUserId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        isPublished: true,
        expiresAt: true,
        createdAt: true,
        _count: { select: { responses: true, questions: true } },
      },
    });

    return polls.map((poll) => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      isPublished: poll.isPublished,
      questionCount: poll._count.questions,
      responseCount: poll._count.responses,
      expiresAt: poll.expiresAt ? poll.expiresAt.toISOString() : null,
      createdAt: poll.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Database getMyPolls error:", error);
    throw new Error("Failed to get the polls data.");
  }
};

export const getAllPollsByUserId = async () => {
  const { clerkUserId } = await getCurrentLoggedInUser();

  try {
    const polls = await prisma.poll.findMany({
      where: {
        creator: {
          clerkUserId: clerkUserId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        responses: true,
      },
    });
    return polls.map((poll) => ({
      ...poll,
      createdAt: poll.createdAt.toISOString(),
      expiresAt: poll.expiresAt ? poll.expiresAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Database getData error:", error);
    throw new Error("Failed to get the polls data.");
  }
};
