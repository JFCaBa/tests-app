import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, Clock, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const TutorDetails = () => {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [sessions, setSessions] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, sessionsRes] = await Promise.all([
          axios.get(`/admin/tutors/${id}`),
          axios.get(`/admin/tutors/${id}/sessions`),
        ]);

        setTutor(tutorRes.data);
        setSessions({
          upcoming: sessionsRes.data.upcoming,
          past: sessionsRes.data.past,
        });
      } catch (error) {
        console.error("Failed to fetch tutor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const pastPayments = sessions.past.reduce(
    (total, session) => total + session.duration * tutor.hourlyRate,
    0
  );
  const upcomingPayments = sessions.upcoming.reduce(
    (total, session) => total + session.duration * tutor.hourlyRate,
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Past Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pastPayments)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(upcomingPayments)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.past.reduce(
                (total, session) => total + session.duration,
                0
              )}
              h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.upcoming.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {sessions.upcoming.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No upcoming sessions
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.upcoming.map((session) => (
                    <div key={session._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{session.student.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                        <Badge>{session.duration}h</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Subject: {session.subject}</p>
                        <p>
                          Fee:{" "}
                          {formatCurrency(session.duration * tutor.hourlyRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Past Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {sessions.past.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No past sessions
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.past.map((session) => (
                    <div key={session._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{session.student.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                        <Badge variant="secondary">{session.duration}h</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Subject: {session.subject}</p>
                        <p>
                          Fee:{" "}
                          {formatCurrency(session.duration * tutor.hourlyRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorDetails;
