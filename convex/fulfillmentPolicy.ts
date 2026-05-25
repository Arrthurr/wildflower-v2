/** Fulfillment retry policy shared by Convex fulfillment + cron jobs. */

export const MAX_FULFILLMENT_RETRIES = 5;
export const STUCK_ORDER_AGE_MS = 15 * 60 * 1000;

/** Delay before retry attempt N (1-based), capped at 30 minutes. */
export function fulfillmentRetryDelayMs(failedAttempts: number): number {
  const seconds = Math.min(30 * 2 ** Math.max(failedAttempts - 1, 0), 1800);
  return seconds * 1000;
}

export function isRetryablePrintfulHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export function isRetryablePrintfulErrorMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("timeout") ||
    lower.includes("temporarily") ||
    lower.includes("try again") ||
    lower.includes("rate limit")
  );
}

export function classifyPrintfulSubmissionFailure(
  httpStatus: number,
  payload: string,
): { retryable: boolean; message: string } {
  const message = payload.slice(0, 2000);
  if (isRetryablePrintfulHttpStatus(httpStatus)) {
    return { retryable: true, message };
  }
  if (httpStatus >= 400 && httpStatus < 500) {
    if (isRetryablePrintfulErrorMessage(message)) {
      return { retryable: true, message };
    }
    return { retryable: false, message };
  }
  return { retryable: true, message };
}
