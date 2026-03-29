/**
 * Retry queue with exponential backoff for resilient async operations
 * Useful for external API calls that may fail transiently
 */

export type RetryableOperation<T> = () => Promise<T>;

export type RetryConfig = {
  maxAttempts: number; // Maximum number of retry attempts (default 3)
  initialDelayMs: number; // Initial delay in milliseconds (default 100ms)
  maxDelayMs: number; // Maximum backoff delay in milliseconds (default 30s)
  backoffMultiplier: number; // Exponential backoff multiplier (default 2)
  timeoutMs?: number; // Per-attempt timeout in milliseconds
};

export type RetryResult<T> = {
  success: boolean;
  data?: T;
  error?: Error;
  attemptsMade: number;
  totalDurationMs: number;
};

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Execute operation with exponential backoff retry
 *
 * @example
 * const result = await retryWithBackoff(
 *   async () => sendEmail(config),
 *   {
 *     maxAttempts: 3,
 *     initialDelayMs: 100,
 *     maxDelayMs: 10000,
 *   }
 * );
 *
 * if (result.success) {
 *   console.log('Email sent:', result.data);
 * } else {
 *   console.error(`Failed after ${result.attemptsMade} attempts:`, result.error);
 * }
 */
export async function retryWithBackoff<T>(
  operation: RetryableOperation<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: Error | undefined;
  let delay = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      // Execute operation with optional timeout
      let promise: Promise<T> = operation();

      if (finalConfig.timeoutMs) {
        promise = Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Operation timeout after ${finalConfig.timeoutMs}ms`)),
              finalConfig.timeoutMs
            )
          ),
        ]);
      }

      const data = await promise;

      return {
        success: true,
        data,
        attemptsMade: attempt,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < finalConfig.maxAttempts) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(
          Math.floor(delay * finalConfig.backoffMultiplier),
          finalConfig.maxDelayMs
        );
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error("Operation failed after all retry attempts"),
    attemptsMade: finalConfig.maxAttempts,
    totalDurationMs: Date.now() - startTime,
  };
}

/**
 * Batch execute operations with retry, collecting results
 * Useful for processing multiple async tasks with error handling
 */
export async function retryBatch<T>(
  operations: Array<{ id: string; operation: RetryableOperation<T> }>,
  config: Partial<RetryConfig> = {}
): Promise<
  Array<{
    id: string;
    result: RetryResult<T>;
  }>
> {
  return Promise.all(
    operations.map(async ({ id, operation }) => ({
      id,
      result: await retryWithBackoff(operation, config),
    }))
  );
}

/**
 * Count successes and failures from batch results
 */
export function countRetryResults<T>(
  results: Array<{
    id: string;
    result: RetryResult<T>;
  }>
): { succeeded: number; failed: number } {
  let succeeded = 0;
  let failed = 0;

  results.forEach(({ result }) => {
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  });

  return { succeeded, failed };
}
