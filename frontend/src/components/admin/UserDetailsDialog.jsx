import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Target,
  TrendingUp,
  X,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TestDetailsDialog = ({ test, onClose }) => {
  const getAnswerText = (question) => {
    if (!question) return "";
    if (question.userAnswer?.text) return question.userAnswer.text;
    if (Array.isArray(test.options)) {
      return test.options[question.userAnswer]?.text || question.userAnswer;
    }
    return question.userAnswer;
  };

  const getCorrectAnswerText = (question) => {
    if (!question) return "";
    if (question.correctAnswer?.text) return question.correctAnswer.text;
    if (Array.isArray(question.options)) {
      return (
        question.options[question.correctAnswer]?.text || question.correctAnswer
      );
    }
    return question.correctAnswer;
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Test Details</CardTitle>
            <CardDescription>
              {new Date(test.testDate).toLocaleDateString()} - {test.subject}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold">{test.score}%</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="text-xl font-bold capitalize">{test.difficulty}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm text-gray-500">Time Spent</p>
              <p className="text-xl font-bold">
                {Math.round(test.timeSpent / 60)} min
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Incorrect Answers</h3>
            <ScrollArea className="h-[300px] pr-4">
              {test.questions
                ?.filter((q) => !q.correct)
                .map((question, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">
                          Question {index + 1}
                        </p>
                        <p className="text-sm text-gray-700">
                          {question.questionId?.question || question.question}
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 mt-2">
                      <p className="text-sm text-gray-600">
                        Your answer:{" "}
                        <span className="font-medium">
                          {getAnswerText(question)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Correct answer:{" "}
                        <span className="font-medium">
                          {getCorrectAnswerText(question)}
                        </span>
                      </p>
                      {question.explanation && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                          <span className="font-medium">Explanation: </span>
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              {!test.questions?.some((q) => !q.correct) && (
                <p className="text-center text-gray-500 py-4">
                  All answers were correct!
                </p>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserDetails = ({ user, onClose }) => {
  const [selectedTest, setSelectedTest] = useState(null);

  if (!user) return null;

  const testStats = {
    totalTests: user.testHistory?.length || 0,
    averageScore:
      user.testHistory?.reduce((acc, test) => acc + test.score, 0) /
      (user.testHistory?.length || 1),
    bestSubject: user.statistics?.bySubject
      ? Object.entries(user.statistics.bySubject).sort(
          (a, b) => b[1].correct / b[1].answered - a[1].correct / a[1].answered
        )[0]?.[0]
      : "N/A",
    recentTests: user.testHistory?.slice(-5) || [],
    byDifficulty: user.testHistory?.reduce((acc, test) => {
      acc[test.difficulty] = (acc[test.difficulty] || 0) + 1;
      return acc;
    }, {}),
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{user.username}'s Statistics</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Total Tests</span>
              </div>
              <p className="text-2xl font-bold">{testStats.totalTests}</p>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Average Score</span>
              </div>
              <p className="text-2xl font-bold">
                {testStats.averageScore.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Best Subject</span>
              </div>
              <p className="text-2xl font-bold capitalize">
                {testStats.bestSubject}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-3">Tests by Difficulty</h3>
            <div className="flex gap-3">
              {Object.entries(testStats.byDifficulty).map(
                ([difficulty, count]) => (
                  <Badge
                    key={difficulty}
                    className={getDifficultyColor(difficulty)}
                  >
                    {difficulty}: {count} tests
                  </Badge>
                )
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Recent Tests</h3>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {testStats.recentTests.map((test, index) => (
                  <button
                    key={index}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium capitalize text-left">
                          {test.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(test.testDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold">{test.score}%</p>
                        <p className="text-sm text-gray-500">
                          {test.correctAnswers}/{test.totalQuestions} correct
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
                {testStats.recentTests.length === 0 && (
                  <p className="text-center text-gray-500">
                    No tests taken yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {selectedTest && (
        <TestDetailsDialog
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
};

export default UserDetails;
