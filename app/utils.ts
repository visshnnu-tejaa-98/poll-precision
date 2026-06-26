"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./lib/db";

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

export { getCurrentLoggedInUser };

export const formatDate = async (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
