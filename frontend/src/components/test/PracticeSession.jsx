import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, AlertCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export const PracticeSession = () => {
  const { subject, mode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty, questionCount } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
  });

  useEffect(() => {
    fetchQuestion();
  }, [subject, mode, difficulty]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/questions/practice", {
        params: { subject, mode, difficulty },
      });
      setCurrentQuestion(response.data);
      if (mode === "timed") {
        setTimeLeft(response.data.timeLimit || 60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (mode === "timed" && timeLeft > 0 && !feedback) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, mode, feedback]);

  const handleTimeUp = () => {
    setFeedback({
      correct: false,
      message:
        "Time's up! The correct answer was: " + currentQuestion.correctAnswer,
    });
  };

  const handleAnswer = async (answer) => {
    if (feedback) return;

    try {
      const response = await axios.post("/questions/check", {
        questionId: currentQuestion._id,
        answer,
        timeSpent:
          mode === "timed" ? currentQuestion.timeLimit - timeLeft : null,
      });

      const isCorrect = response.data.correct;
      setFeedback({
        correct: isCorrect,
        message: response.data.explanation,
      });

      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

      setProgress((stats.total + 1) * (100 / questionCount));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check answer");
    }
  };

  const handleNext = () => {
    setUserAnswer(null);
    setFeedback(null);

    if (stats.total >= questionCount) {
      navigate("/practice/summary", {
        state: { stats, subject, mode, difficulty },
      });
    } else {
      fetchQuestion();
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={userAnswer === index ? "default" : "outline"}
                className={`w-full justify-start ${
                  feedback &&
                  (feedback.correct && userAnswer === index
                    ? "bg-green-100"
                    : !feedback.correct && userAnswer === index
                    ? "bg-red-100"
                    : index === currentQuestion.correctAnswer
                    ? "bg-green-100"
                    : "")
                }`}
                onClick={() => !feedback && handleAnswer(index)}
                disabled={!!feedback}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case "audio":
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  // TODO: Implement audio playback
                  console.log("Playing:", currentQuestion.audioUrl);
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Play Audio
              </Button>
            </div>
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={userAnswer === index ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => !feedback && handleAnswer(index)}
                disabled={!!feedback}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case "writing":
        return (
          <div className="space-y-4">
            <textarea
              className="w-full h-32 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              value={userAnswer || ""}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your answer here..."
              disabled={!!feedback}
            />
            <Button
              className="w-full"
              onClick={() => handleAnswer(userAnswer)}
              disabled={!userAnswer || !!feedback}
            >
              Submit Answer
            </Button>
            {feedback && currentQuestion.sampleResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Sample Response:</h4>
                <p>{currentQuestion.sampleResponse}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {subject.charAt(0).toUpperCase() + subject.slice(1)} Practice
            </h2>
            <p className="text-gray-600">
              {stats.correct} correct out of {stats.total} questions
            </p>
          </div>
          {mode === "timed" && timeLeft !== null && (
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-500" />
              <span className="text-xl font-semibold">{timeLeft}s</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion?.question}</CardTitle>
        </CardHeader>
        <CardContent>{renderQuestion()}</CardContent>
        {feedback && (
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Alert variant={feedback.correct ? "default" : "destructive"}>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
            <Button onClick={handleNext}>
              {stats.total >= questionCount ? "View Results" : "Next Question"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
