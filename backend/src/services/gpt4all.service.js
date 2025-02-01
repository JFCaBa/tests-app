import { GPT4All } from "gpt4all";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GPT4AllService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.modelPath =
      "/home/debian/tests-app/backend/models/gpt4all-lora-quantized.bin";
  }

  async initialize() {
    if (this.isInitialized) {
      console.log("✅ GPT4All already initialized.");
      return true;
    }

    try {
      console.log("🚀 Initializing GPT4All...");
      console.log("🔍 Model Path:", this.modelPath);

      this.model = new GPT4All("gpt4all-lora-quantized", {
        modelPath: this.modelPath,
      });

      console.log("📥 Downloading/Loading model...");
      await this.model.init();
      await this.model.open();

      this.isInitialized = true;
      console.log("✅ GPT4All initialized successfully.");
      return true;
    } catch (error) {
      console.error("❌ GPT4All initialization failed:", error);
      return false;
    }
  }

  async generateResponse(input, subject, context = {}) {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) throw new Error("❌ Failed to initialize GPT4All.");
    }

    try {
      const prompt = this.createPrompt(input, subject, context);
      console.log("📝 Sending prompt:", prompt);

      const response = await this.model.prompt(prompt, {
        temp: 0.7,
        maxTokens: 200,
      });

      console.log("✅ Response received.");
      return this.formatResponse(response);
    } catch (error) {
      console.error("❌ Generation error:", error);
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
    return response
      .trim()
      .replace(/^Assistant:|^AI:|^Coach:/, "")
      .trim();
  }
}

export default new GPT4AllService();
