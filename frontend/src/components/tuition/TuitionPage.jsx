import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import TutorCard from "./TutorCard";

export const TuitionPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await axios.get("/tutors");
        if (response.data.length === 0) {
          setError(true);
        } else {
          setTutors(response.data);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <h2 className="text-2xl font-bold text-gray-700">Coming Soon</h2>
        <p className="text-gray-500 mt-2">
          New tutors will be available soon. Stay tuned!
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Book a Tuition Session</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <TutorCard key={tutor._id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
};

export default TuitionPage;
