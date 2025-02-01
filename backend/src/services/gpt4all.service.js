import pkg from "gpt4all";
const { GPT4All } = pkg;
import path from "path";
import fs from "fs";
import os from "os";

class GPT4AllService {
  constructor() {
    this.model = null;
    this.chatSession = null;
    this.isInitialized = false;
    this.modelName = "gpt4all-falcon-q4_0.gguf"; // Updated model name
    this.modelPath = path.join(
      os.homedir(),
      `.cache/gpt4all/${this.modelName}`
    );
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log("Initializing GPT4All...");
      console.log(`🔍 Model Path: ${this.modelPath}`);

      // Create directory if it doesn't exist
      const dir = path.dirname(this.modelPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.model = new GPT4All(this.modelName, {
        modelPath: dir,
        verbose: true,
        device: "cpu",
        nCtx: 2048,
      });

      await this.model.init();
      await this.model.open();

      this.chatSession = this.model.createChatSession({
        temperature: 0.7,
        systemPrompt: "### System:\nYou are a Russian language exam coach.\n\n",
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
    if (!this.isInitialized && !(await this.initialize())) {
      throw new Error("Failed to initialize GPT4All");
    }

    try {
      const prompt = this.createPrompt(input, subject, context);
      const response = await this.chatSession.prompt(prompt);
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
