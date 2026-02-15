/**
 * Zod schemas for creator registry handle validation.
 */

import { z } from "zod";

/** Handle must be 3–30 chars, lowercase alphanumeric with hyphens/underscores. */
export const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(30, "Handle must be at most 30 characters")
  .regex(
    /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/,
    "Handle must be lowercase alphanumeric (hyphens/underscores allowed, not at start/end)",
  );

export type HandleParam = z.infer<typeof handleSchema>;

export function parseHandle(raw: string): string {
  const result = handleSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid handle");
  }
  return result.data;
}
