import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Star, Zap, Brain, Check, ArrowRight } from "lucide-react";

const SubscriptionNotice = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Remove auto-redirect for admins, let SubscriptionRoute handle that
  const features = [
    {
      icon: Brain,
      title: "AI Study Coach",
      description: "Get personalized help with your exam preparation",
    },
    {
      icon: Star,
      title: "Smart Explanations",
      description: "Receive detailed explanations for every question",
    },
    {
      icon: Zap,
      title: "Real-time Assistance",
      description: "Ask questions and get immediate responses",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-8 bg-gradient-to-b from-primary/10 to-background">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl">Coming Soon</CardTitle>
          <CardDescription className="text-lg">
            AI Study Coach - Premium Feature
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground">
              We're working on an advanced AI-powered study coach to help you
              prepare for your exam more effectively. This premium feature will
              be available soon through our subscription plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">What to expect:</h3>
            <ul className="space-y-3">
              {[
                "Personalized learning recommendations",
                "In-depth explanations of complex topics",
                "Practice question suggestions",
                "Real-time answers to your study questions",
                "Progress tracking and analytics",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pb-8">
          <Button
            className="w-full max-w-sm"
            onClick={() => navigate("/subjects")}
          >
            Continue with Free Practice
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground">
            We'll notify you when subscriptions become available
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionNotice;
