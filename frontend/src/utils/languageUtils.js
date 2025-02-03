// Regular expression to match Russian characters
const russianRegex = /[\u0400-\u04FF]/;

/**
 * Check if text contains Russian characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if text contains Russian characters
 */
export const isRussianText = (text) => {
  if (!text || typeof text !== "string") return false;
  return russianRegex.test(text);
};

/**
 * Determine the primary language of a text segment
 * @param {string} text - Text to analyze
 * @returns {string} - Language code ('ru' for Russian, 'en' for English, 'unknown' for others)
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== "string") return "unknown";

  const russianChars = (text.match(/[\u0400-\u04FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.length;

  // Calculate percentages of Russian and English characters
  const russianPercentage = (russianChars / totalChars) * 100;
  const englishPercentage = (englishChars / totalChars) * 100;

  // Text is considered Russian if it contains more than 30% Russian characters
  if (russianPercentage > 30) return "ru";
  // Text is considered English if it contains more than 30% English characters
  if (englishPercentage > 30) return "en";

  return "unknown";
};

/**
 * Clean and normalize text for translation
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
export const cleanText = (text) => {
  if (!text || typeof text !== "string") return "";

  // Remove extra whitespace
  text = text.trim().replace(/\s+/g, " ");

  // Remove special characters except punctuation
  text = text.replace(/[^\p{L}\p{N}\s.,!?;:'"()-]/gu, "");

  return text;
};
