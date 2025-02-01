import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, User, Book, Trophy, Brain } from "lucide-react";

const SUBJECTS = [
  { id: "listening", name: "Listening", icon: "🎧" },
  { id: "grammar", name: "Grammar", icon: "📝" },
  { id: "history", name: "History", icon: "📚" },
  { id: "laws", name: "Laws", icon: "⚖️" },
  { id: "reading", name: "Reading", icon: "📖" },
  { id: "writing", name: "Writing", icon: "✍️" },
];

const Message = ({ message, isUser }) => (
  <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    <div
      className={`flex-1 px-4 py-2 rounded-lg ${
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      {message}
    </div>
  </div>
);

const CoachChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: `Hello ${user?.username}! I'm your study coach. Select a subject, and I'll help you prepare for your exam. You can ask me about study strategies, practice questions, or specific topics you're struggling with.`,
          isUser: false,
        },
      ]);
    }
  }, [user]);

  const generateResponse = async (userInput, subject) => {
    // Here we'll simulate AI response generation
    // In a real implementation, this would connect to your local AI service
    const responses = {
      listening: {
        tips: "For listening exercises, try to practice with various accents and speeds. Focus on understanding the main idea first.",
        preparation:
          "Regular practice with Russian media, podcasts, and news will help improve your listening skills.",
        common:
          "Pay attention to intonation and stress patterns in Russian speech.",
      },
      grammar: {
        tips: "Focus on understanding case usage and verb aspects, they're fundamental to Russian grammar.",
        preparation:
          "Create tables for declensions and conjugations, practice them daily.",
        common: "Pay special attention to verb of motion and their prefixes.",
      },
      // Add other subjects...
    };

    // Simple keyword matching
    const lowercaseInput = userInput.toLowerCase();
    let response = "";

    if (lowercaseInput.includes("tip") || lowercaseInput.includes("advice")) {
      response = responses[subject]?.tips;
    } else if (
      lowercaseInput.includes("prepare") ||
      lowercaseInput.includes("study")
    ) {
      response = responses[subject]?.preparation;
    } else {
      response = responses[subject]?.common;
    }

    return (
      response ||
      "I'm here to help you with your studies. What specific aspect would you like to focus on?"
    );
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSubject) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await generateResponse(input, selectedSubject);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble responding right now. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Study Coach
          </CardTitle>
          <CardDescription>
            Select a subject and ask questions about exam preparation
          </CardDescription>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <span className="flex items-center gap-2">
                    {subject.icon} {subject.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages.map((message, index) => (
              <Message
                key={index}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your study coach... (comming soon)"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={!selectedSubject || loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || !selectedSubject || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachChat;
