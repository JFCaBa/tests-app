import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCoach } from "../../contexts/CoachContext";
import coachService from "../../services/coach.service";
import chatService from "../../services/chat.service";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Bot, User } from "lucide-react";

// Subject and Suggestions configurations
const SUBJECTS = [
  { id: "listening", name: "Listening", icon: "🎧" },
  { id: "grammar", name: "Grammar", icon: "📝" },
  { id: "history", name: "History", icon: "📚" },
  { id: "laws", name: "Laws", icon: "⚖️" },
  { id: "reading", name: "Reading", icon: "📖" },
  { id: "writing", name: "Writing", icon: "✍️" },
];

const SUGGESTIONS = {
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

// Message component
const Message = React.memo(({ message, isUser, isError }) => (
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
));

Message.displayName = "Message";

// Suggestions component
const Suggestions = React.memo(({ onSelect, subject }) => {
  if (!subject || !SUGGESTIONS[subject]) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {SUGGESTIONS[subject].map((suggestion, index) => (
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
});

Suggestions.displayName = "Suggestions";

// Main component
const CoachChat = () => {
  const { user } = useAuth();
  const { isInitialized, lastError, initializeCoach, getLearningContext } =
    useCoach();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const scrollRef = useRef(null);

  // Initialize chat once
  useEffect(() => {
    const init = async () => {
      if (!initialized.current && user) {
        await initializeCoach();

        const context = getLearningContext();
        let greeting = `Hello ${user.username}! I'm your study coach. `;

        if (context?.totalTests > 0) {
          greeting += `I see you've taken ${
            context.totalTests
          } tests with an average score of ${context.averageScore.toFixed(
            1
          )}%. `;
        }

        if (context?.preferredSubjects?.length > 0) {
          greeting += `I notice you've been focusing on ${context.preferredSubjects.join(
            ", "
          )}. `;
        }

        greeting +=
          "Select a subject, and I'll help you prepare for your exam.";

        setMessages([
          {
            id: "greeting",
            text: greeting,
            isUser: false,
            timestamp: new Date().toISOString(),
          },
        ]);

        initialized.current = true;
      }
    };

    init();
  }, [user, initializeCoach, getLearningContext]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubjectChange = useCallback((newSubject) => {
    setSelectedSubject(newSubject);
  }, []);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !selectedSubject || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: textToSend,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await coachService.generateResponse(
        textToSend,
        selectedSubject,
        getLearningContext()
      );

      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="min-h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Study Coach
            {isInitialized ? (
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

          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
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
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                isError={message.isError}
              />
            ))}
          </ScrollArea>

          <div className="mt-4 flex flex-col gap-4">
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
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={
                  selectedSubject
                    ? "Ask your study coach..."
                    : "Select a subject first"
                }
                disabled={!selectedSubject || loading}
              />
              <Button
                onClick={() => handleSend()}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachChat;
