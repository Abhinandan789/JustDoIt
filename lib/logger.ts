/**
 * Structured logging and error handling utilities
 * Provides consistent error formatting, request tracking, and severity levels
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogEntry = {
  level: LogLevel;
  timestamp: string;
  service: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
  requestId?: string;
  duration?: number; // Duration in milliseconds
};

export type LoggerConfig = {
  service: string;
  isDevelopment: boolean;
};

/**
 * Structured logger with consistent formatting
 * Particularly useful for production debugging and error tracking
 */
export class Logger {
  private service: string;
  private isDevelopment: boolean;

  constructor(config: LoggerConfig) {
    this.service = config.service;
    this.isDevelopment = config.isDevelopment;
  }

  private formatError(error: unknown): LogEntry["error"] | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return {
      name: "UnknownError",
      message: String(error),
    };
  }

  private createEntry(
    level: LogLevel,
    message: string,
    options?: {
      error?: unknown;
      meta?: Record<string, unknown>;
      requestId?: string;
      duration?: number;
    }
  ): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      service: this.service,
      message,
      error: this.formatError(options?.error),
      meta: options?.meta,
      requestId: options?.requestId,
      duration: options?.duration,
    };
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: colorize and pretty-print
      console.log(`[${entry.timestamp}] [${entry.level}] ${entry.service}: ${entry.message}`, {
        error: entry.error,
        meta: entry.meta,
      });
    } else {
      // Production: JSON for log aggregation services (DataDog, Cloudwatch, etc.)
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, options?: Parameters<typeof this.createEntry>[2]): void {
    const entry = this.createEntry("DEBUG", message, options);
    this.output(entry);
  }

  info(message: string, options?: Parameters<typeof this.createEntry>[2]): void {
    const entry = this.createEntry("INFO", message, options);
    this.output(entry);
  }

  warn(message: string, options?: Parameters<typeof this.createEntry>[2]): void {
    const entry = this.createEntry("WARN", message, options);
    this.output(entry);
  }

  error(message: string, error?: unknown, options?: Omit<Parameters<typeof this.createEntry>[2], "error">): void {
    const entry = this.createEntry("ERROR", message, { ...options, error });
    this.output(entry);
  }

  /**
   * Track operation duration
   * Useful for performance monitoring
   *
   * @example
   * const duration = logger.startTimer();
   * await operation();
   * logger.info("Operation completed", { duration: duration() });
   */
  startTimer() {
    const startTime = Date.now();
    return () => Date.now() - startTime;
  }
}

/**
 * Centralized error handler for consistent error responses
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };
  }
}

/**
 * Validate operation and throw AppError if fails
 */
export function assert(
  condition: boolean,
  message: string,
  statusCode: number = 400,
  code?: string
): asserts condition {
  if (!condition) {
    throw new AppError(message, statusCode, code);
  }
}

/**
 * Global service logger instance
 */
let globalLogger: Logger | null = null;

export function setGlobalLogger(config: LoggerConfig): Logger {
  globalLogger = new Logger(config);
  return globalLogger;
}

export function getGlobalLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger({
      service: "app",
      isDevelopment: process.env.NODE_ENV !== "production",
    });
  }
  return globalLogger;
}

/**
 * Factory for creating service-specific loggers
 */
export function createServiceLogger(service: string): Logger {
  return new Logger({
    service,
    isDevelopment: process.env.NODE_ENV !== "production",
  });
}
