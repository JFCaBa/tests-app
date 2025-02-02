import { body, query } from "express-validator";

export const chatValidationRules = {
  createMessage: [
    body("text").trim().notEmpty().withMessage("Message text is required"),
    body("isUser").isBoolean().withMessage("isUser must be a boolean"),
    body("subject")
      .optional()
      .isIn([
        "listening",
        "grammar",
        "history",
        "laws",
        "reading",
        "writing",
        null,
      ])
      .withMessage("Invalid subject"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Invalid timestamp format"),
    body("isError")
      .optional()
      .isBoolean()
      .withMessage("isError must be a boolean"),
  ],

  getMessages: [
    query("subject")
      .optional()
      .isIn(["listening", "grammar", "history", "laws", "reading", "writing"])
      .withMessage("Invalid subject"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("before")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format for before parameter"),
  ],

  cleanup: [
    body("daysToKeep")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("daysToKeep must be between 1 and 365"),
  ],
};
