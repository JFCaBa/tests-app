import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, Clock, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const TestSummary = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, subject, mode, difficulty } = location.state || {};

  if (!stats) {
    navigate("/subjects");
    return null;
  }

  const percentage = Math.round((stats.correct / stats.total) * 100);

  const getPerformanceMessage = () => {
    if (percentage >= 90)
      return t("testSummary.stats.performance.messages.excellent");
    if (percentage >= 70)
      return t("testSummary.stats.performance.messages.good");
    if (percentage >= 50)
      return t("testSummary.stats.performance.messages.keep");
    return t("testSummary.stats.performance.messages.more");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{t("testSummary.title")}</CardTitle>
          <CardDescription>
            {t("testSummary.mode", {
              subject: subject.charAt(0).toUpperCase() + subject.slice(1),
              mode,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">
                    {t("testSummary.stats.accuracy.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{percentage}%</div>
                <p className="text-sm text-gray-500">
                  {t("testSummary.stats.accuracy.result", {
                    correct: stats.correct,
                    total: stats.total,
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm">
                    {t("testSummary.stats.performance.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getPerformanceMessage()}
                </div>
                <p className="text-sm text-gray-500">
                  {stats.streak > 1
                    ? t("testSummary.stats.performance.streak", {
                        streak: stats.streak,
                      })
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">
                    {t("testSummary.stats.timeSpent.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {t("testSummary.stats.timeSpent.minutes", {
                    minutes: Math.round(stats.timeSpent / 60),
                  })}
                </div>
                <p className="text-sm text-gray-500">
                  {t("testSummary.stats.timeSpent.perQuestion", {
                    seconds: Math.round(stats.timeSpent / stats.total),
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/subjects")}
            className="w-full sm:w-auto"
          >
            {t("testSummary.backToSubjects")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSummary;
