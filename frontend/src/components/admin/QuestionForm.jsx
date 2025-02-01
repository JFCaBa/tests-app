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
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Wand,
} from "lucide-react";

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

const getLastSelected = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(`lastSelected_${key}`);
    return value !== null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveLastSelected = (key, value) => {
  try {
    localStorage.setItem(`lastSelected_${key}`, value);
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audio] = useState(new Audio(audioUrl));

  useEffect(() => {
    audio.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setIsPlaying(false));
      audio.pause();
    };
  }, [audio]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center space-x-2 my-2">
      <Button size="sm" variant="outline" onClick={togglePlay}>
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <Button size="sm" variant="outline" onClick={toggleMute}>
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

const QuestionForm = ({
  formData,
  setFormData,
  onClose,
  editingQuestion,
  onSubmitSuccess,
  currentQuestionId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (editingQuestion) {
        try {
          // Create filters object with all possible parameters
          const filters = {
            page: 1,
            limit: 10, // Match the limit used in QuestionManager
            subject:
              editingQuestion.subject !== "all"
                ? editingQuestion.subject
                : undefined,
            type:
              editingQuestion.type !== "all" ? editingQuestion.type : undefined,
            difficulty:
              editingQuestion.difficulty !== "all"
                ? editingQuestion.difficulty
                : undefined,
          };

          // Clean filters to remove undefined values - same as QuestionManager
          const queryParams = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          );

          const response = await axios.get("/questions", {
            params: queryParams,
          });

          if (response.data.questions) {
            setAllQuestions(response.data.questions);

            if (editingQuestion._id) {
              const index = response.data.questions.findIndex(
                (q) => q._id === editingQuestion._id
              );
              setCurrentIndex(index >= 0 ? index : 0);
            }
          }
        } catch (error) {
          console.error("Failed to fetch questions:", error);
          setError("Failed to fetch questions");
        }
      }
    };
    fetchQuestions();
  }, [editingQuestion]);

  const handleNavigation = async (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < allQuestions.length && !loading) {
      try {
        const questionToLoad = allQuestions[newIndex];
        const response = await axios.get(`/questions/${questionToLoad._id}`);

        // Transform the data for the form
        const questionData = response.data;
        const formattedData = {
          ...questionData,
          options: questionData.options?.map((opt) => opt.text || opt) || [],
          existingAudioUrl: questionData.audioUrl,
          existingImageUrl: questionData.imageUrl,
          correctAnswer: questionData.correctAnswer,
        };

        onNavigate(formattedData);
        setCurrentIndex(newIndex);
      } catch (error) {
        console.error("Navigation error:", error);
        setError("Failed to load question");
      }
    }
  };

  const handleTranscribe = async () => {
    if (!formData.existingAudioUrl) return;

    setTranscribing(true);
    try {
      const audioPath = formData.existingAudioUrl.split("/").pop();
      const response = await axios.post(
        `/questions/${editingQuestion._id}/transcribe`
      );

      console.log("Transcription response:", response.data);

      if (response.data.text) {
        setFormData((prev) => ({
          ...prev,
          explanation: response.data.text,
        }));
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setError(error.response?.data?.message || "Failed to transcribe audio");
    } finally {
      setTranscribing(false);
    }
  };

  useEffect(() => {
    if (!editingQuestion && formData) {
      if (formData.subject) saveLastSelected("subject", formData.subject);
      if (formData.type) saveLastSelected("type", formData.type);
      if (formData.difficulty)
        saveLastSelected("difficulty", formData.difficulty);
    }
  }, [
    formData?.subject,
    formData?.type,
    formData?.difficulty,
    editingQuestion,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitFormData = new FormData();

      submitFormData.append("subject", formData.subject);
      submitFormData.append("type", formData.type);
      submitFormData.append("question", formData.question);
      submitFormData.append("difficulty", formData.difficulty || "medium");

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

      if (formData.type === "audio" && formData.audioFile) {
        submitFormData.append("audio", formData.audioFile);
      }

      if (formData.imageFile) {
        submitFormData.append("image", formData.imageFile);
      }

      if (formData.explanation) {
        submitFormData.append("explanation", formData.explanation);
      }

      if (formData.type === "writing" && formData.sampleResponse) {
        submitFormData.append("sampleResponse", formData.sampleResponse);
        submitFormData.append("correctAnswer", 0);
      }

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
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.response?.data?.message || "Failed to save question");
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

  const getAudioUrl = (audioPath) => {
    if (!audioPath) return "";
    const cleanPath = audioPath.replace(/^\//, "");
    return `https://testmyrussian.com/uploads/audio/${cleanPath
      .split("/")
      .pop()}`;
  };

  const renderAudioSection = () => (
    <div>
      <label className="block text-sm font-medium mb-1">Audio File</label>
      {formData.existingAudioUrl && (
        <>
          <div className="mb-2 text-sm text-gray-500">
            Current audio file: {formData.existingAudioUrl.split("/").pop()}
          </div>
          <div className="flex items-center space-x-2">
            <AudioPlayer audioUrl={getAudioUrl(formData.existingAudioUrl)} />
            {editingQuestion && !formData.explanation && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranscribe}
                disabled={transcribing}
                className="flex items-center space-x-2"
              >
                <Wand className="h-4 w-4" />
                <span>{transcribing ? "Transcribing..." : "Transcribe"}</span>
              </Button>
            )}
          </div>
        </>
      )}
      <Input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setFormData({ ...formData, audioFile: e.target.files[0] })
        }
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {editingQuestion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(-1)}
                  disabled={currentIndex <= 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle>
                {editingQuestion ? "Edit Question" : "Create New Question"}
              </CardTitle>
              {editingQuestion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(1)}
                  disabled={currentIndex >= allQuestions.length - 1 || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {editingQuestion && (
            <div className="text-sm text-gray-500 mt-1">
              Question {currentIndex + 1} of {allQuestions.length}
            </div>
          )}
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

            {formData.type === "audio" && renderAudioSection()}

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
        <CardFooter className="flex justify-between space-x-2">
          {editingQuestion ? (
            <>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation(-1)}
                  disabled={currentIndex <= 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation(1)}
                  disabled={currentIndex >= allQuestions.length - 1 || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !validateForm()}
                >
                  {loading ? "Saving..." : "Update"} Question
                </Button>
              </div>
            </>
          ) : (
            <div className="flex w-full justify-end space-x-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateForm()}
              >
                {loading ? "Creating..." : "Create Question"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionForm;
