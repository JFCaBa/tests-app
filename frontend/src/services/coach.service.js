// src/services/coach.service.js
import axiosInstance from "../config/axios";
import { historicalService } from "./historical.service";
import { lawService } from "./law.service";
import { grammarService } from "./grammar.service";

class CoachService {
  constructor() {
    this.isInitialized = false;
    this.checkingStatus = false;
    this.api = axiosInstance;
  }

  async initialize() {
    try {
      const status = await this.api.get("/api/coach/health");
      this.isInitialized = status.data.aiInitialized;
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize coach service:", error);
      return false;
    }
  }

  async generateResponse(userInput, subject, context) {
    try {
      const response = await this.api.post(
        "/api/coach/generate",
        {
          input: userInput,
          subject,
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 240000, // Timeout in milliseconds (240000 ms = 4 minutes)
        }
      );

      let finalResponse = response.data.response;

      // Enhance with historical data if relevant
      const historicalEnhancement = historicalService.enhanceResponse(
        userInput,
        subject
      );
      if (historicalEnhancement) {
        finalResponse +=
          "\n\nAdditional historical context:\n" + historicalEnhancement;
      }

      // Enhance with legal information if relevant
      const legalEnhancement = lawService.enhanceResponse(userInput, subject);
      if (legalEnhancement) {
        finalResponse += "\n\nRelevant legal information:\n" + legalEnhancement;
      }

      // Enhance with grammar information if relevant
      const grammarEnhancement = grammarService.findExample(userInput);
      if (grammarEnhancement) {
        finalResponse +=
          "\n\nRelevant grammar tip:\n" +
          grammarEnhancement.example +
          " - " +
          grammarEnhancement.explanation;
      }

      return finalResponse;
    } catch (error) {
      console.error("Error generating response:", error);
      return this.getFallbackResponse(subject, userInput);
    }
  }

  async getStatus() {
    if (this.checkingStatus) return { isInitialized: this.isInitialized };

    this.checkingStatus = true;
    try {
      const response = await this.api.get("/api/coach/status");
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
      history: {
        tips: [
          "Focus on key dates and their significance in Russian history.",
          "Study important historical figures and their contributions.",
          "Learn about major events chronologically.",
          "Connect historical events to modern Russian society.",
        ],
        practice: [
          "Create timelines of major historical events.",
          "Practice explaining historical events in Russian.",
          "Study historical documents and primary sources.",
          "Connect different historical periods and their influence.",
        ],
        methodology: [
          "Use memory techniques for remembering dates and events.",
          "Create associations between historical figures and their achievements.",
          "Practice explaining the cause and effect of historical events.",
          "Review historical context regularly.",
        ],
      },
      laws: {
        tips: [
          "Focus on understanding registration procedures and deadlines.",
          "Learn about your rights and obligations as a foreign citizen.",
          "Study common legal terms in Russian.",
          "Understand the hierarchy of Russian laws and regulations.",
        ],
        practice: [
          "Review real case scenarios and legal procedures.",
          "Practice filling out common legal forms.",
          "Study the consequences of various legal violations.",
          "Learn about document requirements for different procedures.",
        ],
        methodology: [
          "Create checklists for different legal procedures.",
          "Keep track of important deadlines and requirements.",
          "Practice explaining legal concepts in simple terms.",
          "Review updates to laws and regulations regularly.",
        ],
      },
    };

    let category = "tips";
    if (input.includes("practice") || input.includes("exercise")) {
      category = "practice";
    } else if (input.includes("how") || input.includes("method")) {
      category = "methodology";
    }

    // Get basic fallback response
    const responses = fallbacks[subject]?.[category] || [
      "I'm here to help you with your studies. Could you be more specific about what you'd like to know?",
    ];
    let response = responses[Math.floor(Math.random() * responses.length)];

    // Enhance fallback response with historical or legal information if relevant
    if (subject === "history") {
      const historicalEnhancement = historicalService.enhanceResponse(
        userInput,
        subject
      );
      if (historicalEnhancement) {
        response +=
          "\n\nHere is some specific historical information:\n" +
          historicalEnhancement;
      }
    }

    if (subject === "laws") {
      const legalEnhancement = lawService.enhanceResponse(userInput, subject);
      if (legalEnhancement) {
        response +=
          "\n\nHere is some specific legal information:\n" + legalEnhancement;
      }
    }

    if (subject === "grammar") {
      const grammarEnhancement = grammarService.findExample(userInput);
      if (grammarEnhancement) {
        response +=
          "\n\nGrammar tip:\n" +
          grammarEnhancement.example +
          " - " +
          grammarEnhancement.explanation;
      }
    }

    return response;
  }
}

export default new CoachService();
