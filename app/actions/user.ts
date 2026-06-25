"use server";

import { prisma } from "../lib/db";
import { CreateUserServerActionProps } from "../types";

const createUser = async (props: CreateUserServerActionProps) => {
  const { firstName, lastName, email } = props;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      firstName,
      lastName,
      email,
    },
  });
  console.log({ user });
  return user.id;
};

export { createUser };
