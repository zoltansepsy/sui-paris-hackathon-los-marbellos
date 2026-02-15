/**
 * Subscription status utilities for expiry display and state indicators.
 */

export type SubscriptionStatus =
  | "active"
  | "expiring"
  | "expired"
  | "permanent";

const EXPIRING_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function getSubscriptionStatus(
  expiresAt: number | null,
): SubscriptionStatus {
  if (expiresAt === null) return "permanent";
  const now = Date.now();
  if (expiresAt <= now) return "expired";
  if (expiresAt <= now + EXPIRING_THRESHOLD_MS) return "expiring";
  return "active";
}

export function formatExpiry(expiresAt: number | null): string {
  if (expiresAt === null) return "Permanent access";
  const now = Date.now();
  if (expiresAt <= now) return "Expired";
  const days = Math.ceil((expiresAt - now) / 86400000);
  if (days <= 1) {
    const hours = Math.ceil((expiresAt - now) / 3600000);
    return `Expires in ${hours}h`;
  }
  return `Expires in ${days}d`;
}

export function formatExpiryDate(expiresAt: number | null): string {
  if (expiresAt === null) return "Never";
  return new Date(expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
