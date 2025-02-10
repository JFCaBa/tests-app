// components/tuition/TutorCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, PhoneCall, MapPin, MessageCircle } from "lucide-react";

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  const getDefaultAvatar = (gender) => {
    return gender === "female"
      ? "/avatars/female-default.png"
      : "/avatars/male-default.png";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={tutor.avatarUrl || getDefaultAvatar(tutor.gender)}
              alt={tutor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
            {tutor.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{tutor.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tutor.location || "Location not specified"}
                </CardDescription>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-bold">{tutor.rating || "New"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-2">{tutor.bio}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {tutor.totalHours}+ hours taught
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MessageCircle className="w-4 h-4 mr-2" />
            {tutor.responseTime || "Quick"} response
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Hourly Rate</p>
            <p className="font-bold text-2xl">${tutor.hourlyRate}</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button onClick={() => navigate(`/tuition/book/${tutor._id}`)}>
              Book Session
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Payment methods:</span>
            <div className="flex gap-2 mt-1">
              {tutor.phonePayments && <Badge variant="outline">Phone</Badge>}
              {tutor.paypalPayments && <Badge variant="outline">PayPal</Badge>}
            </div>
          </div>
          {tutor.phoneNumber && (
            <Button variant="ghost" size="sm">
              <PhoneCall className="w-4 h-4 mr-2" />
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorCard;
