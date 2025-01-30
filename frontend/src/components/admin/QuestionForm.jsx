import React, { useState, useEffect } from "react";
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
  onSubmit,
  onClose,
  editingQuestion,
  onSubmitSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect to properly populate form data when editing
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        subject: editingQuestion.subject || "",
        type: editingQuestion.type || "",
        question: editingQuestion.question || "",
        options: Array.isArray(editingQuestion?.options)
          ? editingQuestion.options.map((opt) =>
              typeof opt === "string" ? opt : opt.text
            )
          : ["", "", "", ""],
        correctAnswer: editingQuestion.correctAnswer || 0,
        difficulty: editingQuestion.difficulty || "medium",
        explanation: editingQuestion.explanation || "",
        sampleResponse: editingQuestion.sampleResponse || "",
        audioFile: null,
        imageFile: null,
        // Keep track of existing files
        existingAudioUrl: editingQuestion.audioUrl || null,
        existingImageUrl: editingQuestion.imageUrl || null,
      });
    }
  }, [editingQuestion, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitFormData = new FormData();

      // Basic fields
      submitFormData.append("subject", formData.subject);
      submitFormData.append("type", formData.type);
      submitFormData.append("question", formData.question);
      submitFormData.append("difficulty", formData.difficulty || "medium");

      // Handle options based on question type
      if (formData.type === "multiple-choice" || formData.type === "audio") {
        const optionsWithCorrect = formData.options
          .filter((option) => option.trim() !== "")
          .map((option, index) => ({
            text: option,
            isCorrect: index === formData.correctAnswer,
          }));

        submitFormData.append("options", JSON.stringify(optionsWithCorrect));
        submitFormData.append("correctAnswer", formData.correctAnswer);
      }

      // Handle files - only append if new files are selected
      if (formData.type === "audio" && formData.audioFile) {
        submitFormData.append("audio", formData.audioFile);
      }

      if (formData.imageFile) {
        submitFormData.append("image", formData.imageFile);
      }

      // Additional fields
      if (formData.explanation) {
        submitFormData.append("explanation", formData.explanation);
      }

      if (formData.type === "writing" && formData.sampleResponse) {
        submitFormData.append("sampleResponse", formData.sampleResponse);
        submitFormData.append("correctAnswer", 0);
      }

      console.log("Submitting form data:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Make the request
      let response;
      if (editingQuestion) {
        response = await axios.put(
          `/questions/${editingQuestion._id}`,
          submitFormData
        );
      } else {
        response = await axios.post("/admin/question", submitFormData);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage;
      if (error.message === "Network Error") {
        errorMessage =
          "Connection error. Please check your internet connection.";
      } else if (error.response?.status === 413) {
        errorMessage = "File too large. Please try a smaller file.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Failed to save question. Please try again.";
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

    if (
      formData.type === "audio" &&
      !formData.audioFile &&
      !editingQuestion?.audioUrl &&
      !formData.existingAudioUrl
    ) {
      return false;
    }

    if (
      (formData.type === "audio" || formData.type === "multiple-choice") &&
      (!formData.options?.some((opt) =>
        typeof opt === "string" ? opt.trim() !== "" : opt.text?.trim() !== ""
      ) ||
        formData.correctAnswer === undefined)
    ) {
      return false;
    }

    if (formData.type === "writing" && !formData.sampleResponse) {
      return false;
    }

    return true;
  };

  // Rest of the component remains the same with the form UI
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
            {/* Subject and Type Selection */}
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

            {/* Question Text */}
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

            {/* Multiple Choice Options */}
            {(formData.type === "multiple-choice" ||
              formData.type === "audio") && (
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

            {/* Writing Sample Response */}
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

            {/* Audio Upload */}
            {formData.type === "audio" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Audio File
                </label>
                {formData.existingAudioUrl && (
                  <div className="mb-2 text-sm text-gray-500">
                    Current audio file:{" "}
                    {formData.existingAudioUrl.split("/").pop()}
                  </div>
                )}
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setFormData({ ...formData, audioFile: e.target.files[0] })
                  }
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Image (Optional)
              </label>
              {formData.existingImageUrl && (
                <div className="mb-2 text-sm text-gray-500">
                  Current image: {formData.existingImageUrl.split("/").pop()}
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, imageFile: e.target.files[0] })
                }
              />
            </div>

            {/* Difficulty Selection */}
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

            {/* Explanation */}
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
            {loading ? "Saving..." : editingQuestion ? "Update" : "Create"}{" "}
            Question
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionForm;
