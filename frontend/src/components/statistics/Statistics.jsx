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
  return Number(((correct / total) * 100).toFixed(1));
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

        // Fetch both test stats and history
        const [statsResponse, historyResponse] = await Promise.all([
          axios.get("/tests/stats"),
          axios.get("/tests/history"),
        ]);

        // Process test history
        const history = historyResponse.data || [];
        const sortedHistory = [...history]
          .sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
          .map((test) => ({
            date: new Date(test.testDate).toLocaleDateString(),
            score: test.score,
            subject: test.subject,
          }));

        setTestHistory(sortedHistory);

        // Process statistics
        const statsData = statsResponse.data;
        if (statsData) {
          setStats({
            totalTests: statsData.totalTests,
            averageScore: calculatePercentage(
              statsData.totalCorrect,
              statsData.totalTests
            ),
            statsBySubject: Object.entries(
              statsData.statsBySubject || {}
            ).reduce((acc, [subject, data]) => {
              acc[subject] = {
                totalTests: data.totalTests,
                averageScore: calculatePercentage(
                  data.correctAnswers,
                  data.totalTests
                ),
                bestScore: data.bestScore,
              };
              return acc;
            }, {}),
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Find best subject
  const getBestSubject = () => {
    if (!stats?.statsBySubject) return "None";

    return Object.entries(stats.statsBySubject).reduce(
      (best, [subject, data]) => {
        if (data.averageScore > best.score) {
          return { subject, score: data.averageScore };
        }
        return best;
      },
      { subject: "None", score: 0 }
    ).subject;
  };

  // Prepare data for the bar chart
  const subjectData = Object.entries(stats?.statsBySubject || {}).map(
    ([subject, data]) => ({
      subject,
      tests: data.totalTests,
      avgScore: data.averageScore,
    })
  );

  // Get recent tests count (last 30 days)
  const getRecentTestsCount = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return testHistory.filter((test) => new Date(test.date) >= thirtyDaysAgo)
      .length;
  };

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
            <p className="text-3xl font-bold">{stats?.averageScore || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{getBestSubject()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{getRecentTestsCount()}</p>
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
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", r: 4 }}
                    activeDot={{ r: 6 }}
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
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Average Score"]}
                  />
                  <Bar
                    dataKey="avgScore"
                    fill="#8884d8"
                    animationDuration={1000}
                  />
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
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={true}
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
