import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

export const RecentActivity = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    highestScore: 0,
    testsThisWeek: 0,
  });

  const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "listening", label: "Listening" },
    { value: "grammar", label: "Grammar" },
    { value: "history", label: "History" },
    { value: "laws", label: "Laws" },
    { value: "reading", label: "Reading" },
    { value: "writing", label: "Writing" },
  ];

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get("/tests/stats");
        const { recentTests, totalTests, statsBySubject } = response.data;

        // Process activity data for the chart
        const processedData = recentTests
          .map((test) => ({
            date: new Date(test.testDate).toLocaleDateString(),
            score: test.score,
            subject: test.subject,
          }))
          .reverse();

        setActivityData(processedData);

        // Calculate stats
        const thisWeekTests = recentTests.filter((test) => {
          const testDate = new Date(test.testDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return testDate >= weekAgo;
        });

        const allScores = recentTests.map((test) => test.score);
        setStats({
          totalTests,
          averageScore: allScores.length
            ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(
                1
              )
            : 0,
          highestScore: allScores.length ? Math.max(...allScores) : 0,
          testsThisWeek: thisWeekTests.length,
        });
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const filteredData =
    selectedSubject === "all"
      ? activityData
      : activityData.filter((item) => item.subject === selectedSubject);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Tests</p>
            <p className="text-2xl font-bold">{stats.totalTests}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Highest Score</p>
            <p className="text-2xl font-bold">{stats.highestScore}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold">{stats.testsThisWeek}</p>
          </div>
        </div>

        <div className="h-48">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Score"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No data available for the selected subject
              </p>
            </div>
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Recent Tests:</p>
            <div className="flex flex-wrap gap-2">
              {filteredData.slice(0, 5).map((test, index) => (
                <Badge key={index} variant="secondary">
                  {test.subject}: {test.score}%
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
