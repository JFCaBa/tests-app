import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCoach } from "../../contexts/CoachContext";
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
import { Send, Bot, User, Book, Brain, AlertCircle } from "lucide-react";

const SUBJECTS = [
  { id: "listening", name: "Listening", icon: "🎧" },
  { id: "grammar", name: "Grammar", icon: "📝" },
  { id: "history", name: "History", icon: "📚" },
  { id: "laws", name: "Laws", icon: "⚖️" },
  { id: "reading", name: "Reading", icon: "📖" },
  { id: "writing", name: "Writing", icon: "✍️" },
];

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

// Suggestions component for quick questions
const Suggestions = ({ onSelect, subject }) => {
  const suggestions = {
    listening: [
      "How can I improve my listening comprehension?",
      "What are common mistakes in listening tests?",
      "Tips for understanding fast speech",
    ],
    grammar: [
      "Help with case usage",
      "Verb aspects explanation",
      "Common grammar mistakes",
    ],
    history: [
      "Key historical dates to remember",
      "Important historical figures",
      "Tips for history exam preparation",
    ],
    laws: [
      "Essential legal concepts",
      "Common law test questions",
      "How to study legal terminology",
    ],
    reading: [
      "Reading comprehension strategies",
      "How to improve reading speed",
      "Tips for understanding context",
    ],
    writing: [
      "Writing structure tips",
      "Common writing mistakes",
      "How to improve essay writing",
    ],
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions[subject]?.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

const CoachChat = () => {
  const { user } = useAuth();
  const { isInitialized, lastError, initializeCoach, getLearningContext } =
    useCoach();
  const [modelStatus, setModelStatus] = useState({
    isInitialized: false,
    modelLoaded: false,
  });

  // Check model status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await coachService.getStatus();
      setModelStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    initializeCoach();
  }, [initializeCoach]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const context = getLearningContext();
      let greeting = `Hello ${user?.username}! I'm your study coach. `;

      if (context) {
        if (context.totalTests > 0) {
          greeting += `I see you've taken ${
            context.totalTests
          } tests with an average score of ${context.progress.toFixed(1)}%. `;
        }
        if (context.preferredSubjects.length > 0) {
          greeting += `I notice you've been focusing on ${context.preferredSubjects.join(
            ", "
          )}. `;
        }
      }

      greeting += `Select a subject, and I'll help you prepare for your exam.`;

      setMessages([{ text: greeting, isUser: false }]);
    }
  }, [user, getLearningContext]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSubject) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const context = getLearningContext();
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
    handleSend();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="min-h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Study Coach
            {modelStatus.isInitialized ? (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                AI Ready
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                Loading AI Model
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Select a subject and ask questions about exam preparation
          </CardDescription>

          {lastError && (
            <Alert variant="destructive">
              <AlertDescription>
                AI features might be limited. Falling back to basic assistance.
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
            {selectedSubject && messages.length === 1 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Here are some suggestions to get started:
                </p>
                <Suggestions
                  subject={selectedSubject}
                  onSelect={handleSuggestionSelect}
                />
              </div>
            )}
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
                  <Send className="h-4 w-4" />
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
