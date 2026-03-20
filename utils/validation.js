/**
 * Input Validation Utilities
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation - accepts 10 digits, with or without formatting
const PHONE_REGEX = /^[0-9\s\-\+\(\)]{10,15}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number (10+ digits)
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove formatting characters and check length
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (password && password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Trim and validate string fields
 * @param {string} value - Value to sanitize
 * @param {string} fieldName - Name of field (for error messages)
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} - { isValid, value, error }
 */
export const validateStringField = (
  value,
  fieldName = 'Field',
  minLength = 1,
  maxLength = 500
) => {
  // Check if value exists
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      value: '',
      error: `${fieldName} is required`,
    };
  }

  // Trim whitespace
  const trimmedValue = value.trim();

  // Check if empty after trimming
  if (!trimmedValue) {
    return {
      isValid: false,
      value: '',
      error: `${fieldName} cannot be empty`,
    };
  }

  // Check length
  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      value: trimmedValue,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      value: trimmedValue,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return {
    isValid: true,
    value: trimmedValue,
    error: null,
  };
};

/**
 * Sanitize input to prevent injection attacks
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"']/g, '') // Remove HTML/JS special chars
    .trim();
};

/**
 * Validate array of strings
 * @param {array} arr - Array to validate
 * @param {string} fieldName - Field name
 * @returns {object} - { isValid, value, error }
 */
export const validateStringArray = (arr, fieldName = 'Items') => {
  if (!Array.isArray(arr)) {
    return {
      isValid: false,
      value: [],
      error: `${fieldName} must be an array`,
    };
  }

  if (arr.length === 0) {
    return {
      isValid: false,
      value: [],
      error: `${fieldName} cannot be empty`,
    };
  }

  const sanitized = arr
    .map((item) => sanitizeInput(String(item)))
    .filter((item) => item.length > 0);

  if (sanitized.length === 0) {
    return {
      isValid: false,
      value: [],
      error: `${fieldName} contains no valid items`,
    };
  }

  return {
    isValid: true,
    value: sanitized,
    error: null,
  };
};

/**
 * Validate number field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} - { isValid, value, error }
 */
export const validateNumberField = (
  value,
  fieldName = 'Number',
  min = 0,
  max = null
) => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (num < min) {
    return {
      isValid: false,
      value: num,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== null && num > max) {
    return {
      isValid: false,
      value: num,
      error: `${fieldName} must not exceed ${max}`,
    };
  }

  return {
    isValid: true,
    value: num,
    error: null,
  };
};

/**
 * Validate date
 * @param {string} dateStr - Date string
 * @param {string} fieldName - Field name
 * @returns {object} - { isValid, value, error }
 */
export const validateDate = (dateStr, fieldName = 'Date') => {
  if (!dateStr) {
    return {
      isValid: false,
      value: null,
      error: `${fieldName} is required`,
    };
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      value: null,
      error: `${fieldName} must be a valid date`,
    };
  }

  return {
    isValid: true,
    value: date,
    error: null,
  };
};
