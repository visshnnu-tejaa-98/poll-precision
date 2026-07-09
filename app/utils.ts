"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./lib/db";
import { getAllPollsByUserId } from "./actions/poll";
import { getAllResponsesByUserId } from "./actions/responses";

type Trend = { value: string; direction?: "up" | "down"; tone: string };

type StatCard = {
  label: string;
  value: string;
  icon: string;
  iconWrap: string;
  ringTint: string;
  trend: Trend;
};

const getCurrentLoggedInUser = async () => {
  const clerk = await currentUser();
  if (!clerk) throw new Error("User not authenticated");

  const email = clerk.emailAddresses[0]?.emailAddress;
  if (!email || !clerk.firstName || !clerk.lastName) {
    throw new Error("Clerk profile is missing firstName, lastName, or email");
  }

  const dbUser = await prisma.user.upsert({
    where: { email },
    update: {
      clerkUserId: clerk.id,
      firstName: clerk.firstName,
      lastName: clerk.lastName,
    },
    create: {
      firstName: clerk.firstName,
      lastName: clerk.lastName,
      email,
      clerkUserId: clerk.id,
    },
  });

  return {
    id: dbUser.id,
    clerkUserId: clerk.id,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
  };
};

const formatDate = async (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatsDetails = async () => {
  const polls = await getAllPollsByUserId();

  const totalPolls = polls.length;

  const responses = await getAllResponsesByUserId();
  const totalResponses = responses.length;

  const STATS: StatCard[] = [
    {
      label: "Total Polls",
      value: totalPolls.toString(),
      icon: "ballot",
      iconWrap: "bg-surface-container text-primary",
      ringTint: "bg-primary/5",
      trend: { value: "12%", direction: "up", tone: "text-primary" },
    },
    {
      label: "Total Responses",
      value: totalResponses.toString(),
      icon: "group",
      iconWrap: "bg-secondary-container/10 text-secondary",
      ringTint: "bg-secondary/5",
      trend: { value: "8.4%", direction: "up", tone: "text-secondary" },
    },
    {
      label: "Avg Participation",
      value: "68%",
      icon: "data_usage",
      iconWrap: "bg-surface-container text-tertiary",
      ringTint: "bg-tertiary/5",
      trend: { value: "2.1%", direction: "down", tone: "text-error" },
    },
  ];

  return STATS;
};

export { getCurrentLoggedInUser, formatDate, getStatsDetails };
