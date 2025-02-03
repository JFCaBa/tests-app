import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, BarChart2, Settings, Book } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BulkQuestionUpload } from "./BulkQuestionUpload";
import QuestionForm from "./QuestionForm";
import CacheCleanup from "./CacheCleanup";
import ChatCleanup from "./ChatCleanup";
import axios from "axios";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    questions: { total: 0, active: 0, bySubject: [] },
    tests: { totalTests: 0, averageScore: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Initialize question form data
  const [formData, setFormData] = useState({
    subject: "",
    type: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: undefined,
    difficulty: "medium",
    explanation: "",
    sampleResponse: "",
    audioFile: null,
    imageFile: null,
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch admin statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuestionSubmit = async (questionData) => {
    try {
      await fetchStats();
      setShowQuestionForm(false);
    } catch (error) {
      console.error("Error handling question submission:", error);
    }
  };

  const handleCloseForm = () => {
    setShowQuestionForm(false);
    setFormData({
      subject: "",
      type: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: undefined,
      difficulty: "medium",
      explanation: "",
      sampleResponse: "",
      audioFile: null,
      imageFile: null,
    });
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowQuestionForm(true)}>
          Upload Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your test application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate("/admin/users")}>
              Manage Users
            </Button>
            <Button
              className="w-full"
              onClick={() => navigate("/admin/questions")}
            >
              Manage Questions
            </Button>
            <Button className="w-full" onClick={() => navigate("/admin/tests")}>
              View Test Statistics
            </Button>
          </CardContent>
        </Card>

        {/* Questions by Subject Card */}
        <Card>
          <CardHeader>
            <CardTitle>Questions by Subject</CardTitle>
            <CardDescription>Distribution across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.questions.bySubject.map((subject, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Book className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="capitalize">{subject._id}</span>
                  </div>
                  <span className="font-bold">{subject.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance Section */}
        <div className="col-span-full">
          <h2 className="text-2xl font-bold mb-4">System Maintenance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CacheCleanup />
            <ChatCleanup />
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleQuestionSubmit}
          onClose={handleCloseForm}
          editingQuestion={false}
          onSubmitSuccess={handleQuestionSubmit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
