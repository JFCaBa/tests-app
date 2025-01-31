import React, { useState, useEffect } from "react";
import axios from "axios";
import { Play, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QuestionTypes = {
  MULTIPLE_CHOICE: "multiple-choice",
  WRITING: "writing",
  AUDIO: "audio",
};

export const TestContainer = () => {
  const { settings } = useSettings();
  const [subject, setSubject] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testId, setTestId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTimes, setQuestionStartTimes] = useState({});

  const startTest = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/tests/start", {
        subject,
        difficulty: settings?.defaultDifficulty || "medium",
        questionCount: settings?.questionsPerTest || 10,
      });

      setQuestions(response.data.questions);
      setTestId(response.data.testId);
      setTestStarted(true);
      setUserAnswers({});
      setCurrentIndex(0);
      setShowResults(false);
      setStartTime(Date.now());
      setQuestionStartTimes({ 0: Date.now() });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const questionId = questions[currentIndex]._id;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer,
        timeSpent: Math.floor(
          (Date.now() - questionStartTimes[currentIndex]) / 1000
        ),
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setQuestionStartTimes((prev) => ({
        ...prev,
        [nextIndex]: Date.now(),
      }));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Calculate total time spent
      const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Format answers for submission
      const formattedAnswers = Object.entries(userAnswers).map(
        ([questionId, data]) => ({
          questionId,
          answer: data.answer,
          timeSpent: data.timeSpent,
        })
      );

      const response = await axios.post("/tests/submit", {
        testId,
        answers: formattedAnswers,
        timeSpent: totalTimeSpent,
      });

      setShowResults(true);
      // Handle test results - you might want to navigate to a results page
      if (response.data) {
        // Navigate to results or show results modal
        console.log("Test Results:", response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit test");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentIndex];
    if (!question) return null;

    switch (question.type) {
      case QuestionTypes.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  userAnswers[question._id]?.answer === index
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleAnswer(index)}
              >
                {typeof option === "object" ? option.text : option}
              </Button>
            ))}
          </div>
        );

      case QuestionTypes.AUDIO:
        return (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                // Audio playback implementation
                const audio = new Audio(`/api/${question.audioUrl}`);
                audio.play().catch(console.error);
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              Play Audio
            </Button>
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  userAnswers[question._id]?.answer === index
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleAnswer(index)}
              >
                {typeof option === "object" ? option.text : option}
              </Button>
            ))}
          </div>
        );

      case QuestionTypes.WRITING:
        return (
          <div className="space-y-4">
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={userAnswers[question._id]?.answer || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Write your answer here..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!testStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Start a New Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Subject
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="listening">Listening</SelectItem>
                <SelectItem value="grammar">Grammar</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="laws">Laws</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={startTest} disabled={loading}>
            {loading ? "Loading..." : "Start Test"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          {startTime && (
            <div className="flex items-center text-sm text-gray-500">
              <Timer className="w-4 h-4 mr-1" />
              <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-lg mb-4">{questions[currentIndex]?.question}</div>

        {renderQuestion()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Test"}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TestContainer;
