import OpenAI from "openai";

class OpenAIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.pollInterval = 2000;
    this.maxPollAttempts = 30;
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        maxRetries: this.maxRetries,
        timeout: 30000,
      });
      this.assistantId = process.env.OPENAI_ASSISTANT_ID;

      if (!this.assistantId) {
        throw new Error("OPENAI_ASSISTANT_ID not configured");
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("OpenAI initialization failed:", error);
      return false;
    }
  }

  async generateResponse(input, subject, context = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let threadId;

    try {
      // Create thread with retry mechanism
      threadId = await this.withRetry(async () => {
        const thread = await this.client.beta.threads.create();
        return thread.id;
      });

      // Add message to thread
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: this.formatInput(input, subject, context),
      });

      // Run assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      // Poll for completion
      const runStatus = await this.pollRunStatus(threadId, run.id);

      if (runStatus.status === "failed") {
        throw new Error(
          `Run failed: ${runStatus.last_error?.message || "Unknown error"}`
        );
      }

      // Get response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
      );

      return assistantMessage?.content?.[0]?.text?.value || "Ответ не получен.";
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    } finally {
      // Cleanup thread
      if (threadId) {
        try {
          await this.client.beta.threads.delete(threadId);
        } catch (error) {
          console.error("Error deleting thread:", error);
        }
      }
    }
  }

  async withRetry(operation, retries = this.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt)
        );
      }
    }
  }

  async pollRunStatus(threadId, runId) {
    let attempts = 0;

    while (attempts < this.maxPollAttempts) {
      const status = await this.client.beta.threads.runs.retrieve(
        threadId,
        runId
      );

      if (
        ["completed", "failed", "cancelled", "expired"].includes(status.status)
      ) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
      attempts++;
    }

    throw new Error("Run polling timed out");
  }

  formatInput(input, subject, context) {
    const formattedContext = context ? JSON.stringify(context, null, 2) : "";
    return `Subject: ${subject}
Input: ${input}
Context: ${formattedContext}`;
  }
}

export default new OpenAIService();
