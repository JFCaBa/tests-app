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
        this.model = new GPT4All("gpt4all-j-v1.3-groovy", true);
        await this.model.init();
        await this.model.open();
        this.isInitialized = true;
        console.log("GPT4All initialized successfully");
        resolve();
      } catch (error) {
        console.error("Failed to initialize GPT4All:", error);
        this.isInitialized = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  async generateResponse(userInput, subject, context) {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        return this.getFallbackResponse(subject);
      }
    }

    try {
      // Create a prompt that includes context and guides the model
      const prompt = this.createPrompt(userInput, subject, context);

      const response = await this.model.prompt(prompt, {
        temp: 0.7,
        topK: 40,
        topP: 0.9,
        maxTokens: 200,
      });

      return this.formatResponse(response);
    } catch (error) {
      console.error("Error generating response:", error);
      return this.getFallbackResponse(subject);
    }
  }

  createPrompt(userInput, subject, context) {
    // Create a structured prompt for the model
    return `As a Russian language exam coach specializing in ${subject}, help the student with their question. 
                Student's current progress: ${context?.progress || "Unknown"}
                Recent test scores: ${context?.recentScores || "None"}
                
                Student's question: ${userInput}
                
                Provide a helpful, encouraging response focused on ${subject} exam preparation.`;
  }

  formatResponse(response) {
    // Clean and format the model's response
    return response
      .trim()
      .replace(/^Assistant:|^AI:|^Coach:/, "")
      .trim();
  }

  getFallbackResponse(subject) {
    // Fallback responses when AI is unavailable
    const fallbacks = {
      listening: {
        tips: "Focus on listening to diverse Russian audio content daily. Start with slower recordings and gradually increase speed.",
        practice:
          "Try watching Russian news and podcasts with subtitles initially.",
        methodology:
          "Write down key words you hear and practice sound recognition.",
      },
      grammar: {
        tips: "Learn one case at a time and practice extensively before moving to the next.",
        practice: "Create your own sentences using new grammar patterns daily.",
        methodology: "Use spaced repetition to review grammar rules regularly.",
      },
      history: {
        tips: "Focus on key dates, events, and their significance in Russian history.",
        practice:
          "Create timelines and connect events to understand their relationships.",
        methodology: "Study historical events in chronological order.",
      },
      laws: {
        tips: "Break down complex legal concepts into simpler terms.",
        practice: "Review real-world examples of law applications.",
        methodology: "Focus on understanding rather than memorizing.",
      },
      reading: {
        tips: "Practice reading various types of texts daily, from news to literature.",
        practice: "Start with simpler texts and gradually increase difficulty.",
        methodology: "Learn to identify key information quickly.",
      },
      writing: {
        tips: "Practice writing on different topics regularly.",
        practice:
          "Start with simple sentences and build to complex paragraphs.",
        methodology: "Focus on proper structure and grammar in your writing.",
      },
    };

    const responses = fallbacks[subject] || fallbacks.general;
    const keys = Object.keys(responses);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return responses[randomKey];
  }
}

export default new CoachService();
