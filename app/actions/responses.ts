"use server";

import { prisma } from "../lib/db";
import { getCurrentLoggedInUser } from "../utils";

export const getAllResponsesByUserId = async () => {
  const { id } = await getCurrentLoggedInUser();
  console.log(1111);

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
