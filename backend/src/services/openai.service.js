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
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.time("Response Time");

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: `${subject}\n${input}` },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      console.timeEnd("Response Time");

      return this.formatResponse(response);
    } catch (error) {
      console.error("Generation error:", error);
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
