/**
 * Error handling utilities for Supabase operations
 * Provides user-friendly error messages and retry mechanisms
 */

import { PostgrestError } from '@supabase/supabase-js';

export interface ErrorInfo {
  message: string;
  type: 'rls' | 'network' | 'validation' | 'permission' | 'not_found' | 'unknown';
  retryable: boolean;
  originalError?: any;
}

/**
 * Detects if an error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check for common network error patterns
  if (error.message) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('timeout') ||
      msg.includes('connection') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror')
    );
  }
  
  // Check for fetch API errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  return false;
};

/**
 * Detects if an error is an RLS (Row Level Security) policy violation
 */
export const isRLSError = (error: any): boolean => {
  if (!error) return false;
  
  // Supabase RLS errors typically have:
  // - code: '42501' (insufficient_privilege)
  // - message containing 'permission denied' or 'row-level security'
  // - hint containing 'policy'
  
  if (error.code === '42501') return true;
  
  if (error.message) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('permission denied') ||
      msg.includes('row-level security') ||
      msg.includes('policy violation') ||
      msg.includes('new row violates row-level security policy')
    );
  }
  
  if (error.hint) {
    const hint = error.hint.toLowerCase();
    return hint.includes('policy');
  }
  
  return false;
};

/**
 * Detects if an error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  if (!error) return false;
  
  // Supabase validation errors typically have:
  // - code: '23505' (unique_violation), '23503' (foreign_key_violation), '23502' (not_null_violation)
  const validationCodes = ['23505', '23503', '23502', '22P02', '42703'];
  
  if (error.code && validationCodes.includes(error.code)) {
    return true;
  }
  
  if (error.message) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('violates') ||
      msg.includes('constraint') ||
      msg.includes('invalid') ||
      msg.includes('required')
    );
  }
  
  return false;
};

/**
 * Detects if an error is a "not found" error
 */
export const isNotFoundError = (error: any): boolean => {
  if (!error) return false;
  
  if (error.code === 'PGRST116') return true; // PostgREST "not found" code
  
  if (error.message) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('not found') ||
      msg.includes('does not exist') ||
      msg.includes('no rows')
    );
  }
  
  return false;
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error)) return true;
  
  // RLS errors are not retryable (permission issue won't change)
  if (isRLSError(error)) return false;
  
  // Validation errors are not retryable (data issue won't change)
  if (isValidationError(error)) return false;
  
  // Not found errors are not retryable
  if (isNotFoundError(error)) return false;
  
  // Server errors (5xx) are retryable
  if (error.code && error.code.startsWith('5')) return true;
  
  // Timeout errors are retryable
  if (error.message?.toLowerCase().includes('timeout')) return true;
  
  return false;
};

/**
 * Converts a Supabase/PostgREST error into a user-friendly message
 */
export const getUserFriendlyErrorMessage = (error: any, context?: string): ErrorInfo => {
  // Network errors
  if (isNetworkError(error)) {
    return {
      message: 'Network connection error. Please check your internet connection and try again.',
      type: 'network',
      retryable: true,
      originalError: error,
    };
  }
  
  // RLS errors
  if (isRLSError(error)) {
    const contextMsg = context ? ` (${context})` : '';
    return {
      message: `You don't have permission to perform this action${contextMsg}. Please contact your administrator if you believe this is an error.`,
      type: 'rls',
      retryable: false,
      originalError: error,
    };
  }
  
  // Validation errors
  if (isValidationError(error)) {
    let message = 'Invalid data provided. Please check your input and try again.';
    
    if (error.code === '23505') {
      message = 'This record already exists. Please use a different value.';
    } else if (error.code === '23503') {
      message = 'Cannot perform this action because it references a record that does not exist.';
    } else if (error.code === '23502') {
      message = 'Required fields are missing. Please fill in all required fields.';
    } else if (error.hint) {
      message = `Validation error: ${error.hint}`;
    }
    
    return {
      message,
      type: 'validation',
      retryable: false,
      originalError: error,
    };
  }
  
  // Not found errors
  if (isNotFoundError(error)) {
    return {
      message: 'The requested item could not be found. It may have been deleted or you may not have access to it.',
      type: 'not_found',
      retryable: false,
      originalError: error,
    };
  }
  
  // Permission errors (other than RLS)
  if (error.code === '42501' || error.message?.toLowerCase().includes('permission')) {
    return {
      message: 'You don\'t have permission to perform this action. Please contact your administrator.',
      type: 'permission',
      retryable: false,
      originalError: error,
    };
  }
  
  // Generic Supabase error
  if (error.message) {
    return {
      message: error.message,
      type: 'unknown',
      retryable: isRetryableError(error),
      originalError: error,
    };
  }
  
  // Fallback
  return {
    message: 'An unexpected error occurred. Please try again later.',
    type: 'unknown',
    retryable: true,
    originalError: error,
  };
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    retryable?: (error: any) => boolean;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    retryable = isRetryableError,
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!retryable(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Wraps a Supabase operation with error handling and retry logic
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: string
): Promise<T> => {
  try {
    const { data, error } = await retryWithBackoff(async () => {
      const result = await operation();
      if (result.error) {
        throw result.error;
      }
      return result;
    });
    
    if (error) {
      throw error;
    }
    
    if (data === null) {
      throw new Error('No data returned from operation');
    }
    
    return data;
  } catch (error) {
    const errorInfo = getUserFriendlyErrorMessage(error, context);
    console.error(`Error in ${context || 'operation'}:`, {
      message: errorInfo.message,
      type: errorInfo.type,
      originalError: errorInfo.originalError,
    });
    
    // Create a new error with user-friendly message
    const friendlyError = new Error(errorInfo.message);
    (friendlyError as any).errorInfo = errorInfo;
    throw friendlyError;
  }
};
