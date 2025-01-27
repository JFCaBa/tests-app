import React, { useState, useEffect } from "react";
import { Users, FileText, BarChart2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    questions: { total: 0, active: 0, bySubject: [] },
    tests: { totalTests: 0, averageScore: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch admin statistics:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Questions",
      value: stats.questions.active,
      icon: FileText,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Tests Taken",
      value: stats.tests.totalTests,
      icon: BarChart2,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Average Score",
      value: `${stats.tests.averageScore.toFixed(1)}%`,
      icon: Settings,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/admin/users")}
            >
              Manage Users
            </Button>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/admin/questions")}
            >
              Manage Questions
            </Button>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/admin/tests")}
            >
              View Test Statistics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.questions.bySubject.map((subject, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="capitalize">{subject._id}</span>
                  <span className="font-bold">{subject.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
