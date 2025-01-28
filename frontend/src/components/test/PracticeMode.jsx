import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Timer, Target, Infinity, Book } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const practiceTypes = [
  {
    id: "timed",
    name: "Timed Practice",
    description: "Practice with a time limit for each question",
    icon: Timer,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "targeted",
    name: "Targeted Practice",
    description: "Focus on specific topics or question types",
    icon: Target,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "continuous",
    name: "Continuous Practice",
    description: "Practice without time limits or restrictions",
    icon: Infinity,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "review",
    name: "Review Previous",
    description: "Review questions from past sessions",
    icon: Book,
    color: "bg-purple-100 text-purple-700",
  },
];

export const PracticeMode = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [difficulty, setDifficulty] = useState(settings.defaultDifficulty);
  const [questionCount, setQuestionCount] = useState(
    settings.questionsPerTest.toString()
  );

  const handleStartPractice = (practiceType) => {
    navigate(`/practice/${subject}/${practiceType}`, {
      state: {
        difficulty,
        questionCount: parseInt(questionCount, 10),
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Practice Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions
            </label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue placeholder="Select question count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6">Choose Practice Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practiceTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleStartPractice(type.id)}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle>{type.name}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start {type.name}</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate("/subjects")}>
          Back to Subjects
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;
