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

const AdminStatsDashboard = () => {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      admins: 0,
      active: 0,
    },
    questions: {
      total: 0,
      active: 0,
      bySubject: [],
    },
    tests: {
      totalTests: 0,
      averageScore: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/admin/stats");
        console.log("Stats response:", response.data); // For debugging
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setError(error.response?.data?.message || "Failed to fetch statistics");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Transform subject data for the chart
  const subjectChartData = stats.questions.bySubject.map((subject) => ({
    name: subject._id,
    questions: subject.count,
  }));

  const summaryCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Questions",
      value: stats.questions.active,
      icon: BarChart2,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total Tests",
      value: stats.tests?.totalTests || 0,
      icon: Calendar,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Average Score",
      value: `${(stats.tests?.averageScore || 0).toFixed(1)}%`,
      icon: Clock,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

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
            <CardTitle>Questions by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={subjectChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="questions"
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
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Users</span>
                <span className="font-bold">{stats.users.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Active Users</span>
                <span className="font-bold">{stats.users.active}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Admin Users</span>
                <span className="font-bold">{stats.users.admins}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Questions</span>
                <span className="font-bold">{stats.questions.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatsDashboard;
