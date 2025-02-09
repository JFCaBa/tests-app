import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import YandexAdBanner from "../ads/YandexAdBanner";
import TranslationAnnouncement from "../common/TranslationGuide";

// Demo questions covering different types
const demoQuestions = [
  {
    id: 1,
    type: "multiple-choice",
    text: "В Российской Федерации находится город",
    question: "Выберите правильный ответ",
    options: ["София", "Владивосток", "Берлин"],
    correctAnswer: 1,
    explanation:
      "Владивосток - это город в Российской Федерации, расположенный на Дальнем Востоке.",
  },
  {
    id: 2,
    type: "multiple-choice",
    text: "7 января в России празднуют",
    question: "Выберите правильный ответ",
    options: [
      "День России",
      "Международный женский день",
      "Рождество Христово",
    ],
    correctAnswer: 2,
    explanation:
      "7 января в России отмечается один из главных христианских праздников - Рождество Христово.",
  },
  {
    id: 3,
    type: "multiple-choice",
    text: "Великая Отечественная война закончилась ______________.",
    question: "Выберите правильный ответ",
    options: ["в 1917 г.", "в 1945 г.", "в 1980 г."],
    correctAnswer: 1,
    explanation:
      "Великая Отечественная война закончилась в 1945 году победой советского народа.",
  },
  {
    id: 4,
    type: "multiple-choice",
    text: "По общему правилу срок постановки иностранного гражданина на миграционный учёт составляет",
    question: "Выберите правильный ответ",
    options: ["3 рабочих дня", "7 рабочих дней", "10 рабочих дней"],
    correctAnswer: 1,
    explanation:
      "По общему правилу иностранный гражданин должен встать на миграционный учёт в течение 7 рабочих дней.",
  },
  {
    id: 5,
    type: "multiple-choice",
    text: "Я люблю _______________ хорошую музыку.",
    question: "Выберите правильный ответ",
    options: ["читать", "слушать", "смотреть"],
    correctAnswer: 1,
    explanation:
      "С музыкой используется глагол 'слушать'. Нельзя читать или смотреть музыку.",
  },
  {
    id: 6,
    type: "multiple-choice",
    text: "Позвоните _____________, пожалуйста, завтра.",
    question: "Выберите правильный ответ",
    options: ["мне", "я", "меня"],
    correctAnswer: 0,
    explanation:
      "После глагола 'позвонить' используется дательный падеж (кому?) - 'мне'.",
  },
];

export const DemoTest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const { t } = useTranslation();

  const currentQuestion = demoQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / demoQuestions.length) * 100;

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < demoQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Show completion message or redirect
      navigate("/landing");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(false);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">t("demo.welcome.title")</CardTitle>
            <CardDescription>t("demo.welcome.subtitle")</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">t("demo.welcome.whatToExpect")</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>3 questions showcasing different subjects</li>
                <li>Grammar</li>
                <li>History</li>
                <li>Laws</li>
              </ul>
              <p className="text-sm text-gray-600">
                This is a simplified version of our full test. Take your time -
                there's no timer in the demo.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStart} size="lg" className="w-full">
              Start Demo Test
            </Button>
          </CardFooter>
        </Card>
        {/* Ad Banner Section */}
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* <YandexAdBanner /> */}
        </div>
      </div>
    );
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  userAnswers[currentQuestion.id] === index
                    ? "default"
                    : "outline"
                }
                className={`w-full justify-start text-left ${
                  showFeedback && index === currentQuestion.correctAnswer
                    ? "bg-green-100 hover:bg-green-100 text-black"
                    : showFeedback && userAnswers[currentQuestion.id] === index
                    ? "bg-red-100 hover:bg-red-100 text-black"
                    : ""
                }`}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Progress value={progress} className="w-full" />

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                Question {currentQuestionIndex + 1} of {demoQuestions.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
            <p className="text-lg">{currentQuestion.question}</p>
            {renderQuestion()}
          </CardContent>
          {showFeedback && currentQuestion.explanation && (
            <CardContent>
              <Alert>
                <AlertDescription>
                  {currentQuestion.explanation}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              // Only disable if feedback is not shown yet
              disabled={!showFeedback}
            >
              {currentQuestionIndex === demoQuestions.length - 1
                ? "Complete Demo"
                : "Next"}
              {currentQuestionIndex < demoQuestions.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CardFooter>
        </Card>
        <TranslationAnnouncement />
      </div>
    </div>
  );
};

export default DemoTest;
