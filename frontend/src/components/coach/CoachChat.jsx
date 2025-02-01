import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import coachService from "../../services/coach.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, User, Book, Brain } from "lucide-react";

const Message = ({ message, isUser, isError }) => (
  <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
    <div
      className={`w-8 h-8 rounded-full ${
        isUser ? "bg-primary/10" : "bg-muted"
      } flex items-center justify-center`}
    >
      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    <div
      className={`flex-1 px-4 py-2 rounded-lg ${
        isUser
          ? "bg-primary text-primary-foreground"
          : isError
          ? "bg-destructive/10 text-destructive"
          : "bg-muted"
      }`}
    >
      {message}
    </div>
  </div>
);

const CoachChat = () => {
  const { user } = useAuth();
  const [serviceStatus, setServiceStatus] = useState({
    available: false,
    error: null,
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Check service status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await coachService.initialize();
        setServiceStatus({ available: status, error: null });
      } catch (error) {
        setServiceStatus({ available: false, error: error.message });
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      let greeting = `Hello ${user?.username}! I'm your study coach. `;

      if (user?.testHistory?.length > 0) {
        greeting += `I see you've taken ${user.testHistory.length} tests. `;
      }

      greeting += `Select a subject, and I'll help you prepare for your exam.`;

      setMessages([{ text: greeting, isUser: false }]);
    }
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSubject || loading) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const context = {
        progress:
          user?.testHistory?.length > 0
            ? user.testHistory.reduce((acc, test) => acc + test.score, 0) /
              user.testHistory.length
            : 0,
        recentScores:
          user?.testHistory
            ?.slice(-3)
            .map((test) => test.score)
            .join(", ") || "No tests taken",
        totalTests: user?.testHistory?.length || 0,
      };

      const response = await coachService.generateResponse(
        input,
        selectedSubject,
        context
      );
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble responding right now. Please try again.",
          isUser: false,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="min-h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Study Coach
            <div
              className={`flex items-center gap-2 text-sm ${
                serviceStatus.available ? "text-green-500" : "text-yellow-500"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  serviceStatus.available
                    ? "bg-green-500"
                    : "bg-yellow-500 animate-pulse"
                }`}
              ></div>
              {serviceStatus.available ? "Ready" : "Using Basic Assistance"}
            </div>
          </CardTitle>
          <CardDescription>
            Select a subject and ask questions about exam preparation
          </CardDescription>

          {serviceStatus.error && (
            <Alert variant="destructive">
              <AlertDescription>
                Using basic assistance mode. AI features are currently limited.
              </AlertDescription>
            </Alert>
          )}

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
                isError={message.isError}
              />
            ))}
          </ScrollArea>

          <CardFooter className="p-4 border-t">
            <div className="flex flex-col w-full gap-4">
              {selectedSubject && (
                <Suggestions
                  subject={selectedSubject}
                  onSelect={handleSuggestionSelect}
                />
              )}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your study coach..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  disabled={!selectedSubject || loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedSubject || loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachChat;
