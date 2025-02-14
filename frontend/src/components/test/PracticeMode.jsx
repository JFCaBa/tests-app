import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    name: "modes.timed.name",
    description: "modes.timed.description",
    icon: Timer,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "targeted",
    name: "modes.targeted.name",
    description: "modes.targeted.description",
    icon: Target,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "continuous",
    name: "modes.continuous.name",
    description: "modes.continuous.description",
    icon: Infinity,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "review",
    name: "modes.review.name",
    description: "modes.review.description",
    icon: Book,
    color: "bg-purple-100 text-purple-700",
  },
];

export const PracticeMode = () => {
  const { t } = useTranslation();
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
        <h2 className="text-3xl font-bold mb-4">
          {t("practice.settings.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("practice.settings.difficulty.label")}
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("practice.settings.difficulty.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  {t("practice.settings.difficulty.work")}
                </SelectItem>
                <SelectItem value="medium">
                  {t("practice.settings.difficulty.temp")}
                </SelectItem>
                <SelectItem value="hard">
                  {t("practice.settings.difficulty.perm")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("practice.settings.questions.label")}
            </label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("practice.settings.questions.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} {t("practice.settings.questions.count")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6">{t("practice.modes.title")}</h3>
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
                <CardTitle>{t(`practice.${type.name}`)}</CardTitle>
                <CardDescription>
                  {t(`practice.${type.description}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  {t("practice.modes.start", {
                    mode: t(`practice.${type.name}`),
                  })}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate("/subjects")}>
          {t("practice.back")}
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;
