/**
 * Formats coach responses to ensure proper formatting
 * @param {string} text The text to format
 * @returns {string} Formatted text
 */
export const formatCoachResponse = (text) => {
  if (!text) return "";

  // Ensure lists are properly formatted
  text = text.replace(/(?:^|\n)[-*•]\s+/g, "\n• "); // Unordered lists
  text = text.replace(/(?:^|\n)(\d+)\.\s+/g, "\n$1. "); // Ordered lists

  // Ensure proper spacing around lists
  text = text.replace(/(\n[•\d].*?)(\n[^•\d])/g, "$1\n\n$2");

  // Ensure proper paragraph spacing
  text = text.replace(/\n{3,}/g, "\n\n");

  // Ensure spacing after headings (if any)
  text = text.replace(/([A-Za-z])\n([•\d])/g, "$1\n\n$2");

  return text.trim();
};

/**
 * Processes messages for display, ensuring proper formatting
 * @param {Array} messages Array of message objects
 * @returns {Array} Processed messages
 */
export const processMessages = (messages) => {
  return messages.map((message) => ({
    ...message,
    text: message.isUser ? message.text : formatCoachResponse(message.text),
  }));
};
