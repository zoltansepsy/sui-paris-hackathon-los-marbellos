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

export class HandleNotFoundError extends Error {
  constructor(handle: string) {
    super(`Handle not found: ${handle}`);
    this.name = "HandleNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
