import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  Book,
  History,
  GavelIcon,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const subjects = [
  {
    id: "listening",
    name: "Аудирование",
    description: "Practice your listening comprehension skills",
    icon: Headphones,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "grammar",
    name: "Лексика и грамматика",
    description: "Master language structure and rules",
    icon: Book,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "history",
    name: "История России",
    description: "Learn about historical events and their significance",
    icon: History,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "laws",
    name: "Основы Законодательства Российской Федерации",
    description: "Understand legal principles and regulations",
    icon: GavelIcon,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "reading",
    name: "Чтение",
    description: "Enhance your reading comprehension",
    icon: BookOpen,
    color: "bg-red-100 text-red-700",
  },
  {
    id: "writing",
    name: "Письмо",
    description: "Improve your writing skills",
    icon: PenTool,
    color: "bg-indigo-100 text-indigo-700",
  },
];

export const SubjectSelection = () => {
  const navigate = useNavigate();

  const handleSubjectSelect = (subjectId) => {
    navigate(`/practice/${subjectId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold mb-8">Choose a Subject</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <Card
              key={subject.id}
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle>{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{subject.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
