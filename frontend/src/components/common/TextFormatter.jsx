import React from "react";

const TextFormatter = ({ text, className = "" }) => {
  // Handle null, undefined, or non-string inputs
  if (!text) return null;

  // Convert numbers or other types to strings
  const textContent = String(text);

  const processText = (content) => {
    // Split text into sections that might be lists vs regular text
    const sections = content.split(/\r?\n(?=[-*•]|\d+\.\s)/);

    return sections.map((section, sectionIndex) => {
      // Check if this section is a list
      if (section.trim().match(/^([-*•]|\d+\.)\s/)) {
        const items = section.split(/\r?\n/).filter((item) => item.trim());
        const isNumbered = items[0].match(/^\d+\.\s/);

        if (isNumbered) {
          return (
            <ol
              key={`section-${sectionIndex}`}
              className="list-decimal pl-6 py-2"
            >
              {items.map((item, index) => (
                <li key={index} className="text-inherit">
                  {item.replace(/^\d+\.\s/, "")}
                </li>
              ))}
            </ol>
          );
        } else {
          return (
            <ul key={`section-${sectionIndex}`} className="list-disc pl-6 py-2">
              {items.map((item, index) => (
                <li key={index} className="text-inherit">
                  {item.replace(/^[-*•]\s/, "")}
                </li>
              ))}
            </ul>
          );
        }
      }

      // Regular text handling with line breaks
      return section.split(/\r?\n/).map((line, lineIndex, array) => (
        <React.Fragment key={`line-${sectionIndex}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {processText(textContent)}
    </div>
  );
};

export default TextFormatter;
