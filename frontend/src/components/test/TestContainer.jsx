import React, { useState, useEffect } from "react";
import axios from "axios";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [subject, setSubject] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const startTest = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/tests/start", {
        subject,
        questionCount: 10,
      });
      setQuestions(response.data.questions);
      setTestStarted(true);
      setUserAnswers({});
      setCurrentIndex(0);
      setShowResults(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentIndex]._id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const answers = Object.entries(userAnswers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      const response = await axios.post("/tests/submit", {
        answers,
        timeSpent: 0, // TODO: Implement timer
      });

      setShowResults(true);
      // TODO: Handle test results
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
                  userAnswers[question._id] === index ? "default" : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleAnswer(index)}
              >
                {option}
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
                // TODO: Implement audio playback
                console.log("Playing audio:", question.audioUrl);
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              Play Audio
            </Button>
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  userAnswers[question._id] === index ? "default" : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case QuestionTypes.WRITING:
        return (
          <div className="space-y-4">
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={userAnswers[question._id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Write your answer here..."
            />
            {question.sampleResponse && (
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Sample Response:</h4>
                <p>{question.sampleResponse}</p>
              </div>
            )}
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
        <CardTitle>
          Question {currentIndex + 1} of {questions.length}
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
