import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCoach } from "../../contexts/CoachContext";
import { processMessages } from "../../utils/formatText";
import coachService from "../../services/coach.service";
import Message from "../chat/Message";
import Suggestions from "./Suggestions";
import SubjectSelector from "./SubjectSelector";
import { saveChatMessage } from "./api";
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
import { Send, Bot } from "lucide-react";

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

  useEffect(() => {
    const init = async () => {
      if (!initialized.current && user) {
        await initializeCoach();

        const context = getLearningContext();
        let greeting = `Hello ${user.username}! I'm your study coach. `;

        if (context?.totalTests > 0) {
          greeting += `I see you've taken ${context.totalTests} tests. `;
        }

        if (context?.preferredSubjects?.length > 0) {
          greeting += `I notice you've been focusing on ${context.preferredSubjects.join(
            ", "
          )}. `;
        }

        greeting +=
          "Select a subject, and I'll help you prepare for your exam.";

        const initialMessage = {
          text: greeting,
          isUser: false,
          subject: "general",
          timestamp: new Date().toISOString(),
        };

        const savedMessage = await saveChatMessage(initialMessage);
        setMessages([{ ...savedMessage, id: savedMessage._id }]);
        initialized.current = true;
      }
    };

    init();
  }, [user, initializeCoach, getLearningContext]);

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
      text: textToSend,
      isUser: true,
      subject: selectedSubject,
      timestamp: new Date().toISOString(),
    };

    try {
      const savedUserMessage = await saveChatMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { ...savedUserMessage, id: savedUserMessage._id },
      ]);
      setInput("");
      setLoading(true);

      const response = await coachService.generateResponse(
        textToSend,
        selectedSubject,
        getLearningContext()
      );

      const botMessage = {
        text: response,
        isUser: false,
        subject: selectedSubject,
        timestamp: new Date().toISOString(),
      };

      const savedBotMessage = await saveChatMessage(botMessage);
      setMessages((prev) => [
        ...prev,
        { ...savedBotMessage, id: savedBotMessage._id },
      ]);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        text: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        subject: selectedSubject,
        isError: true,
        timestamp: new Date().toISOString(),
      };

      const savedErrorMessage = await saveChatMessage(errorMessage);
      setMessages((prev) => [
        ...prev,
        { ...savedErrorMessage, id: savedErrorMessage._id },
      ]);
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

          <SubjectSelector
            value={selectedSubject}
            onChange={handleSubjectChange}
          />
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
