import { GPT4All } from "gpt4all";

class CoachService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.initPromise = null;
    // Base URL for the model - should match your static files location
    this.modelPath = "/models/";
    this.modelName = "ggml-gpt4all-j-v1.3-groovy.bin";
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log("Initializing GPT4All...");

        // Create GPT4All instance with browser-compatible settings
        this.model = new GPT4All(this.modelName, {
          modelPath: this.modelPath,
          verbose: true,
          device: "cpu",
          download: {
            baseUrl: "https://gpt4all.io/models",
            onProgress: (progress) => {
              console.log("Download progress:", progress);
            },
          },
        });

        console.log("Model initialization started...");
        await this.model.init();
        await this.model.open();

        console.log("Model loaded successfully");
        this.isInitialized = true;
        resolve(true);
      } catch (error) {
        console.error("Failed to initialize GPT4All:", error);
        this.isInitialized = false;
        resolve(false); // Resolve with false instead of rejecting
      }
    });

    return this.initPromise;
  }

  async generateResponse(userInput, subject, context) {
    if (!this.isInitialized || !this.model) {
      console.log("Using fallback responses as model is not initialized");
      return this.getFallbackResponse(subject, userInput);
    }

    try {
      // Create a structured prompt for better responses
      const prompt = this.createPrompt(userInput, subject, context);

      console.log("Generating response with GPT4All...");
      const response = await this.model.prompt(prompt, {
        temp: 0.7,
        maxTokens: 200,
      });

      console.log("GPT4All response received");
      return this.formatResponse(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      return this.getFallbackResponse(subject, userInput);
    }
  }

  createPrompt(userInput, subject, context) {
    const contextInfo = context
      ? `
            Student Progress: ${context.progress}%
            Recent Test Scores: ${context.recentScores}
            Total Tests Taken: ${context.totalTests}
        `
      : "";

    return `As a Russian language exam coach specializing in ${subject}, please help with this question.
        ${contextInfo}
        Student's question: ${userInput}
        
        Provide a specific, practical response focused on exam preparation for ${subject}.`;
  }

  formatResponse(response) {
    return response
      .trim()
      .replace(/^Assistant:|^AI:|^Coach:/, "")
      .trim();
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
      // Add other subjects as needed...
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

  async getStatus() {
    return {
      isInitialized: this.isInitialized,
      modelLoaded: !!this.model,
      timestamp: new Date(),
    };
  }
}

export default new CoachService();
