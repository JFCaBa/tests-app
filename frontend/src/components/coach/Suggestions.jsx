import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const Suggestions = React.memo(({ onSelect, subject }) => {
  const { t } = useTranslation();

  if (!subject) return null;

  // Dynamically fetch translated suggestions for the selected subject
  const translatedSuggestions = t(`suggestions.${subject}`, {
    returnObjects: true,
  });

  if (!translatedSuggestions || Object.keys(translatedSuggestions).length === 0)
    return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.values(translatedSuggestions).map((suggestion, index) => (
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
