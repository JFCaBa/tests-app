import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

const subjects = [
  "listening",
  "grammar",
  "history",
  "laws",
  "reading",
  "writing",
];
const questionTypes = ["multiple-choice", "writing", "audio"];
const difficultyLevels = ["easy", "medium", "hard"];

const QuestionForm = ({
  formData,
  setFormData,
  onSubmit: onSubmitProp,
  onClose,
  editingQuestion,
  onSubmitSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Starting question submission...");

      const submitFormData = new FormData();

      // Basic fields
      submitFormData.append("subject", formData.subject);
      submitFormData.append("type", formData.type);
      submitFormData.append("question", formData.question);
      submitFormData.append("difficulty", formData.difficulty || "medium");

      // Handle options based on question type
      if (formData.type === "multiple-choice" || formData.type === "audio") {
        const optionsWithCorrect = formData.options
          .filter((option) => option.trim() !== "") // Remove empty options
          .map((option, index) => ({
            text: option,
            isCorrect: index === formData.correctAnswer,
          }));

        submitFormData.append("options", JSON.stringify(optionsWithCorrect));
        submitFormData.append("correctAnswer", formData.correctAnswer);
      }

      // Handle files
      if (formData.type === "audio" && formData.audioFile) {
        submitFormData.append("audio", formData.audioFile);
        console.log("Added audio file:", formData.audioFile.name);
      }

      if (formData.imageFile) {
        submitFormData.append("image", formData.imageFile);
        console.log("Added image file:", formData.imageFile.name);
      }

      // Additional fields
      if (formData.explanation) {
        submitFormData.append("explanation", formData.explanation);
      }

      if (formData.type === "writing" && formData.sampleResponse) {
        submitFormData.append("sampleResponse", formData.sampleResponse);
      }

      // Log form data contents
      for (let [key, value] of submitFormData.entries()) {
        console.log(
          "FormData entry:",
          key,
          value instanceof File ? value.name : value
        );
      }

      const debugFormData = {};
      submitFormData.forEach((value, key) => {
        debugFormData[key] = value;
      });
      console.log("Final FormData payload:", debugFormData);

      // Make the request
      const response = await axios.post("/admin/question", submitFormData);

      console.log("Question created successfully:", response.data);

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage;
      if (error.message === "Network Error") {
        errorMessage =
          "Connection error. Please check your internet connection and try again.";
      } else if (error.response?.status === 413) {
        errorMessage = "File too large. Please try a smaller file.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Failed to create question. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.subject || !formData.type || !formData.question) {
      return false;
    }

    if (formData.type === "audio" && !formData.audioFile && !editingQuestion) {
      return false;
    }

    if (
      (formData.type === "audio" || formData.type === "multiple-choice") &&
      (!formData.options?.length || formData.correctAnswer === undefined)
    ) {
      return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <CardTitle>
              {editingQuestion ? "Edit Question" : "Create New Question"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Question Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Question Text
              </label>
              <Textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                rows={3}
              />
            </div>

            {formData.type === "multiple-choice" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: index })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {formData.type === "writing" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sample Response
                </label>
                <Textarea
                  value={formData.sampleResponse}
                  onChange={(e) =>
                    setFormData({ ...formData, sampleResponse: e.target.value })
                  }
                  rows={3}
                />
              </div>
            )}

            {formData.type === "audio" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Audio File
                </label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setFormData({ ...formData, audioFile: e.target.files[0] })
                  }
                />

                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium">Options</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() =>
                          setFormData({ ...formData, correctAnswer: index })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Image (Optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, imageFile: e.target.files[0] })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Difficulty
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Explanation
              </label>
              <Textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                rows={2}
                placeholder="Explain the correct answer"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !validateForm()}>
            {loading ? "Submitting..." : editingQuestion ? "Update" : "Create"}{" "}
            Question
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionForm;
