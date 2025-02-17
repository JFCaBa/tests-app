class TranslationService {
  constructor() {
    this.API_URL = "https://api.mymemory.translated.net/get";
  }

  /**
   * Translate text using MyMemory Translation API
   * @param {string} text - Text to translate
   * @returns {Promise<string>} - Translated text
   */
  async translate(text) {
    try {
      const preferredLanguage =
        localStorage.getItem("preferredLanguage") || "en";
      const params = new URLSearchParams({
        q: text.trim(),
        langpair: `es|${preferredLanguage}`,
      });

      const response = await fetch(`${this.API_URL}?${params}`);

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const data = await response.json();

      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }

      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }

  /**
   * Split text into translatable chunks
   * @param {string} text - Text to split
   * @returns {string[]} - Array of sentences
   */
  splitText(text) {
    // Split text into sentences
    return text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim());
  }

  /**
   * Translate text by handling each sentence
   * @param {string} text - Text to translate
   * @returns {Promise<string>} - Translated text
   */
  async translateText(text) {
    try {
      // For longer texts, split into sentences and translate each
      if (text.length > 500) {
        const sentences = this.splitText(text);
        const translations = await Promise.all(
          sentences.map((sentence) => this.translate(sentence))
        );
        return translations.join(" ");
      }

      // For shorter texts, translate all at once
      return await this.translate(text);
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }
}

export const translationService = new TranslationService();
export default translationService;
