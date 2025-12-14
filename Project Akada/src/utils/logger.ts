/**
 * Conditional Logger Utility
 *
 * Provides environment-aware logging that:
 * - Disables debug/info logs in production
 * - Always logs warnings and errors
 * - Sanitizes PII from log messages
 *
 * SECURITY: This utility prevents information disclosure in production builds
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Sanitize potentially sensitive data from log messages
 * Removes emails, user IDs, tokens, and other PII
 */
const sanitize = (message: any): any => {
  if (typeof message === 'string') {
    // Redact email addresses
    message = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');

    // Redact UUID-like patterns (user IDs, session IDs)
    message = message.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[ID_REDACTED]');

    // Redact JWT-like tokens
    message = message.replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[TOKEN_REDACTED]');

    return message;
  }

  if (typeof message === 'object' && message !== null) {
    // Sanitize object properties
    const sanitized: any = Array.isArray(message) ? [] : {};

    for (const key in message) {
      // Skip sensitive keys entirely
      if (/password|token|secret|key|auth|session/i.test(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      sanitized[key] = sanitize(message[key]);
    }

    return sanitized;
  }

  return message;
};

/**
 * Format log arguments for consistent output
 */
const formatArgs = (...args: any[]): any[] => {
  if (isProduction) {
    // In production, sanitize all arguments
    return args.map(sanitize);
  }

  // In development, log as-is for debugging
  return args;
};

/**
 * Logger utility with conditional logging based on environment
 */
export const logger = {
  /**
   * Debug logs - only in development
   * Use for detailed debugging information
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...formatArgs(...args));
    }
  },

  /**
   * Info logs - only in development
   * Use for general informational messages
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...formatArgs(...args));
    }
  },

  /**
   * Warning logs - always logged (sanitized in production)
   * Use for potential issues that don't prevent execution
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...formatArgs(...args));
  },

  /**
   * Error logs - always logged (sanitized in production)
   * Use for errors and exceptions
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...formatArgs(...args));
  },

  /**
   * Group logs - only in development
   * Use for grouping related log statements
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(`[GROUP] ${label}`);
    }
  },

  /**
   * End log group - only in development
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Table logs - only in development
   * Use for displaying tabular data
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Time tracking - only in development
   * Use for performance measurement
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(`[TIME] ${label}`);
    }
  },

  /**
   * End time tracking - only in development
   */
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[TIME] ${label}`);
    }
  }
};

/**
 * Disable all console methods in production
 * This provides additional protection against accidentally logging sensitive data
 */
if (isProduction) {
  // Override console methods to no-op in production
  // We keep warn and error for critical issues
  const noop = () => {};

  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.trace = noop;
  console.table = noop;
  console.group = noop;
  console.groupCollapsed = noop;
  console.groupEnd = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.timeLog = noop;
}

export default logger;
