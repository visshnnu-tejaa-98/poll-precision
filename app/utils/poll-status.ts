export type EffectiveStatus = "active" | "draft" | "expired";

/**
 * Option A — derive a poll's status at read time instead of storing EXPIRED.
 * A poll whose `expiresAt` has passed is treated as expired even if the stored
 * `status` column is still ACTIVE. Single source of truth for every read.
 */
export function getEffectiveStatus(
  status: string,
  expiresAt: string | Date | null,
): EffectiveStatus {
  const raw = status.toLowerCase();
  if (raw === "expired") return "expired";
  if (raw === "draft") return "draft";
  if (expiresAt && new Date(expiresAt) <= new Date()) return "expired";
  return "active";
}
