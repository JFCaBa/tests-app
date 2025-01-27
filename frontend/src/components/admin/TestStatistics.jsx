import React, { useState, useEffect } from "react";
import { BarChart2, Calendar, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";

const TestStatistics = () => {
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    subjectStats: [],
    recentTests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/stats");
        setStats(response.data.tests);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch test statistics:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summaryCards = [
    {
      title: "Total Tests Taken",
      value: stats.totalTests,
      icon: BarChart2,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore?.toFixed(1)}%`,
      icon: Users,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Tests Today",
      value: stats.recentTests?.length || 0,
      icon: Calendar,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Average Duration",
      value: "25 min",
      icon: Clock,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.subjectStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTests?.map((test, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{test.subject}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(test.testDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {test.score.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {test.correctAnswers}/{test.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestStatistics;
