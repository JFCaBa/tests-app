import React from "react";

const TextFormatter = ({ text, className = "" }) => {
  // Handle null, undefined, or non-string inputs
  if (!text) return null;

  // Convert numbers or other types to strings
  const textContent = String(text);

  const processText = (content) => {
    // Split into paragraphs first
    const paragraphs = content.split(/\n\n+/);
    let currentNumber = 1;

    return paragraphs.map((paragraph, paragraphIndex) => {
      const lines = paragraph.split(/\r?\n/);

      // Check if this paragraph contains a list
      const isList = lines.some((line) =>
        line.trim().match(/^([-*•]|\d+\.)\s/)
      );

      if (isList) {
        // Check if it's a numbered list
        const isNumbered = lines[0].trim().match(/^\d+\.\s/);

        if (isNumbered) {
          // Process numbered list items
          const items = lines.filter((line) => line.trim());
          return (
            <ol key={`p-${paragraphIndex}`} className="list-decimal pl-6 py-1">
              {items.map((item, index) => (
                <li key={index} className="text-inherit mb-1">
                  {item.replace(/^\d+\.\s/, "")}
                </li>
              ))}
            </ol>
          );
        } else {
          // Process bullet point list
          const items = lines.filter((line) => line.trim());
          return (
            <ul key={`p-${paragraphIndex}`} className="list-disc pl-6 py-1">
              {items.map((item, index) => (
                <li key={index} className="text-inherit mb-1">
                  {item.replace(/^[-*•]\s/, "")}
                </li>
              ))}
            </ul>
          );
        }
      }

      // Process regular text with potential inline lists
      let inList = false;
      let listItems = [];
      const processedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isListItem = line.trim().match(/^(\d+\.|[-*•])\s/);

        if (isListItem) {
          if (!inList) {
            inList = true;
            listItems = [];
          }
          listItems.push(line.replace(/^(\d+\.|[-*•])\s/, ""));

          // If this is the last line or next line is not a list item, render the list
          if (
            i === lines.length - 1 ||
            !lines[i + 1].trim().match(/^(\d+\.|[-*•])\s/)
          ) {
            const isNumbered = line.trim().match(/^\d+\.\s/);
            if (isNumbered) {
              processedLines.push(
                <ol key={`list-${i}`} className="list-decimal pl-6 py-1">
                  {listItems.map((item, idx) => (
                    <li key={idx} className="text-inherit mb-1">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            } else {
              processedLines.push(
                <ul key={`list-${i}`} className="list-disc pl-6 py-1">
                  {listItems.map((item, idx) => (
                    <li key={idx} className="text-inherit mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            inList = false;
          }
        } else {
          processedLines.push(
            <React.Fragment key={`line-${i}`}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          );
        }
      }

      return (
        <div key={`p-${paragraphIndex}`} className="mb-3">
          {processedLines}
        </div>
      );
    });
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {processText(textContent)}
    </div>
  );
};

export default TextFormatter;
