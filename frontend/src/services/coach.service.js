import axios from "axios";

class CoachService {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
    // Create axios instance with proper config
    this.api = axios.create({
      baseURL: "/api/coach",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // Check if the service is available
        await this.api.get("/health");
        this.isInitialized = true;
        console.log("Coach service initialized successfully");
        resolve();
      } catch (error) {
        console.error("Failed to initialize coach service:", error);
        this.isInitialized = false;
        // Don't reject, just resolve with fallback mode
        resolve(false);
      }
    });

    return this.initPromise;
  }

  async generateResponse(userInput, subject, context) {
    try {
      // First try to get AI response
      const response = await this.api.post("/generate", {
        input: userInput,
        subject,
        context,
      });

      return response.data.response;
    } catch (error) {
      console.warn("AI response failed, falling back to rule-based:", error);
      return this.getFallbackResponse(subject, userInput);
    }
  }

  getFallbackResponse(subject, userInput) {
    // Enhanced fallback system that attempts to match input with predefined responses
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
      // Add other subjects similarly...
    };

    // Try to match the input with appropriate category
    let category = "tips"; // default
    if (input.includes("practice") || input.includes("exercise")) {
      category = "practice";
    } else if (
      input.includes("how") ||
      input.includes("method") ||
      input.includes("way")
    ) {
      category = "methodology";
    }

    const responses = fallbacks[subject]?.[category] || fallbacks.general;
    if (!responses) {
      return "I'm here to help you with your studies. Could you be more specific about what you'd like to know?";
    }

    // Return a random response from the appropriate category
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getSubjectStats(subject) {
    try {
      const response = await this.api.get(`/stats/${subject}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get subject stats:", error);
      return null;
    }
  }

  async getSuggestions(subject) {
    try {
      const response = await this.api.get(`/suggestions/${subject}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      return this.getDefaultSuggestions(subject);
    }
  }

  getDefaultSuggestions(subject) {
    // Default suggestions when API fails
    const suggestions = {
      listening: [
        "How can I improve my listening comprehension?",
        "Tips for understanding fast speech",
        "Common listening test mistakes",
      ],
      grammar: [
        "Explain verb aspects",
        "Help with case usage",
        "Common grammar mistakes",
      ],
      // Add more subjects...
    };

    return suggestions[subject] || [];
  }
}

export default new CoachService();
