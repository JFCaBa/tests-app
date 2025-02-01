import pkg from "gpt4all";
const { loadModel, createCompletion } = pkg;
import path from "path";
import fs from "fs"; // Added fs to check for file existence

class GPT4AllService {
  constructor() {
    this.model = null;
    this.chatSession = null;
    this.isInitialized = false;
    this.modelName = "ggml-gpt4all-j-v1.3-groovy"; // Verified working model
    this.modelBasePath = path.join(os.homedir(), ".cache/gpt4all");
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log("Initializing GPT4All...");
      console.log(`🔍 Model Path: ${this.modelPath}`);

      // Check if the model file exists locally before loading
      if (!fs.existsSync(this.modelPath)) {
        console.error("Model file does not exist at the specified path.");
        return false;
      }

      // Load the model and set the device to 'cpu' (or 'gpu' if available)
      this.model = await loadModel(this.modelPath, {
        verbose: true,
        device: "cpu", // Change to "gpu" if using GPU
        nCtx: 2048, // Set max context size
      });

      // Create a chat session
      this.chatSession = await this.model.createChatSession({
        temperature: 0.7,
        systemPrompt: "### System:\nYou are a Russian language exam coach.\n\n", // Customize system prompt
      });

      this.isInitialized = true;
      console.log("GPT4All initialized successfully");
      return true;
    } catch (error) {
      console.error("GPT4All initialization failed:", error);
      return false;
    }
  }

  async generateResponse(input, subject, context = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const prompt = this.createPrompt(input, subject, context);

      // Create a completion using the chat session
      const response = await createCompletion(this.chatSession, prompt);

      return this.formatResponse(response);
    } catch (error) {
      console.error("Generation error:", error);
      return null;
    }
  }

  createPrompt(input, subject, context) {
    const contextInfo = context.progress
      ? `
            Student Progress: ${context.progress}%
            Recent Test Scores: ${context.recentScores || "N/A"}
            Total Tests Taken: ${context.totalTests || 0}
        `
      : "";

    return `As a Russian language exam coach specializing in ${subject}, help with this question.
        ${contextInfo}
        Student's question: ${input}
        
        Provide a specific, practical response focused on exam preparation for the working permission, temporary residence permission, and permanent residence permission.`;
  }

  formatResponse(response) {
    return response.choices[0].message.content.trim(); // Format the response content
  }
}

export default new GPT4AllService();
