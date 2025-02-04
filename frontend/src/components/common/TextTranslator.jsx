import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { isRussianText } from "../../utils/languageUtils";
import { translationService } from "../../services/translation.service";
import { Book } from "lucide-react";
import { Alert } from "@/components/ui/alert";

const TextTranslator = () => {
  const [translation, setTranslation] = useState({ text: "", position: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;

    const handleTextSelection = async () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (!selectedText) {
        setTranslation({ text: "", position: null });
        setError(null);
        return;
      }

      // Check if the selected text contains Russian characters
      if (isRussianText(selectedText)) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          const position = {
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX,
          };

          // Show loading state
          setTranslation({
            text: "Translating...",
            position,
            original: selectedText,
            loading: true,
          });

          // Translate the text
          const translatedText = await translationService.translateText(
            selectedText
          );

          setTranslation({
            text: translatedText,
            position,
            original: selectedText,
            loading: false,
          });

          // Hide the translation after 5 seconds
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setTranslation({ text: "", position: null });
          }, 5000);
        } catch (error) {
          console.error("Translation error:", error);
          setError("Translation failed. Please try again.");

          // Hide error after 3 seconds
          setTimeout(() => {
            setError(null);
          }, 3000);
        }
      } else {
        setTranslation({ text: "", position: null });
      }
    };

    document.addEventListener("mouseup", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle clicks outside the translation popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translation.text && !event.target.closest(".translation-popup")) {
        setTranslation({ text: "", position: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [translation.text]);

  if (!translation.text && !translation.position && !error) return null;

  return (
    <>
      {error && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 z-50">
          {error}
        </Alert>
      )}

      {translation.text && translation.position && (
        <div
          className="fixed z-50 translation-popup"
          style={{
            position: "absolute", // Change from fixed
            top: translation.position.top,
            left: translation.position.left,
          }}
        >
          <Card className="p-3 max-w-sm bg-white shadow-lg border rounded-lg">
            <div className="flex items-start gap-2">
              <Book className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-600">
                  {translation.original}
                </div>
                <div className="text-sm text-gray-800">
                  {translation.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Translating...</span>
                    </div>
                  ) : (
                    translation.text
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default TextTranslator;
