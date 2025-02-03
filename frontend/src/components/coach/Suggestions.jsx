import React from "react";
import { Button } from "@/components/ui/button";
import { SUGGESTIONS } from "./constants";

const Suggestions = React.memo(({ onSelect, subject }) => {
  if (!subject || !SUGGESTIONS[subject]) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {SUGGESTIONS[subject].map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
});

Suggestions.displayName = "Suggestions";

export default Suggestions;
