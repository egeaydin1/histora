/**
 * Utility functions for handling API errors and validation errors
 */

export interface ApiError {
  message: string
  details?: string
  status?: number
}

export interface ValidationError {
  type?: string
  loc?: string[]
  msg?: string
  input?: any
  ctx?: any
}

/**
 * Safely convert any error to a display string
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message && typeof error.message === 'string') {
    return error.message
  }
  
  if (error?.msg && typeof error.msg === 'string') {
    return error.msg
  }
  
  if (error?.detail && typeof error.detail === 'string') {
    return error.detail
  }
  
  if (Array.isArray(error)) {
    // Handle validation error arrays from FastAPI
    return error.map(err => getErrorMessage(err)).join(', ')
  }
  
  // If it's a validation error object with specific fields
  if (error?.type && error?.msg) {
    const location = error.loc ? ` (${error.loc.join('.')})` : ''
    return `${error.msg}${location}`
  }
  
  // Fallback to generic message
  return 'An unexpected error occurred'
}

/**
 * Safely format validation errors from FastAPI
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (!Array.isArray(errors)) {
    return getErrorMessage(errors)
  }
  
  return errors.map(error => {
    const field = error.loc ? error.loc.join('.') : 'field'
    const message = error.msg || 'Invalid value'
    return `${field}: ${message}`
  }).join('; ')
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  return Array.isArray(error) || (error?.type && error?.msg)
}

/**
 * Safe error renderer for React components
 */
export function renderError(error: any): string {
  try {
    if (isValidationError(error)) {
      return formatValidationErrors(Array.isArray(error) ? error : [error])
    }
    return getErrorMessage(error)
  } catch (e) {
    return 'Error displaying error message'
  }
}
