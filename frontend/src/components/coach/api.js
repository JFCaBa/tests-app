import axios from "axios";

export const saveChatMessage = async (messageData) => {
  try {
    const response = await axios.post("/chat/messages", messageData);
    return response.data;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

export const fetchChatHistory = async () => {
  try {
    const response = await axios.get("/chat/messages");
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};
