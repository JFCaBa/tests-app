import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCoach } from "../../contexts/CoachContext";
import { processMessages } from "../../utils/formatText";
import coachService from "../../services/coach.service";
import Message from "../chat/Message";
import Suggestions from "./Suggestions";
import SubjectSelector from "./SubjectSelector";
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
import { Send, Bot, Trash2 } from "lucide-react";
import chatService from "../../services/chat.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TYPING_SPEED = 25; // ms per character

const CoachChat = () => {
  const { user } = useAuth();
  const { isInitialized, lastError, initializeCoach, getLearningContext } =
    useCoach();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const initialized = useRef(false);
  const scrollRef = useRef(null);
  const responseText = useRef("");

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, []);

  const simulateTyping = useCallback(
    async (text) => {
      setIsTyping(true);
      let currentText = "";

      for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        setDisplayText(currentText);
        await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
        scrollToBottom();
      }

      setIsTyping(false);
      return text;
    },
    [scrollToBottom]
  );

  const loadMessages = useCallback(async (subject = null) => {
    try {
      const fetchedMessages = await chatService.getMessages(subject);
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        const sortedMessages = fetchedMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current && user) {
      const init = async () => {
        await initializeCoach();
        await loadMessages();
        initialized.current = true;
      };
      init();
    }
  }, [user, initializeCoach, loadMessages]);

  useEffect(() => {
    if (selectedSubject) {
      loadMessages(selectedSubject);
    } else {
      setMessages([]);
    }
  }, [selectedSubject, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubjectChange = useCallback((newSubject) => {
    setSelectedSubject(newSubject);
  }, []);

  const handleCleanup = async () => {
    try {
      setCleanupLoading(true);
      await chatService.deleteMessages(selectedSubject);
      setMessages([]);
      setShowCleanupDialog(false);
    } catch (error) {
      console.error("Cleanup error:", error);
    } finally {
      setCleanupLoading(false);
    }
  };

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
      setLoading(true);
      const savedUserMessage = await chatService.saveMessage(userMessage);
      setMessages((prev) => [...prev, savedUserMessage]);
      setInput("");
      scrollToBottom();

      const response = await coachService.generateResponse(
        textToSend,
        selectedSubject,
        getLearningContext()
      );

      // Start typing simulation
      const typedResponse = await simulateTyping(response);

      const botMessage = {
        text: typedResponse,
        isUser: false,
        subject: selectedSubject,
        timestamp: new Date().toISOString(),
      };

      const savedBotMessage = await chatService.saveMessage(botMessage);
      setMessages((prev) => [...prev, savedBotMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        subject: selectedSubject,
        isError: true,
        timestamp: new Date().toISOString(),
      };
      const savedErrorMessage = await chatService.saveMessage(errorMessage);
      setMessages((prev) => [...prev, savedErrorMessage]);
    } finally {
      setLoading(false);
      setDisplayText("");
    }
  };

  const processedMessages = processMessages(messages);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gray-50/80">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              Study Coach
            </CardTitle>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCleanupDialog(true)}
                disabled={cleanupLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Messages
              </Button>
            )}
          </div>
          <CardDescription>
            Select a subject and ask questions about exam preparation
          </CardDescription>

          <SubjectSelector
            value={selectedSubject}
            onChange={handleSubjectChange}
          />
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="pr-4">
              {processedMessages.map((message) => (
                <Message
                  key={message.id || message._id}
                  message={message.text}
                  isUser={message.isUser}
                  isError={message.isError}
                />
              ))}
              {isTyping && <Message message={displayText} isUser={false} />}
            </div>
          </ScrollArea>

          <div className="flex flex-col gap-4">
            {selectedSubject && (
              <Suggestions
                subject={selectedSubject}
                onSelect={(suggestion) => {
                  setInput(suggestion);
                  handleSend(suggestion);
                }}
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

      <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clean Chat Messages</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all chat messages{" "}
              {selectedSubject ? `for ${selectedSubject}` : ""}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cleanupLoading ? "Cleaning..." : "Clean Messages"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoachChat;
