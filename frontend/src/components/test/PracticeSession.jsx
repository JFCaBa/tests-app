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
import { testService } from "../../services/test.service";

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
    answers: [],
  });
  // Timer related state
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [timerActive, setTimerActive] = useState(true);
  const [questionTimers, setQuestionTimers] = useState({}); // Track time per question

  useEffect(() => {
    // Initialize session time on first load
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
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

      // Reset question timer
      const newQuestionStartTime = Date.now();

      setQuestionStartTime(newQuestionStartTime);
      setQuestionTimers((prev) => ({
        ...prev,
        [response.data._id]: newQuestionStartTime,
      }));

      setUserAnswer(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeSpent = () => {
    if (!questionStartTime) return 0;
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
        // First try to get the text using response.data.correctAnswer
        if (currentQuestion.options && Array.isArray(currentQuestion.options)) {
          // Log for debugging
          console.log("Current question:", currentQuestion);
          console.log("Correct answer index:", currentQuestion.correctAnswer);
          console.log("Options:", currentQuestion.options);

          const correctOption =
            currentQuestion.options[currentQuestion.correctAnswer];
          if (correctOption) {
            if (typeof correctOption === "string") {
              return correctOption;
            } else if (
              typeof correctOption === "object" &&
              correctOption.text
            ) {
              return correctOption.text;
            }
          }

          // Fallback: try to find the correct option by checking isCorrect property
          const correctOptionByFlag = currentQuestion.options.find(
            (opt) => typeof opt === "object" && opt.isCorrect
          );
          if (correctOptionByFlag) {
            return correctOptionByFlag.text;
          }
        }
        return "Error retrieving correct answer";

      case QuestionTypes.WRITING:
        return (
          currentQuestion.sampleResponse || "Sample response not available"
        );

      default:
        return "Not available";
    }
  };

  // Move handleAnswer outside of handleTimeUp
  const handleTimeUp = () => {
    if (feedback) return;

    setTimerActive(false);
    const timeSpentOnQuestion = calculateTimeSpent();
    setTotalTimeSpent((prev) => prev + timeSpentOnQuestion);

    const answer = {
      questionId: currentQuestion._id,
      answer: null,
      timeSpent: timeSpentOnQuestion,
      correct: false,
    };

    // Update stats with the timed-out answer
    setStats((prev) => {
      const newTotal = prev.total + 1;
      const newStats = {
        ...prev,
        total: newTotal,
        streak: 0,
        answers: [...prev.answers, answer],
      };

      setProgress((newTotal * 100) / questionCount);

      // If this was the last question, navigate to summary
      if (newTotal >= questionCount) {
        // Small delay to ensure state is updated before navigating
        setTimeout(() => {
          const sessionTimeSpent = Math.floor(
            (Date.now() - sessionStartTime) / 1000
          );
          navigate("/practice/summary", {
            state: {
              stats: {
                ...newStats,
                timeSpent: sessionTimeSpent,
                questionTimers,
                totalTimeSpent: totalTimeSpent + timeSpentOnQuestion,
              },
              subject,
              mode,
              difficulty,
            },
          });
        }, 0);
      }

      return newStats;
    });

    // Only show feedback if not the last question
    if (stats.total < questionCount) {
      setFeedback({
        correct: false,
        message: "Time's up! The correct answer was: " + getCorrectAnswerText(),
      });
    }
  };

  const handleAnswer = async (answer) => {
    if (feedback) return;

    setTimerActive(false);
    const timeSpentOnQuestion = calculateTimeSpent();

    try {
      const response = await axios.post("/questions/check", {
        questionId: currentQuestion._id,
        answer,
        timeSpent: timeSpentOnQuestion,
      });

      const isCorrect = response.data.correct;

      // Update total time and answer history
      setTotalTimeSpent((prev) => prev + timeSpentOnQuestion);

      // Store answer details
      const answerDetails = {
        questionId: currentQuestion._id,
        answer,
        timeSpent: timeSpentOnQuestion,
        correct: isCorrect,
      };

      setStats((prev) => {
        const newStats = {
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1,
          streak: isCorrect ? prev.streak + 1 : 0,
          answers: [...prev.answers, answerDetails],
        };

        // Calculate progress right after updating stats
        setProgress((newStats.total * 100) / questionCount);

        return newStats;
      });

      let feedbackMessage = isCorrect
        ? "Correct! " + (response.data.explanation || "")
        : `Incorrect. The correct answer was: ${getCorrectAnswerText()}`;

      if (!isCorrect && response.data.explanation) {
        feedbackMessage += ` ${response.data.explanation}`;
      }

      setFeedback({
        correct: isCorrect,
        message: feedbackMessage,
      });
    } catch (err) {
      console.error("Answer submission error:", err);
      setError(err.response?.data?.message || "Failed to check answer");
    }
  };

  const handleNext = async () => {
    setUserAnswer(null);
    setFeedback(null);

    if (stats.total >= questionCount) {
      try {
        // Calculate final session statistics
        const sessionTimeSpent = Math.floor(
          (Date.now() - sessionStartTime) / 1000
        );

        // Prepare test data
        const testData = {
          stats: {
            ...stats,
            timeSpent: sessionTimeSpent,
            questionTimers,
            totalTimeSpent,
          },
          subject,
          mode,
          difficulty,
        };

        // Submit test results to backend
        await testService.submitTest(testData);

        // Navigate to summary
        navigate("/practice/summary", {
          state: testData,
        });
      } catch (error) {
        setError(error.message);
        console.error("Failed to submit test results:", error);
      }
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
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-xl font-semibold">{timeLeft}s</span>
              </div>
              <div className="text-sm text-gray-500">
                Total: {Math.floor(totalTimeSpent)}s
              </div>
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
