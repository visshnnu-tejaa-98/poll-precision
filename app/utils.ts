"use server";

import { currentUser } from "@clerk/nextjs/server";

const getCurrentLoggedInUser = async () => {
  const user = await currentUser();
  if (!user) throw Error("User not found");
  const { firstName, lastName } = user;
  const email = user.emailAddresses[0].emailAddress;
  return {
    firstName,
    lastName,
    email,
  };
};

export { getCurrentLoggedInUser };
