import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, RotateCw, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSettings } from "../../contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import YandexAdBanner from "../ads/YandexAdBanner";

const FlashcardGame = () => {
  const { settings } = useSettings();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    settings.defaultDifficulty
  );
  const [questionCount, setQuestionCount] = useState(settings.questionsPerTest);
  const { t } = useTranslation();

  const subjects = [
    { value: "laws", label: t("common.laws") },
    { value: "history", label: t("common.history") },
    { value: "grammar", label: t("common.grammar") },
  ];

  const loadCards = async () => {
    if (!selectedSubject) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get("/questions", {
        params: {
          subject: selectedSubject,
          difficulty: selectedDifficulty,
          type: "multiple-choice",
          limit: questionCount,
        },
      });

      if (response.data.questions) {
        const formattedCards = response.data.questions.map((q) => ({
          question: q.question,
          answer: Array.isArray(q.options)
            ? typeof q.options[q.correctAnswer] === "object"
              ? q.options[q.correctAnswer].text
              : q.options[q.correctAnswer]
            : t("flashcards.anserNotAvailable"),
          subject: q.subject,
          explanation: q.explanation || "",
        }));

        setCards(formattedCards);
        setCurrentIndex(0);
        setScore(0);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnew = () => {
    setScore(score + 1);
    handleNext();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("common.subject")} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("common.dificulty")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Разрешение на работу</SelectItem>
            <SelectItem value="medium">
              Разрешение на временное проживание
            </SelectItem>
            <SelectItem value="hard">Вид на жительство</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={questionCount.toString()}
          onValueChange={(value) => setQuestionCount(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("flashcards.numberOfQuestions")} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20].map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count} Questions
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={loadCards} disabled={!selectedSubject || loading}>
          {t("flashcards.loadCards")}
        </Button>
      </div>

      {cards.length > 0 ? (
        <div>
          {currentIndex >= cards.length ? (
            <Card className="p-6">
              <div className="text-center space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
                  <div className="flex justify-center items-center gap-2 text-3xl font-bold text-primary">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <span>
                      {score}/{cards.length}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {score === cards.length
                      ? t("flashcards.perfectScore")
                      : score >= cards.length * 0.7
                      ? t("flashcards.greatJob")
                      : t("flashcards.keepPracticing")}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex(0);
                      setScore(0);
                      setIsFlipped(false);
                    }}
                  >
                    Try Again
                  </Button>
                  <Button onClick={loadCards}>New Cards</Button>
                </div>
              </div>
            </Card>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Flashcards</h2>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" />
                  <span className="font-bold">
                    {score}/{cards.length}
                  </span>
                </div>
              </div>

              <Progress value={progress} className="mb-4" />

              <div className="relative perspective-1000">
                <Card
                  className={`w-full min-h-[300px] transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <CardContent className="absolute inset-0 backface-hidden p-6 flex items-center justify-center text-center">
                    <div>
                      <div className="mb-4">
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-sm capitalize">
                          {currentCard?.subject}
                        </span>
                      </div>
                      <p className="text-lg">{currentCard?.question}</p>
                    </div>
                  </CardContent>

                  <CardContent className="absolute inset-0 backface-hidden rotate-y-180 p-6 flex items-center justify-center text-center bg-primary text-primary-foreground">
                    <div>
                      <p className="text-lg mb-4">{currentCard?.answer}</p>
                      {currentCard?.explanation && (
                        <p className="text-sm mt-4 p-2 bg-primary-foreground/10 rounded">
                          {currentCard.explanation}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Flip
                  </Button>
                  <Button onClick={handleKnew}>
                    <Star className="w-4 h-4 mr-2" />
                    Knew It
                  </Button>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= cards.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold mb-2">No Flashcards Loaded</h2>
          <p className="text-gray-600">{t("flashcards.selectSubject")}</p>
        </div>
      )}

      <YandexAdBanner />
    </div>
  );
};

export default FlashcardGame;
