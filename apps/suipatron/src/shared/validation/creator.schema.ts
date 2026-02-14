/**
 * Zod schemas for creator API validation.
 */

import { z } from "zod";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const creatorsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .default(DEFAULT_LIMIT),
  cursor: z.string().optional(),
});

export type CreatorsQuery = z.infer<typeof creatorsQuerySchema>;

export function parseCreatorsQuery(
  searchParams: URLSearchParams,
): CreatorsQuery {
  const limit = searchParams.get("limit");
  const cursor = searchParams.get("cursor") ?? undefined;
  const parsed = creatorsQuerySchema.safeParse({
    limit: limit ?? DEFAULT_LIMIT,
    cursor,
  });
  if (!parsed.success) {
    return { limit: DEFAULT_LIMIT, cursor };
  }
  return parsed.data;
}
