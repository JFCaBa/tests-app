import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Target, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserDetails = ({ user, onClose }) => {
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

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Recent Tests</h3>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {testStats.recentTests.map((test, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-slate-50 rounded"
                  >
                    <div>
                      <p className="font-medium capitalize">{test.subject}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(test.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{test.score}%</p>
                      <p className="text-sm text-gray-500">
                        {test.correctAnswers}/{test.totalQuestions} correct
                      </p>
                    </div>
                  </div>
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
    </div>
  );
};

export default UserDetails;
