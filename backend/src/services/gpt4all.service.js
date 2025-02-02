import { loadModel, createCompletion } from "gpt4all";
import Cache from "../models/Cache.js";

class GPT4AllService {
  constructor() {
    this.model = null;
    this.chatSession = null;
    this.isInitialized = false;
  }

  // Updated initialize() method in GPT4AllService class
  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log("Initializing GPT4All...");
      // Load model with increased context size
      this.model = await loadModel("orca-mini-3b-gguf2-q4_0.gguf", {
        verbose: true,
        device: "cpu",
        nCtx: 2048, // Changed from 1024 to 2048
      });

      // Updated system prompt with detailed instructions
      this.chatSession = await this.model.createChatSession({
        temperature: 0.7, // Slightly lower temperature for factual accuracy
        systemPrompt: `
### System:
Вы экспертный помощник по миграционному праву России. Формат ответов:
1. Используйте кириллицу и строго русский язык
2. Структура ответа:
   ### Грамматика (Русский язык)
   ### Исторический контекст
   ### Правовые аспекты
   ### Частые ошибки
3. Форматируйте через маркированные списки
4. Примеры выделяйте курсивом через *
5. Ссылайтесь на статьи законов (ФЗ-115 Статья 13.2)
6. Упомяните изменения 2020-2023 гг.
7. Сохраняйте официальный стиль
8. Перечисляйте документы полностью

Пример структуры:
### Грамматика
- Склонение термина "вид на жительство":
  * Правильно: "заявление на получение видА на жительствО"
  * Неправильно: "вид на жительстве"

### Правовые аспекты
- Согласно ФЗ-115 Статья 8.1 (2021):
  Требуемый доход: 12 × прожиточный минимум региона
  `.trim(),
      });

      this.isInitialized = true;
      console.log("GPT4All initialized with migration law settings");
      return true;
    } catch (error) {
      console.error("Initialization failed:", error);
      return false;
    }
  }

  async generateResponse(input, subject, context = {}) {
    const prompt = subject + "\n" + input;
    const cacheKey = prompt;

    try {
      // Try to get response from cache first
      const cachedResponse = await Cache.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log("Cache hit:", cacheKey);
        return cachedResponse;
      }

      // If not in cache, generate new response
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Start measuring time
      console.time("Response Time");

      // Create a completion using the chat session
      const response = await createCompletion(this.chatSession, prompt);

      // End measuring time and log the result
      console.timeEnd("Response Time");

      const formattedResponse = this.formatResponse(response);
      console.log("Response:", formattedResponse);

      // Cache the response
      await Cache.cacheResponse(cacheKey, formattedResponse, subject);

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

  // Method to clear the cache
  async clearCache(subject = null) {
    try {
      await Cache.clearCache(subject);
      console.log(
        subject
          ? `Cache cleared for subject: ${subject}`
          : "Complete cache cleared"
      );
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }

  // Method to get cache statistics
  async getCacheStats() {
    try {
      const totalEntries = await Cache.countDocuments();
      const statsBySubject = await Cache.aggregate([
        {
          $group: {
            _id: "$subject",
            count: { $sum: 1 },
            avgRequests: { $avg: "$metadata.timesRequested" },
            totalRequests: { $sum: "$metadata.timesRequested" },
          },
        },
      ]);

      return {
        totalEntries,
        statsBySubject,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return null;
    }
  }
}

export default new GPT4AllService();
