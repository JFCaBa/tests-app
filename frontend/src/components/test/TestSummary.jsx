import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, Clock, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const TestSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, subject, mode, difficulty } = location.state || {};

  if (!stats) {
    navigate("/subjects");
    return null;
  }

  const percentage = Math.round((stats.correct / stats.total) * 100);
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excellent work!";
    if (percentage >= 70) return "Good job!";
    if (percentage >= 50) return "Keep practicing!";
    return "More practice will help!";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Test Results</CardTitle>
          <CardDescription>
            {subject.charAt(0).toUpperCase() + subject.slice(1)} - {mode} Mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">Accuracy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{percentage}%</div>
                <p className="text-sm text-gray-500">
                  {stats.correct} out of {stats.total} correct
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm">Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getPerformanceMessage()}
                </div>
                <p className="text-sm text-gray-500">
                  {stats.streak > 1 ? `${stats.streak} questions streak!` : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">Time Spent</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(stats.timeSpent / 60)} min
                </div>
                <p className="text-sm text-gray-500">
                  {Math.round(stats.timeSpent / stats.total)} sec per question
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/subjects")}
            className="w-full sm:w-auto"
          >
            Back to Subjects
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSummary;
