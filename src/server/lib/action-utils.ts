/**
 * Shared types and utilities for server actions.
 */

/** Standard return type for all server actions */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/** Helper to create a success result */
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/** Helper to create an error result */
export function fail(error: string): ActionResult<never> {
  return { success: false, error }
}
