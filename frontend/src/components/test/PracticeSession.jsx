import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, AlertCircle } from "lucide-react";
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
import TextFormatter from "../common/TextFormatter";
import { AudioQuestion } from "./AudioQuestion";

const QuestionTypes = {
  MULTIPLE_CHOICE: "multiple-choice",
  WRITING: "writing",
  AUDIO: "audio",
};

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
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [subject, mode, difficulty]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    setTimerActive(true);
    try {
      const response = await axios.get("/questions/practice", {
        params: { subject, mode, difficulty },
      });
      setCurrentQuestion(response.data);
      if (mode === "timed") {
        setTimeLeft(response.data.timeLimit || 60);
      }
      setQuestionStartTime(Date.now());
      setUserAnswer(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeSpent = () => {
    return Math.min(
      Math.floor((Date.now() - questionStartTime) / 1000),
      mode === "timed" ? currentQuestion?.timeLimit || 60 : Infinity
    );
  };

  useEffect(() => {
    let timer;
    if (mode === "timed" && timeLeft > 0 && timerActive && !feedback) {
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
  }, [timeLeft, mode, feedback, timerActive]);

  const getCorrectAnswerText = () => {
    if (!currentQuestion) return "Not available";

    switch (currentQuestion.type) {
      case QuestionTypes.MULTIPLE_CHOICE:
      case QuestionTypes.AUDIO:
        if (
          currentQuestion.options &&
          Array.isArray(currentQuestion.options) &&
          typeof currentQuestion.correctAnswer === "number" &&
          currentQuestion.options[currentQuestion.correctAnswer]
        ) {
          return getOptionText(
            currentQuestion.options[currentQuestion.correctAnswer]
          );
        }
        return "Not available";
      case QuestionTypes.WRITING:
        return (
          currentQuestion.sampleResponse || "Sample response not available"
        );
      default:
        return "Not available";
    }
  };

  const handleTimeUp = () => {
    if (feedback) return;

    setTimerActive(false);
    const timeSpentOnQuestion = calculateTimeSpent();
    setTotalTimeSpent((prev) => prev + timeSpentOnQuestion);

    setFeedback({
      correct: false,
      message: "Time's up! The correct answer was: " + getCorrectAnswerText(),
    });
  };

  const handleAnswer = async (answer) => {
    if (feedback) return;

    setTimerActive(false);
    const timeSpentOnQuestion = calculateTimeSpent();
    setTotalTimeSpent((prev) => prev + timeSpentOnQuestion);

    try {
      const response = await axios.post("/questions/check", {
        questionId: currentQuestion._id,
        answer,
        timeSpent: timeSpentOnQuestion,
      });

      const isCorrect = response.data.correct;
      let feedbackMessage = "";

      if (isCorrect) {
        feedbackMessage = "Correct! " + (response.data.explanation || "");
      } else {
        if (
          currentQuestion.type === QuestionTypes.MULTIPLE_CHOICE ||
          currentQuestion.type === QuestionTypes.AUDIO
        ) {
          feedbackMessage = `Incorrect. The correct answer was: ${getCorrectAnswerText()}`;
        } else {
          feedbackMessage = "Incorrect.";
        }

        if (response.data.explanation) {
          feedbackMessage += ` ${response.data.explanation}`;
        }
      }

      setFeedback({
        correct: isCorrect,
        message: feedbackMessage,
      });

      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

      setProgress((stats.total + 1) * (100 / questionCount));
    } catch (err) {
      console.error("Answer submission error:", err);
      setError(err.response?.data?.message || "Failed to check answer");
    }
  };

  const handleNext = () => {
    setUserAnswer(null);
    setFeedback(null);

    if (stats.total >= questionCount) {
      navigate("/practice/summary", {
        state: {
          stats: {
            ...stats,
            timeSpent: totalTimeSpent,
          },
          subject,
          mode,
          difficulty,
        },
      });
    } else {
      fetchQuestion();
    }
  };

  const getOptionText = (option) => {
    if (typeof option === "string") return option;
    if (typeof option === "object" && option !== null) {
      return option.text || "";
    }
    return "";
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case QuestionTypes.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            {(currentQuestion.options || []).map((option, index) => (
              <Button
                key={index}
                variant={userAnswer === index ? "default" : "outline"}
                className={`w-full justify-start text-left whitespace-normal ${
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
                <TextFormatter text={getOptionText(option)} />
              </Button>
            ))}
          </div>
        );

      case QuestionTypes.AUDIO:
        return (
          <AudioQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={!!feedback}
            selectedAnswer={userAnswer}
          />
        );

      case QuestionTypes.WRITING:
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
                <TextFormatter
                  text={currentQuestion.sampleResponse}
                  className="text-gray-700"
                />
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
          <CardTitle>
            <TextFormatter
              text={currentQuestion?.question}
              className="text-lg leading-relaxed"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>{renderQuestion()}</CardContent>
        {feedback && (
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Alert
              variant={feedback.correct ? "default" : "destructive"}
              className={feedback.correct ? "bg-green-100" : "bg-red-100"}
            >
              <AlertDescription
                className={feedback.correct ? "text-green-800" : "text-red-800"}
              >
                {feedback.message}
              </AlertDescription>
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

export default PracticeSession;
