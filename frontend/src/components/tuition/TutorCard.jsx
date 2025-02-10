// components/tuition/TutorCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{tutor.user.username}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {tutor.subjects.map((subject) => (
            <Badge key={subject} variant="secondary">
              {subject}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{tutor.bio}</p>
        <div className="flex justify-between items-center">
          <p className="font-bold text-lg">${tutor.hourlyRate}/hour</p>
          <Button onClick={() => navigate(`/tuition/book/${tutor._id}`)}>
            Book Session
          </Button>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Payment methods accepted:</p>
          <div className="flex gap-2 mt-1">
            {tutor.phonePayments && <Badge variant="outline">Phone</Badge>}
            {tutor.paypalPayments && <Badge variant="outline">PayPal</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorCard;
