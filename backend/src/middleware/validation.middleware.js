import { body, param, query, validationResult } from "express-validator";

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
export const userValidationRules = {
  register: [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers and underscores"
      ),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),
  ],
  login: [
    body("email").trim().isEmail().withMessage("Must be a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

// Question validation rules
export const questionValidationRules = {
  create: [
    body("subject")
      .isIn(["listening", "grammar", "history", "laws", "reading", "writing"])
      .withMessage("Invalid subject"),
    body("type")
      .isIn(["multiple-choice", "writing", "audio"])
      .withMessage("Invalid question type"),
    body("question").trim().notEmpty().withMessage("Question text is required"),
    body("options")
      .optional()
      .isArray()
      .withMessage("Options must be an array"),
    body("options.*.text")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Option text cannot be empty"),
    body("correctAnswer")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Correct answer must be a valid option index"),
    body("difficulty")
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty level"),
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid question ID"),
    body("subject")
      .optional()
      .isIn(["listening", "grammar", "history", "laws", "reading", "writing"])
      .withMessage("Invalid subject"),
    body("type")
      .optional()
      .isIn(["multiple-choice", "writing", "audio"])
      .withMessage("Invalid question type"),
  ],
};

// Test validation rules
export const testValidationRules = {
  start: [
    body("subject")
      .isIn([
        "listening",
        "grammar",
        "history",
        "laws",
        "reading",
        "writing",
        "all",
      ])
      .withMessage("Invalid subject"),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty level"),
    body("questionCount")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Question count must be between 1 and 50"),
  ],
  submit: [
    body("testId").isMongoId().withMessage("Invalid test ID"),
    body("answers").isArray().withMessage("Answers must be an array"),
    body("answers.*.questionId").isMongoId().withMessage("Invalid question ID"),
    body("answers.*.answer").notEmpty().withMessage("Answer cannot be empty"),
    body("timeSpent")
      .isInt({ min: 0 })
      .withMessage("Time spent must be a positive number"),
  ],
};

// Query validation rules
export const queryValidationRules = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  search: [
    query("subject")
      .optional()
      .isIn(["listening", "grammar", "history", "laws", "reading", "writing"])
      .withMessage("Invalid subject"),
    query("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty level"),
    query("type")
      .optional()
      .isIn(["multiple-choice", "writing", "audio"])
      .withMessage("Invalid question type"),
  ],
};
