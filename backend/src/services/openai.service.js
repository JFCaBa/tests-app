import OpenAI from "openai";

class OpenAIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.assistantId = "asst_X7KozbNoVi4sIWOUxtMVeS1z";

      this.isInitialized = true;
      console.log("OpenAI service initialized");
      return true;
    } catch (error) {
      console.error("OpenAI initialization failed:", error);
      return false;
    }
  }

  async generateResponse(input, subject, context = {}) {
    try {
      if (!this.client) {
        throw new Error("OpenAI client is not initialized.");
      }

      if (!this.client.beta || !this.client.beta.threads) {
        throw new Error(
          "Beta API not available. Ensure OpenAI Node.js SDK is up-to-date."
        );
      }

      // ✅ Step 1: Create a new thread
      const thread = await this.client.beta.threads.create();
      const threadId = thread.id;

      // ✅ Step 2: Send user input to the assistant
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: input,
      });

      // ✅ Step 3: Run the assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      // ✅ Step 4: Poll for completion
      let runStatus;
      do {
        runStatus = await this.client.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        if (runStatus.status === "completed") break;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before checking again
      } while (runStatus.status !== "completed");

      // ✅ Step 5: Get assistant's response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
      );

      return assistantMessage?.content?.[0]?.text?.value || "Ответ не получен.";
    } catch (error) {
      console.error("Error generating response:", error);
      return null;
    }
  }
}

export default new OpenAIService();
