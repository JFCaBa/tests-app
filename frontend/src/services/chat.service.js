import axios from "axios";

class ChatService {
  async getMessages(subject = null) {
    try {
      const params = {};
      if (subject) {
        params.subject = subject;
      }

      const response = await axios.get("/chat/messages", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      throw error;
    }
  }

  async saveMessage(message) {
    try {
      const response = await axios.post("/chat/messages", {
        text: message.text,
        isUser: message.isUser,
        subject: message.subject,
        timestamp: message.timestamp,
        isError: message.isError,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to save chat message:", error);
      throw error;
    }
  }

  async cleanupMessages(subject = null) {
    try {
      const response = await axios.post("/chat/messages/cleanup", {
        subject,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to cleanup messages:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
