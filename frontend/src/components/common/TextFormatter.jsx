import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";

const TextFormatter = ({ text, className = "" }) => {
  if (!text) return null;

  const textContent = String(text);

  const processText = (content) => {
    const sanitizedText = DOMPurify.sanitize(content);
    const cleanedText = sanitizedText.replace(/\n+/g, "\n");

    return (
      <ReactMarkdown
        className={`whitespace-pre-wrap ${className}`}
        remarkPlugins={[remarkGfm]}
      >
        {cleanedText}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {processText(textContent)}
    </div>
  );
};

export default TextFormatter;
