// components/tuition/TuitionPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import TutorCard from "./TutorCard";

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
        setTutors([]);
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
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("tuition.availableTutors")}</CardTitle>
        </CardHeader>
        <CardContent>
          {tutors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t("tuition.noTutorsAvailable")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutors.map((tutor) => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TuitionPage;
