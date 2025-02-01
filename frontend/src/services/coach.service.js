import { GPT4All } from "gpt4all";

class CoachService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log("Initializing GPT4All...");
        // Initialize GPT4All with the model you want to use
        this.model = new GPT4All("ggml-gpt4all-j-v1.3-groovy");
        await this.model.init();
        console.log("Model initialization started...");
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
    try {
      if (!this.isInitialized || !this.model) {
        console.log("Model not initialized, attempting to initialize...");
        const initialized = await this.initialize();
        if (!initialized) {
          console.log("Falling back to default responses...");
          return this.getFallbackResponse(subject, userInput);
        }
      }

      // Create a structured prompt for better responses
      const prompt = this.createPrompt(userInput, subject, context);

      console.log("Generating response with GPT4All...");
      const response = await this.model.prompt(prompt, {
        temp: 0.7, // Control response creativity (0.0-1.0)
        topK: 40,
        topP: 0.9,
        maxTokens: 200,
        systemPrompt: this.getSystemPrompt(subject),
      });

      console.log("GPT4All response received");
      return this.formatResponse(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      return this.getFallbackResponse(subject, userInput);
    }
  }

  getSystemPrompt(subject) {
    return `You are an expert Russian language tutor specializing in ${subject}. 
        Provide clear, concise, and practical advice to help students prepare for their Russian language exams. 
        Focus on specific examples and actionable tips. Be encouraging but professional.`;
  }

  createPrompt(userInput, subject, context) {
    const contextInfo = context
      ? `
            Current progress: ${context.progress}%
            Recent scores: ${context.recentScores}
            Total tests taken: ${context.totalTests}
        `
      : "";

    return `[INST]
        As a Russian language exam coach specializing in ${subject}, please help with this question.
        ${contextInfo}
        Student's question: ${userInput}
        
        Provide a specific, practical response focused on exam preparation for ${subject}.
        [/INST]`;
  }

  formatResponse(response) {
    return response
      .trim()
      .replace(/^Assistant:|^AI:|^Coach:/, "")
      .trim();
  }

  getFallbackResponse(subject, userInput) {
    // This is our fallback response system when GPT4All is not available
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
      // Add other subjects similarly...
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
