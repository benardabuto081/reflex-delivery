export type DeliveryStatus = "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED";

/**
 * Defines every VALID transition a delivery can make.
 * This is the single source of truth for the delivery lifecycle -
 * nowhere else in the codebase should directly decide whether a
 * status change is allowed.
 */
const ALLOWED_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  PENDING: ["ASSIGNED"],
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["DELIVERED"],
  DELIVERED: [], // terminal state - nothing can follow it
};

export class InvalidTransitionError extends Error {
  constructor(from: DeliveryStatus, to: DeliveryStatus) {
    super(`Cannot transition delivery from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

/**
 * Checks whether a transition from one status to another is allowed.
 * Pure function - no side effects, easy to unit test in isolation.
 */
export function canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Validates a transition and throws a descriptive error if it's not
 * allowed. Callers (the service layer) use this rather than
 * re-implementing the check themselves.
 */
export function assertValidTransition(from: DeliveryStatus, to: DeliveryStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
