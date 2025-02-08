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

      this.systemPrompt = `
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
`.trim();

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
      // Step 1: Create a thread (to track ongoing conversations)
      const thread = await this.client.beta.threads.create();
      const threadId = thread.id;

      // Step 2: Send a message to the assistant
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: input,
      });

      // Step 3: Run the assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      // Step 4: Poll for the response (since Assistants API runs async)
      let runStatus;
      do {
        runStatus = await this.client.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        if (runStatus.status === "completed") break;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before polling again
      } while (runStatus.status !== "completed");

      // Step 5: Retrieve the assistant's response
      const messages = await this.client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
      );

      return assistantMessage?.content[0]?.text?.value || "Ответ не получен.";
    } catch (error) {
      console.error("Error generating response:", error);
      return null;
    }
  }

  formatResponse(response) {
    const content = response.choices[0].message.content.trim();
    const sentences = content
      .split(/(?<=\.|\!|\?|\:)/)
      .map((sentence) => sentence.trim());
    return sentences.join("\r\n");
  }
}

export default new OpenAIService();
