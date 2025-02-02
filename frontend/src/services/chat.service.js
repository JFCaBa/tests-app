import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCoach } from "../../contexts/CoachContext";
import { processMessages } from "../../utils/formatText";
import coachService from "../../services/coach.service";
import chatService from "../../services/chat.service";
import Message from "../chat/Message";
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
  const processedMessages = processMessages(messages);

  const loadMessages = useCallback(async () => {
    if (!selectedSubject) return;

    try {
      const subjectMessages = await chatService.getMessages(selectedSubject);
      if (subjectMessages && subjectMessages.length > 0) {
        setMessages(subjectMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, [selectedSubject]);

  useEffect(() => {
    const init = async () => {
      if (!initialized.current && user) {
        await initializeCoach();

        const cachedMessages = await chatService.getMessages();
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
        } else {
          const context = getLearningContext();
          let greeting = "Hello " + user.username + "! I'm your study coach. ";

          if (context?.totalTests > 0) {
            greeting += "I see you've taken " + context.totalTests + " tests. ";
          }

          if (context?.preferredSubjects?.length > 0) {
            greeting +=
              "I notice you've been focusing on " +
              context.preferredSubjects.join(", ") +
              ". ";
          }

          greeting +=
            "Select a subject, and I'll help you prepare for your exam.";

          const greetingMessage = {
            id: "greeting",
            text: greeting,
            isUser: false,
            timestamp: new Date().toISOString(),
            subject: "general",
          };

          setMessages([greetingMessage]);
          await chatService.saveMessage(greetingMessage);
        }

        initialized.current = true;
      }
    };

    init();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, initializeCoach, getLearningContext, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubjectChange = useCallback(async (newSubject) => {
    setSelectedSubject(newSubject);
    if (newSubject) {
      setLoading(true);
      try {
        const subjectMessages = await chatService.getMessages(newSubject);
        if (subjectMessages && subjectMessages.length > 0) {
          setMessages(subjectMessages);
        } else {
          const subjectName = SUBJECTS.find((s) => s.id === newSubject)?.name;
          const greeting = {
            id: "greeting-" + newSubject,
            text: "Let's work on " + subjectName + ". How can I help you?",
            isUser: false,
            timestamp: new Date().toISOString(),
            subject: newSubject,
          };
          setMessages([greeting]);
          await chatService.saveMessage(greeting);
        }
      } catch (error) {
        console.error("Error loading subject messages:", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !selectedSubject || loading) return;

    const userMessage = {
      id: "user-" + Date.now(),
      text: textToSend,
      isUser: true,
      timestamp: new Date().toISOString(),
      subject: selectedSubject,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await chatService.saveMessage(userMessage);

      const response = await coachService.generateResponse(
        textToSend,
        selectedSubject,
        getLearningContext()
      );

      const botMessage = {
        id: "bot-" + Date.now(),
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        subject: selectedSubject,
      };

      setMessages((prev) => [...prev, botMessage]);
      await chatService.saveMessage(botMessage);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: "error-" + Date.now(),
        text: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        isError: true,
        timestamp: new Date().toISOString(),
        subject: selectedSubject,
      };
      setMessages((prev) => [...prev, errorMessage]);
      await chatService.saveMessage(errorMessage);
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
            {processedMessages.map((message) => (
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
