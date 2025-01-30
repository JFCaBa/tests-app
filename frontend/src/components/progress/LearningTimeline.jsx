import React, { useState, useEffect } from "react";
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

const TimelineItem = ({ item }) => {
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
      return `${Math.round(diffInHours)} hours ago`;
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
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await axios.get("/tests/history");
        const history = response.data;

        // Transform test history into timeline format
        const timelineItems = history.map((test) => ({
          type: "test_completed",
          title: `Completed ${test.subject} Test`,
          description: `Score: ${test.score}% - ${test.correctAnswers}/${test.totalQuestions} correct`,
          timestamp: test.testDate,
          score: test.score,
        }));

        setTimelineData(timelineItems);
      } catch (error) {
        console.error("Failed to fetch timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Timeline</CardTitle>
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
        <CardTitle>Learning Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          {timelineData.length > 0 ? (
            <div className="space-y-6">
              {timelineData.map((item, index) => (
                <TimelineItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No learning activity yet.</p>
              <p className="text-sm">Start practicing to see your progress!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LearningTimeline;
