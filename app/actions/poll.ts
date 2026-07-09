"use server";

import { PollInput, PollInputSchema } from "../(main)/builder/zod.schema";
import { validate } from "../common/zod.middleware";
import { prisma } from "../lib/db";
import { Prisma } from "../generated/prisma/client";
import { getCurrentLoggedInUser } from "../utils";
import { ACTIVE } from "../utils/constants";
import type { PollsPageRequest, PollStatusFilter } from "./poll-filters";

// Build the SQL WHERE for a creator's polls, pushing search + effective-status
// (Option A: a poll past expiresAt counts as expired) filtering into the DB.
function buildMyPollsWhere(
  clerkUserId: string,
  query: string,
  status: PollStatusFilter,
): Prisma.PollWhereInput {
  const now = new Date();
  const and: Prisma.PollWhereInput[] = [{ creator: { clerkUserId } }];

  const q = query.trim();
  if (q) and.push({ title: { contains: q, mode: "insensitive" } });

  if (status === "draft") {
    and.push({ status: "DRAFT" });
  } else if (status === "active") {
    and.push({
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    });
  } else if (status === "expired") {
    and.push({
      OR: [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }],
    });
  }

  return { AND: and };
}

export const getMyPollsPaginated = async (args: PollsPageRequest) => {
  const { clerkUserId } = await getCurrentLoggedInUser();

  const page = Math.max(1, Math.floor(args.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Math.floor(args.pageSize) || 10));
  const where = buildMyPollsWhere(
    clerkUserId,
    args.query ?? "",
    args.status ?? "all",
  );

  try {
    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          _count: { select: { responses: true, questions: true } },
        },
      }),
      prisma.poll.count({ where }),
    ]);

    return {
      rows: polls.map((poll) => ({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        questionCount: poll._count.questions,
        responseCount: poll._count.responses,
        expiresAt: poll.expiresAt ? poll.expiresAt.toISOString() : null,
        createdAt: poll.createdAt.toISOString(),
      })),
      total,
    };
  } catch (error) {
    console.error("Database getMyPollsPaginated error:", error);
    throw new Error("Failed to get the polls data.");
  }
};

export const getMyPollsStats = async () => {
  const { clerkUserId } = await getCurrentLoggedInUser();
  const now = new Date();
  const creator: Prisma.PollWhereInput = { creator: { clerkUserId } };

  try {
    const [totalPolls, activePolls, totalResponses] = await Promise.all([
      prisma.poll.count({ where: creator }),
      prisma.poll.count({
        where: {
          AND: [
            creator,
            {
              status: "ACTIVE",
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          ],
        },
      }),
      prisma.response.count({ where: { poll: { creator: { clerkUserId } } } }),
    ]);

    return { totalPolls, activePolls, totalResponses };
  } catch (error) {
    console.error("Database getMyPollsStats error:", error);
    throw new Error("Failed to get the polls stats.");
  }
};

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
