import { loadModel, createCompletion } from "gpt4all";

const cache = new Map();

class GPT4AllService {
  constructor() {
    this.model = null;
    this.chatSession = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log("Initializing GPT4All...");

      // Load the model (this will trigger a download if not already cached)
      this.model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
        verbose: true,
        device: "cpu", // You can change to "gpu" if available
        nCtx: 1024, // Set max context size
      });

      // Create a chat session
      this.chatSession = await this.model.createChatSession({
        temperature: 0.8,
        systemPrompt:
          "### System:\nYou are a Russian language exam coach. Use cyrilic when writing in Russian\n\n",
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
    const prompt = subject + "\n" + input;
    const cacheKey = prompt;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey); // Return cached response
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Start measuring time
      console.time("Response Time");

      // Create a completion using the chat session
      const response = await createCompletion(this.chatSession, prompt);

      // End measuring time and log the result
      console.timeEnd("Response Time");

      const formattedResponse = this.formatResponse(response);
      console.log("Response:", formattedResponse);
      cache.set(cacheKey, formattedResponse);

      return formattedResponse;
    } catch (error) {
      console.error("Generation error:", error);
      return null;
    }
  }

  formatResponse(response) {
    const content = response.choices[0].message.content.trim();

    // Split sentences based on punctuation (.!?:) and preserve the punctuation, then join with \r\n
    const sentences = content
      .split(/(?<=\.|\!|\?|\:)/)
      .map((sentence) => sentence.trim());

    // Add \r\n after each sentence
    return sentences.join("\r\n");
  }
}

export default new GPT4AllService();
