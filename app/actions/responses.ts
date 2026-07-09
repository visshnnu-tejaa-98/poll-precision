"use server";

import { prisma } from "../lib/db";
import { Prisma } from "../generated/prisma/client";
import { getCurrentLoggedInUser } from "../utils";
import type { SubmissionsPageRequest } from "./submission-filters";

export const getAllResponsesByUserId = async () => {
  const { id } = await getCurrentLoggedInUser();

  try {
    const responsesData = await prisma.response.findMany({
      where: {
        poll: {
          creatorId: id,
        },
      },
      include: {
        poll: true,
      },
    });
    return responsesData.map((response) => ({
      ...response,
    }));
  } catch (error) {
    console.error("Database getResponses error:", error);
    throw new Error("Failed to get the responses data.");
  }
};

export const getMySubmissionsPaginated = async (
  args: SubmissionsPageRequest,
) => {
  const { id: userId } = await getCurrentLoggedInUser();

  const page = Math.max(1, Math.floor(args.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Math.floor(args.pageSize) || 10));
  const q = (args.query ?? "").trim();

  const where: Prisma.ResponseWhereInput = { poll: { creatorId: userId } };

  if (q) {
    // Respondent search needs matching user ids first (no Response→User relation).
    const matchingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    where.OR = [
      { poll: { title: { contains: q, mode: "insensitive" } } },
      { respondentId: { in: matchingUsers.map((u) => u.id) } },
    ];
  }

  try {
    const [responses, total] = await Promise.all([
      prisma.response.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          pollId: true,
          respondentId: true,
          isAnonymous: true,
          submittedAt: true,
          poll: { select: { title: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.response.count({ where }),
    ]);

    // Resolve respondent identities in one extra query.
    const ids = [
      ...new Set(
        responses
          .map((r) => r.respondentId)
          .filter((v): v is string => Boolean(v)),
      ),
    ];
    const users = ids.length
      ? await prisma.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    return {
      rows: responses.map((r) => {
        const u = r.respondentId ? userById.get(r.respondentId) : undefined;
        const name = u ? `${u.firstName} ${u.lastName}`.trim() : "";
        return {
          id: r.id,
          pollId: r.pollId,
          pollTitle: r.poll.title,
          respondentName: name || (u?.email ?? "Anonymous"),
          respondentEmail: u?.email ?? null,
          isAnonymous: r.isAnonymous || !u,
          answerCount: r._count.answers,
          submittedAt: r.submittedAt.toISOString(),
        };
      }),
      total,
    };
  } catch (error) {
    console.error("Database getMySubmissionsPaginated error:", error);
    throw new Error("Failed to get the submissions data.");
  }
};

export const getMySubmissionsStats = async () => {
  const { id: userId } = await getCurrentLoggedInUser();
  const now = new Date();
  const base: Prisma.ResponseWhereInput = { poll: { creatorId: userId } };

  try {
    const [totalSubmissions, anonymousCount, distinctRespondents, activePolls] =
      await Promise.all([
        prisma.response.count({ where: base }),
        prisma.response.count({ where: { ...base, isAnonymous: true } }),
        prisma.response.findMany({
          where: { ...base, respondentId: { not: null } },
          distinct: ["respondentId"],
          select: { respondentId: true },
        }),
        prisma.poll.count({
          where: {
            creatorId: userId,
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
      ]);

    return {
      totalSubmissions,
      anonymousCount,
      uniqueRespondents: distinctRespondents.length,
      activePolls,
    };
  } catch (error) {
    console.error("Database getMySubmissionsStats error:", error);
    throw new Error("Failed to get the submissions stats.");
  }
};
