// Import all middleware
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "./auth.middleware.js";
import {
  uploadAudio,
  uploadImage,
  uploadMultiple,
  handleUploadError,
} from "./upload.middleware.js";
import {
  validate,
  userValidationRules,
  questionValidationRules,
  testValidationRules,
  queryValidationRules,
} from "./validation.middleware.js";
import {
  notFound,
  errorHandler,
  asyncHandler,
  ErrorResponse,
} from "./error.middleware.js";

// Export authentication middleware
export const auth = {
  required: authenticateToken,
  optional: optionalAuth,
  admin: requireAdmin,
};

// Export upload middleware
export const upload = {
  audio: uploadAudio,
  image: uploadImage,
  multiple: uploadMultiple,
  handleError: handleUploadError,
};

// Export validation middleware
export const validation = {
  validate,
  rules: {
    user: userValidationRules,
    question: questionValidationRules,
    test: testValidationRules,
    query: queryValidationRules,
  },
};

// Export error handling middleware
export const errors = {
  notFound,
  handler: errorHandler,
  asyncHandler,
  ErrorResponse,
};

// Export everything as a single object as well
export default {
  auth,
  upload,
  validation,
  errors,
};
