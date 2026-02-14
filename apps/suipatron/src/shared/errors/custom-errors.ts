/**
 * Custom error classes for domain-specific errors.
 * Handle in API routes with proper HTTP status codes.
 */

export class CreatorNotFoundError extends Error {
  constructor(creatorId: string) {
    super(`Creator not found: ${creatorId}`);
    this.name = "CreatorNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
