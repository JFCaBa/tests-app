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
import { LearningTimeline } from "./components/progress/LearningTimeline";
import { RecentActivity } from "./components/progress/RecentActivity";

import axios from "axios";

const calculatePercentage = (correct, total) => {
  if (!total) return 0;
  return (correct / total) * 100;
};

export const Progress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (user?.statistics) {
          const progressData = {
            stats: {
              totalTests: user.statistics.totalAnswered,
              averageScore: calculatePercentage(
                user.statistics.totalCorrect,
                user.statistics.totalAnswered
              ),
              statsBySubject: Object.entries(user.statistics.bySubject).reduce(
                (acc, [subject, data]) => {
                  acc[subject] = {
                    totalTests: data.answered,
                    averageScore: calculatePercentage(
                      data.correct,
                      data.answered
                    ),
                    bestScore: calculatePercentage(data.correct, data.answered),
                    totalTime: data.averageTimeSpent * data.answered,
                  };
                  return acc;
                },
                {}
              ),
            },
          };

          setProgressData(progressData);
        }
      } catch (error) {
        console.error("Error processing progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare data for visualization
  const subjectProgress = Object.entries(user?.statistics?.bySubject || {}).map(
    ([subject, data]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      progress: (data.correct / data.answered) * 100,
      tests: data.answered,
      bestScore: (data.correct / data.answered) * 100,
      totalTime: data.averageTimeSpent * data.answered,
    })
  );

  const timelineData =
    progressData?.history?.map((test) => ({
      date: new Date(test.testDate).toLocaleDateString(),
      score: test.score,
      subject: test.subject,
    })) || [];

  const calculateLevel = (tests, avgScore) => {
    if (tests < 5) return "Beginner";
    if (tests < 15) return avgScore > 70 ? "Intermediate" : "Beginner";
    return avgScore > 80
      ? "Advanced"
      : avgScore > 60
      ? "Intermediate"
      : "Beginner";
  };

  const overallProgress =
    progressData?.stats?.statsBySubject?.all?.averageScore || 0;
  const totalTests = progressData?.stats?.totalTests || 0;
  const level = calculateLevel(totalTests, overallProgress);

  const handleStartPractice = (subject) => {
    navigate(`/practice/${subject.toLowerCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
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
            <div className="text-2xl font-bold">{level}</div>
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
            <div className="text-2xl font-bold">{totalTests}</div>
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
              {progressData?.stats?.averageScore.toFixed(1) || 0}%
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
              {subjectProgress.reduce(
                (best, current) =>
                  current.progress > (best?.progress || 0) ? current : best,
                {}
              )?.subject || "N/A"}
            </div>
            <p className="text-sm text-gray-500">Highest performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningTimeline />

        <Card>
          <CardHeader>
            <CardTitle>Subject Mastery</CardTitle>
            <CardDescription>
              Performance across different subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Subject Progress</CardTitle>
          <CardDescription>Your progress breakdown by subject</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <RecentActivity />
      </div>
    </div>
  );
};

export default Progress;
