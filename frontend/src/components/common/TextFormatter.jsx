// src/components/common/TextFormatter.jsx
import React from "react";

const TextFormatter = ({ text, className = "" }) => {
  // Handle null, undefined, or non-string inputs
  if (!text) return null;

  // Convert numbers or other types to strings
  const textContent = String(text);

  // Replace \n\r or \r\n or \n with proper line breaks
  const formattedText = textContent.split(/\r?\n/).map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));

  return <div className={className}>{formattedText}</div>;
};

export default TextFormatter;
