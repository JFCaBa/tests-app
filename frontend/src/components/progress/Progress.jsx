import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Progress as ProgressIndicator } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Award, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Default state structure
const defaultProgressData = {
  history: [],
  stats: {
    totalTests: 0,
    averageScore: 0,
    level: "Beginner",
    bestSubject: null,
    statsBySubject: {},
  },
  recentTests: [],
};

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    {message}
  </div>
);

export const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(defaultProgressData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/tests/history");
        setProgressData({
          ...defaultProgressData,
          ...response.data,
          stats: {
            ...defaultProgressData.stats,
            ...response.data?.stats,
          },
        });
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data");
        setProgressData(defaultProgressData);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleStartPractice = (subject) => {
    navigate(`/practice/${subject.toLowerCase()}`);
  };

  // Prepare data for visualizations
  const subjectProgress = Object.entries(
    progressData?.stats?.statsBySubject || {}
  ).map(([subject, data]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    progress: Number(data.progress) || 0,
    tests: Number(data.totalTests) || 0,
    bestScore: Number(data.bestScore) || 0,
  }));

  // Format timeline data
  const timelineData = (progressData?.history || []).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    score: Number(entry.score) || 0,
    subject: entry.subject,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData?.stats?.level || "Beginner"}
            </div>
            <p className="text-sm text-gray-500">Based on your performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-500" />
              Tests Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData?.stats?.totalTests || 0}
            </div>
            <p className="text-sm text-gray-500">Total tests taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(progressData?.stats?.averageScore || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="w-4 h-4 mr-2 text-purple-500" />
              Best Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {progressData?.stats?.bestSubject || "N/A"}
            </div>
            <p className="text-sm text-gray-500">Highest performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Timeline</CardTitle>
            <CardDescription>Your test scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Score"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No test history available" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Mastery</CardTitle>
            <CardDescription>
              Performance across different subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {subjectProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectProgress}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Progress"
                      dataKey="progress"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No subject data available" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
          <CardDescription>Progress breakdown by subject</CardDescription>
        </CardHeader>
        <CardContent>
          {subjectProgress.length > 0 ? (
            <div className="space-y-6">
              {subjectProgress.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Book className="w-4 h-4 mr-2" />
                      <span className="font-medium">{subject.subject}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartPractice(subject.subject)}
                    >
                      Practice
                    </Button>
                  </div>
                  <ProgressIndicator value={subject.progress} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Average Score:</span>{" "}
                      {subject.progress.toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-medium">Tests Taken:</span>{" "}
                      {subject.tests}
                    </div>
                    <div>
                      <span className="font-medium">Best Score:</span>{" "}
                      {subject.bestScore.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No subject progress available yet" />
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest test results</CardDescription>
        </CardHeader>
        <CardContent>
          {progressData.recentTests?.length > 0 ? (
            <div className="space-y-4">
              {progressData.recentTests.map((test, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">{test.subject}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(test.testDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Number(test.score).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {test.correctAnswers}/{test.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No recent activity available" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Progress;
