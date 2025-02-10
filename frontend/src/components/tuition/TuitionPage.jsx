import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import axios from "axios";

const TuitionPage = () => {
  const { t } = useTranslation();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/tutors");
        setTutors(response.data.tutors ? response.data.tutors : []);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
        setError(err.message || "Failed to load tutors");
        setTutors([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("tuition.availableTutors")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tuition.name")}</TableHead>
                <TableHead>{t("nav.subjects")}</TableHead>
                <TableHead>{t("tuition.rate")}</TableHead>
                <TableHead>{t("tuition.availability")}</TableHead>
                <TableHead>{t("tuition.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {t("tuition.noTutorsAvailable")}
                  </TableCell>
                </TableRow>
              ) : (
                tutors.map((tutor) => (
                  <TableRow key={tutor._id}>
                    <TableCell className="font-medium">{tutor.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(tutor.subjects || []).map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>${tutor.hourlyRate}/hr</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {tutor.availability || t("tuition.flexible")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        {t("tuition.bookSession")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TuitionPage;
