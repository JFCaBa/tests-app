import React from "react";
import { User, Bot } from "lucide-react";
import TextFormatter from "../common/TextFormatter";

const Message = React.memo(({ message, isUser, isError }) => (
  <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
    <div
      className={`w-8 h-8 rounded-full ${
        isUser ? "bg-primary/10" : "bg-muted"
      } flex items-center justify-center flex-shrink-0`}
    >
      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    <div
      className={`flex-1 px-2 py-2 rounded-lg ${
        isUser
          ? "bg-primary text-primary-foreground"
          : isError
          ? "bg-destructive/10 text-destructive"
          : "bg-muted"
      }`}
    >
      <TextFormatter
        text={message}
        className={`text-sm leading-relaxed ${
          isUser ? "text-primary-foreground" : "text-foreground"
        }`}
      />
    </div>
  </div>
));

Message.displayName = "Message";

export default Message;
