import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Trophy,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { testService } from "../../services/test.service";

const TimelineItem = ({ item }) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (item.type) {
      case "test_completed":
        return item.score >= 70 ? (
          <Trophy className="w-5 h-5 text-yellow-500" />
        ) : (
          <GraduationCap className="w-5 h-5 text-blue-500" />
        );
      case "practice_question":
        return item.correct ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        );
      case "achievement":
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeString = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInHours = (now - itemDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return t("timeline.timeFormat.hoursAgo", {
        hours: Math.round(diffInHours),
      });
    } else {
      return itemDate.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-start space-x-4 mb-4">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-900">{item.title}</p>
        <p className="text-sm text-gray-500">{item.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {getTimeString(item.timestamp)}
        </p>
      </div>
    </div>
  );
};

export const LearningTimeline = () => {
  const { t } = useTranslation();
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const [history, stats] = await Promise.all([
          testService.getHistory(),
          testService.getStats(),
        ]);

        const testItems = history.map((test) => ({
          type: "test_completed",
          title: t("timeline.test.completed", { subject: test.subject }),
          description: t("timeline.test.score", {
            score: test.score,
            correct: test.correctAnswers,
            total: test.totalQuestions,
          }),
          timestamp: test.testDate,
          score: test.score,
        }));

        const achievements = [];
        if (stats.totalTests >= 10) {
          achievements.push({
            type: "achievement",
            title: t("timeline.achievements.dedicatedLearner.title"),
            description: t(
              "timeline.achievements.dedicatedLearner.description"
            ),
            timestamp: new Date().toISOString(),
          });
        }

        if (stats.highestScore >= 90) {
          achievements.push({
            type: "achievement",
            title: t("timeline.achievements.excellence.title"),
            description: t("timeline.achievements.excellence.description"),
            timestamp: new Date().toISOString(),
          });
        }

        const allItems = [...testItems, ...achievements].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setTimelineData(allItems);
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [t]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("timeline.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("timeline.title")}</span>
          <span className="text-sm font-normal text-gray-500">
            {t("timeline.stats.activities", { count: timelineData.length })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {timelineData.length > 0 ? (
            <div className="space-y-6">
              {timelineData.map((item, index) => (
                <TimelineItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{t("timeline.empty.title")}</p>
              <p className="text-sm">{t("timeline.empty.subtitle")}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LearningTimeline;
