import axios from "axios";

class CoachService {
  constructor() {
    this.isInitialized = false;
    this.checkingStatus = false;

    // Create axios instance
    this.api = axios.create({
      baseURL: "/api/coach",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async initialize() {
    try {
      const status = await this.api.get("/health");
      this.isInitialized = status.data.aiInitialized;
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize coach service:", error);
      return false;
    }
  }

  async generateResponse(userInput, subject, context) {
    try {
      const response = await this.api.post("/generate", {
        input: userInput,
        subject,
        context,
      });

      return response.data.response;
    } catch (error) {
      console.error("Error generating response:", error);
      return this.getFallbackResponse(subject, userInput);
    }
  }

  async getStatus() {
    if (this.checkingStatus) return { isInitialized: this.isInitialized };

    this.checkingStatus = true;
    try {
      const response = await this.api.get("/status");
      this.isInitialized = response.data.initialized;
      this.checkingStatus = false;
      return response.data;
    } catch (error) {
      this.checkingStatus = false;
      return { isInitialized: this.isInitialized };
    }
  }

  getFallbackResponse(subject, userInput) {
    const input = userInput.toLowerCase();

    const fallbacks = {
      listening: {
        tips: [
          "Focus on listening to diverse Russian audio content daily. Start with slower recordings and gradually increase speed.",
          "Watch Russian movies with subtitles, then without them.",
          "Practice with different accents and speech speeds.",
          "Listen to Russian podcasts during daily activities.",
        ],
        practice: [
          "Try watching Russian news and podcasts with subtitles initially.",
          "Record yourself speaking and compare with native speakers.",
          "Use language learning apps with audio components.",
          "Join Russian language exchange groups for practice.",
        ],
        methodology: [
          "Write down key words you hear and practice sound recognition.",
          "Focus on understanding context before details.",
          "Practice active listening by summarizing what you hear.",
          "Create a daily listening routine with varied content.",
        ],
      },
      grammar: {
        tips: [
          "Learn one case at a time and practice extensively before moving to the next.",
          "Focus on verb aspects and their usage.",
          "Study motion verbs and their prefixes systematically.",
          "Pay attention to gender agreement in different cases.",
        ],
        practice: [
          "Create your own sentences using new grammar patterns daily.",
          "Use grammar tables and charts for reference.",
          "Practice with real-world examples.",
          "Write short texts focusing on specific grammar points.",
        ],
        methodology: [
          "Use spaced repetition to review grammar rules regularly.",
          "Create mind maps for complex grammar concepts.",
          "Practice with both written and spoken exercises.",
          "Keep a grammar journal for common mistakes.",
        ],
      },
      // Add other subjects...
    };

    let category = "tips";
    if (input.includes("practice") || input.includes("exercise")) {
      category = "practice";
    } else if (input.includes("how") || input.includes("method")) {
      category = "methodology";
    }

    const responses = fallbacks[subject]?.[category] || fallbacks.general;
    if (!responses) {
      return "I'm here to help you with your studies. Could you be more specific about what you'd like to know?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default new CoachService();
