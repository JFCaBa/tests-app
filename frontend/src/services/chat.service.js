import axios from "axios";

const CACHE_KEY = "coach_chat_messages";

class ChatService {
  constructor() {
    this.messages = this.loadFromCache() || [];
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error loading chat cache:", error);
      return null;
    }
  }

  saveToCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.messages.slice(-50))); // Keep last 50 messages
    } catch (error) {
      console.error("Error saving chat cache:", error);
    }
  }

  async saveMessage(message) {
    try {
      // Save to backend
      const response = await axios.post("/chat/messages", message);

      // Update local cache
      this.messages.push(message);
      this.saveToCache();

      return response.data;
    } catch (error) {
      console.error("Error saving message:", error);
      // Still update local cache even if backend fails
      this.messages.push(message);
      this.saveToCache();
      throw error;
    }
  }

  async getMessages(subject = null) {
    try {
      // Get from backend
      const response = await axios.get("/chat/messages", {
        params: { subject },
      });

      // Update local cache with server data
      this.messages = response.data;
      this.saveToCache();

      return this.messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Return cached messages if backend fails
      return this.loadFromCache() || [];
    }
  }

  clearCache() {
    this.messages = [];
    localStorage.removeItem(CACHE_KEY);
  }

  getMessagesBySubject(subject) {
    return this.messages.filter((msg) => msg.subject === subject);
  }

  getRecentMessages(limit = 10) {
    return this.messages.slice(-limit);
  }
}

export const chatService = new ChatService();
export default chatService;
