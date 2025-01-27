// src/components/admin/BulkQuestionUpload.jsx

import React, { useState } from "react";
import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export const BulkQuestionUpload = ({ onUploadComplete }) => {
  const [jsonContent, setJsonContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const validateAndParseJSON = (content) => {
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.questions)) {
        throw new Error("JSON must contain a 'questions' array");
      }
      return parsed;
    } catch (e) {
      throw new Error("Invalid JSON format: " + e.message);
    }
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setJsonContent(content);
    setError("");

    if (content) {
      try {
        const parsed = validateAndParseJSON(content);
        setPreview(parsed.questions.slice(0, 5));
      } catch (e) {
        setError(e.message);
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!jsonContent) {
      setError("Please enter JSON content");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = validateAndParseJSON(jsonContent);

      // Using the correct API endpoint
      const response = await axios.post("/admin/bulk-questions", data, {
        headers: {
          "Content-Type": "application/json",
          // The auth token will be automatically added by the axios interceptor
        },
      });

      console.log("Upload successful:", response.data);
      onUploadComplete?.();
      setJsonContent(""); // Clear the form after successful upload
      setPreview(null);
    } catch (err) {
      console.error("Upload error:", err.response || err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error uploading questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      questions: [
        {
          subject: "grammar",
          type: "multiple-choice",
          difficulty: "medium",
          question:
            "Сегодня суббота, а мама приехала вчера, _____________________",
          options: [
            { text: "в среду", isCorrect: false },
            { text: "в пятницу", isCorrect: true },
            { text: "во вторник", isCorrect: false },
          ],
          correctAnswer: 1,
          active: true,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grammar_questions_template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">
              Upload Grammar Questions JSON
            </h4>
            <p className="text-sm text-gray-500">
              Paste your JSON content or download the template for reference
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>

        <Textarea
          value={jsonContent}
          onChange={handleContentChange}
          placeholder="Paste your JSON content here..."
          className="min-h-[300px] font-mono text-sm"
        />

        {preview && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Preview (First 5 questions):</h3>
            <div className="rounded-md border p-4 bg-gray-50 overflow-auto max-h-60">
              <pre className="text-sm">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!jsonContent || loading}
          className="w-full"
        >
          {loading ? "Uploading..." : "Upload Questions"}
        </Button>
      </div>
    </div>
  );
};

export default BulkQuestionUpload;
