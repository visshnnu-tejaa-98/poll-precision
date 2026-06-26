import { type ZodType } from "zod";
import { ValidationError } from "../utils/api-error";

export const validate = async <T>(
  schema: ZodType<T>,
  payload: unknown,
): Promise<T> => {
  const result = await schema.safeParseAsync(payload);
  if (!result.success)
    throw new ValidationError(result.error.flatten().fieldErrors);
  return result.data;
};
