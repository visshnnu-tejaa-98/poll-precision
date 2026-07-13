"use server";

import { prisma } from "../lib/db";
import { getCurrentLoggedInUser } from "../utils";

export const getReportsData = async () => {
  const { id: userId } = await getCurrentLoggedInUser();
  const now = new Date();
  const ownResponses = { poll: { creatorId: userId } };

  const days = 7;
  const dayMs = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - (days - 1) * dayMs);

  try {
    const [
      totalSubmissions,
      anonymousCount,
      distinctRespondents,
      totalPolls,
      activePolls,
      recent,
      topPolls,
      exportPolls,
    ] = await Promise.all([
      prisma.response.count({ where: ownResponses }),
      prisma.response.count({ where: { ...ownResponses, isAnonymous: true } }),
      prisma.response.findMany({
        where: { ...ownResponses, respondentId: { not: null } },
        distinct: ["respondentId"],
        select: { respondentId: true },
      }),
      prisma.poll.count({ where: { creatorId: userId } }),
      prisma.poll.count({
        where: {
          creatorId: userId,
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.response.findMany({
        where: { ...ownResponses, submittedAt: { gte: start } },
        select: { submittedAt: true },
      }),
      prisma.poll.findMany({
        where: { creatorId: userId },
        orderBy: { responses: { _count: "desc" } },
        take: 6,
        select: {
          id: true,
          title: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          _count: { select: { responses: true } },
        },
      }),
      prisma.poll.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          _count: { select: { responses: true } },
        },
      }),
    ]);

    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      buckets.set(new Date(today.getTime() - i * dayMs).toISOString().slice(0, 10), 0);
    }
    for (const r of recent) {
      const d = new Date(r.submittedAt);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const trend = [...buckets.entries()].map(([date, count]) => ({ date, count }));

    return {
      totalSubmissions,
      anonymousCount,
      authenticatedCount: totalSubmissions - anonymousCount,
      uniqueRespondents: distinctRespondents.length,
      totalPolls,
      activePolls,
      trend,
      topPolls: topPolls.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        responseCount: p._count.responses,
      })),
      exportPolls: exportPolls.map((p) => ({
        id: p.id,
        title: p.title,
        responseCount: p._count.responses,
      })),
    };
  } catch (error) {
    console.error("Database getReportsData error:", error);
    throw new Error("Failed to get the reports data.");
  }
};
