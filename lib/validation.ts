/**
 * Input validation utilities
 * Provides validation functions for form inputs and data sanitization
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'Email must be less than 255 characters' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }

  // Check for at least one number and one letter
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  if (!hasNumber || !hasLetter) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter and one number',
    };
  }

  return { isValid: true };
};

/**
 * Validates project name
 */
export const validateProjectName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Project name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Project name must be at least 2 characters long' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Project name must be less than 100 characters' };
  }

  // Check for potentially dangerous characters
  const dangerousChars = /[<>{}[\]\\\/]/;
  if (dangerousChars.test(name)) {
    return {
      isValid: false,
      error: 'Project name contains invalid characters',
    };
  }

  return { isValid: true };
};

/**
 * Validates task title
 */
export const validateTaskTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Task title is required' };
  }

  if (title.trim().length < 2) {
    return { isValid: false, error: 'Task title must be at least 2 characters long' };
  }

  if (title.length > 200) {
    return { isValid: false, error: 'Task title must be less than 200 characters' };
  }

  return { isValid: true };
};

/**
 * Validates comment content
 */
export const validateComment = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' };
  }

  if (content.length > 5000) {
    return { isValid: false, error: 'Comment must be less than 5000 characters' };
  }

  return { isValid: true };
};

/**
 * Validates file upload
 */
export const validateFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): ValidationResult => {
  const { maxSizeMB = 10, allowedTypes = ['image/*', 'application/pdf', 'text/*'] } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const baseType = type.slice(0, -2);
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check for potentially dangerous file names
  const dangerousPatterns = /[<>:"|?*\x00-\x1f]/;
  if (dangerousPatterns.test(file.name)) {
    return {
      isValid: false,
      error: 'File name contains invalid characters',
    };
  }

  return { isValid: true };
};

/**
 * Validates URL
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use http or https protocol' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Sanitizes string input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous HTML tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Sanitizes object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        sanitized[key] = sanitized[key].map((item: any) =>
          typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
        ) as T[Extract<keyof T, string>];
      } else {
        sanitized[key] = sanitizeObject(sanitized[key]) as T[Extract<keyof T, string>];
      }
    }
  }

  return sanitized;
};
