/**
 * End-to-End Software Error Classifier & Diagnostic Engine
 * Classifies errors into Layer, Category, Severity, Error Code, and Suggested Fix.
 */

export const ERROR_LAYERS = {
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  EXTERNAL_SERVICES: 'EXTERNAL_SERVICES'
};

export const ERROR_SEVERITIES = {
  CRITICAL: 'CRITICAL', // 🔴 Application / Payment / Auth completely broken
  ERROR: 'ERROR',       // 🟠 Important feature failed
  WARNING: 'WARNING',   // 🟡 Minor issue / fallback active
  INFO: 'INFO',         // 🔵 System info
  DEBUG: 'DEBUG'        // ⚪ Debug payload
};

export const ERROR_CATEGORIES = {
  SYNTAX: 'SYNTAX_ERROR',
  REFERENCE: 'REFERENCE_ERROR',
  TYPE: 'TYPE_ERROR',
  RANGE: 'RANGE_ERROR',
  LOGIC: 'LOGIC_ERROR',
  RUNTIME: 'RUNTIME_ERROR',
  BUILD: 'BUILD_ERROR',
  IMPORT: 'IMPORT_ERROR',
  DEPENDENCY: 'DEPENDENCY_ERROR',
  CONFIGURATION: 'CONFIGURATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  HTTP: 'HTTP_ERROR',
  DATABASE: 'DATABASE_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SECURITY: 'SECURITY_ERROR',
  PERFORMANCE: 'PERFORMANCE_ERROR',
  CORS: 'CORS_ERROR',
  STATE: 'STATE_MISMATCH_ERROR',
  VIBE_CODING: 'VIBE_CODING_AI_ERROR',
  RENDER: 'REACT_RENDER_ERROR'
};

/**
 * Classifies an raw JavaScript Error or API Response into structured diagnostic data.
 * @param {Error|Object|string} err
 * @returns {Object} Classified error diagnostic
 */
export function classifyError(err) {
  const timestamp = new Date().toISOString();
  const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  let rawMessage = err?.message || (typeof err === 'string' ? err : 'An unknown error occurred');
  let stack = err?.stack || '';
  let name = err?.name || 'Error';
  let httpStatus = err?.response?.status || err?.status || null;
  let endpoint = err?.config?.url || null;

  let layer = ERROR_LAYERS.FRONTEND;
  let category = ERROR_CATEGORIES.RUNTIME;
  let severity = ERROR_SEVERITIES.ERROR;
  let code = 'ERR_UNKNOWN';
  let userMessage = 'Something went wrong. Please try again or refresh the page.';
  let suggestedFix = 'Inspect the browser console logs and verify network connection.';

  // 1. Network & CORS Errors
  if (!err?.response && (rawMessage.includes('Network Error') || rawMessage.includes('Failed to fetch') || err?.code === 'ERR_NETWORK')) {
    layer = ERROR_LAYERS.NETWORK;
    category = ERROR_CATEGORIES.NETWORK;
    severity = ERROR_SEVERITIES.CRITICAL;
    code = 'ERR_NETWORK_DISCONNECTED';
    userMessage = 'Unable to connect to the backend server. Please check your internet connection or backend service status.';
    suggestedFix = 'Verify that the backend server is running at VITE_API_BASE_URL and CORS headers allow this origin.';
  } else if (rawMessage.includes('CORS') || rawMessage.includes('Access-Control-Allow-Origin')) {
    layer = ERROR_LAYERS.INFRASTRUCTURE;
    category = ERROR_CATEGORIES.CORS;
    severity = ERROR_SEVERITIES.CRITICAL;
    code = 'ERR_CORS_BLOCKED';
    userMessage = 'Cross-Origin Request Blocked by browser security policy.';
    suggestedFix = 'Add your frontend domain (e.g. http://localhost:5173) to process.env.ALLOWED_ORIGINS in the backend app.js cors options.';
  }
  // 2. HTTP Status Code Errors
  else if (httpStatus) {
    layer = ERROR_LAYERS.BACKEND;
    category = ERROR_CATEGORIES.HTTP;

    if (httpStatus === 401) {
      category = ERROR_CATEGORIES.AUTHENTICATION;
      severity = ERROR_SEVERITIES.ERROR;
      code = 'ERR_AUTH_UNAUTHORIZED';
      userMessage = 'Your session has expired or you are not logged in. Please sign in again.';
      suggestedFix = 'Check Supabase Auth access token validity or re-authenticate via the Login page.';
    } else if (httpStatus === 403) {
      category = ERROR_CATEGORIES.AUTHORIZATION;
      severity = ERROR_SEVERITIES.ERROR;
      code = 'ERR_AUTH_FORBIDDEN';
      userMessage = 'You do not have permission to perform this operation.';
      suggestedFix = 'Verify user roles (admin vs customer) and MFA verification status.';
    } else if (httpStatus === 404) {
      severity = ERROR_SEVERITIES.WARNING;
      code = 'ERR_HTTP_NOT_FOUND';
      userMessage = 'The requested resource or endpoint was not found.';
      suggestedFix = 'Check backend route definition in src/routes and verify API URL path.';
    } else if (httpStatus === 400 || httpStatus === 422) {
      category = ERROR_CATEGORIES.VALIDATION;
      severity = ERROR_SEVERITIES.WARNING;
      code = 'ERR_VALIDATION_FAILED';
      userMessage = err?.response?.data?.message || 'Invalid input payload provided.';
      suggestedFix = 'Ensure form fields adhere to required Zod/Mongoose schema rules.';
    } else if (httpStatus >= 500) {
      severity = ERROR_SEVERITIES.CRITICAL;
      code = 'ERR_INTERNAL_SERVER';
      userMessage = 'A backend server error occurred. Our team has been notified.';
      suggestedFix = 'Check backend server console/Winston logs for unhandled exceptions or database connection issues.';
    }
  }
  // 3. JavaScript Native Error Types
  else if (name === 'TypeError') {
    category = ERROR_CATEGORIES.TYPE;
    code = 'ERR_TYPE_MISMATCH';
    userMessage = 'A data type error occurred in the application interface.';
    suggestedFix = 'Verify that variable references exist before calling methods on them (e.g. use optional chaining `user?.name`).';
  } else if (name === 'ReferenceError') {
    category = ERROR_CATEGORIES.REFERENCE;
    code = 'ERR_REFERENCE_UNDEFINED';
    userMessage = 'Referenced variable or function is not defined.';
    suggestedFix = 'Ensure the variable/module is correctly defined and imported in the scope.';
  } else if (name === 'SyntaxError') {
    category = ERROR_CATEGORIES.SYNTAX;
    code = 'ERR_SYNTAX_INVALID';
    userMessage = 'Syntax parsing error encountered.';
    suggestedFix = 'Check JSON.parse strings or code block syntax for invalid characters.';
  }

  // 4. Vibe-Coding / AI Specific Patterns (Hallucinated APIs, state mismatches)
  if (rawMessage.includes('is not a function') || rawMessage.includes('Cannot read properties of undefined')) {
    category = ERROR_CATEGORIES.VIBE_CODING;
    code = 'ERR_AI_API_MISMATCH';
    suggestedFix = 'Verify component prop signatures, API response data shapes, or library version methods.';
  }

  return {
    errorId,
    timestamp,
    layer,
    category,
    severity,
    code,
    name,
    message: rawMessage,
    userMessage,
    httpStatus,
    endpoint,
    suggestedFix,
    stack
  };
}
