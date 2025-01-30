import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const calculatePercentage = (correct, total) => {
  if (!total) return 0;
  return (correct / total) * 100;
};

export const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch test history
        const historyResponse = await axios.get("/tests/history");
        const history = historyResponse.data;

        // Sort history by date and format for chart
        const sortedHistory = history
          .sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
          .map((test) => ({
            date: new Date(test.testDate).toLocaleDateString(),
            score: test.score,
            subject: test.subject,
          }));

        setTestHistory(sortedHistory);

        // Process user statistics
        if (user?.statistics) {
          setStats({
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
                  averageTimeSpent: data.averageTimeSpent,
                  bestScore: calculatePercentage(data.correct, data.answered),
                };
                return acc;
              },
              {}
            ),
          });
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare data for charts
  const subjectData = Object.entries(stats?.statsBySubject || {}).map(
    ([subject, data]) => ({
      subject,
      tests: data.totalTests,
      avgScore: data.averageScore,
    })
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalTests || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.averageScore.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {
                Object.entries(stats?.statsBySubject || {}).reduce(
                  (best, [subject, data]) =>
                    data.averageScore > (best?.score || 0)
                      ? { subject, score: data.averageScore }
                      : best,
                  { subject: "None", score: 0 }
                ).subject
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{testHistory.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    dot={{ fill: "#8884d8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="subject"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Test Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    dataKey="tests"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {subjectData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
