import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, AlertCircle, Video } from "lucide-react";
import axios from "axios";

const SessionCard = ({ session, onJoin }) => {
  if (!session) return null;

  const isUpcoming = new Date(session.startTime) > new Date();
  const startTime = format(new Date(session.startTime), "MMM d, yyyy h:mm a");
  const endTime = format(new Date(session.endTime), "h:mm a");
  const { t } = useTranslation();

  // Safely access tutor name with fallback
  const tutorName = session.tutorId?.name || t("tuition.unknownTutor");

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium mb-2">
              {t("tuition.sessionWith")} {tutorName}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>60 {t("tuition.minutes")}</span>
            </div>
          </div>
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? t("tuition.upcoming") : t("tuition.completed")}
          </Badge>
        </div>
        {isUpcoming && session.meetingUrl && (
          <Button
            className="mt-4 w-full sm:w-auto"
            onClick={() => onJoin(session.meetingUrl)}
          >
            <Video className="w-4 h-4 mr-2" />
            {t("tuition.joinSession")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get("/tutors/sessions");
        console.log("Sessions: ", response.data);
        setSessions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleJoinSession = (url) => {
    window.open(url, "_blank");
  };

  const upcomingSessions = sessions.filter(
    (session) => new Date(session.startTime) > new Date()
  );

  const pastSessions = sessions.filter(
    (session) => new Date(session.startTime) <= new Date()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("tuition.mySessions")}</CardTitle>
          <Button onClick={() => navigate("/tuition")}>
            {t("tuition.bookNewSession")}
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {t("tuition.noSessionsFound")}
              </p>
              <Button onClick={() => navigate("/tuition")}>
                {t("tuition.bookYourFirstSession")}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">
                  {t("tuition.upcomming")} ({upcomingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  {t("tuition.past")} ({pastSessions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <ScrollArea className="h-[600px] pr-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onJoin={handleJoinSession}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="past">
                <ScrollArea className="h-[600px] pr-4">
                  {pastSessions.map((session) => (
                    <SessionCard key={session._id} session={session} />
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sessions;
