import axios from "axios";

class LocalTranscriptionService {
  constructor() {
    this.baseURL = process.env.WHISPER_SERVICE_URL || "http://localhost:3001";
  }

  /**
   * Transcribe audio using local Whisper instance
   * @param {Buffer|Blob|File} audioFile - The audio file to transcribe
   * @returns {Promise<{text: string, segments: Array, language: string}>}
   */
  async transcribeAudio(audioFile) {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await axios.post(
        `${this.baseURL}/transcribe`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000, // 5 minute timeout for longer audio files
        }
      );
      console.log("Transcription response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to transcribe audio"
      );
    }
  }

  /**
   * Check if the transcription service is available
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data.status === "ok";
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * Verify transcription matches expected text
   * @param {string} transcription - The transcribed text
   * @param {string} expectedText - The expected text
   * @returns {number} - Similarity score between 0 and 1
   */
  verifyTranscription(transcription, expectedText) {
    // Normalize texts for comparison
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const normalizedTranscription = normalizeText(transcription);
    const normalizedExpected = normalizeText(expectedText);

    // Calculate Levenshtein distance
    const getLevenshteinDistance = (str1, str2) => {
      const track = Array(str2.length + 1)
        .fill(null)
        .map(() => Array(str1.length + 1).fill(null));

      for (let i = 0; i <= str1.length; i++) track[0][i] = i;
      for (let j = 0; j <= str2.length; j++) track[j][0] = j;

      for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
            track[j][i - 1] + 1,
            track[j - 1][i] + 1,
            track[j - 1][i - 1] + indicator
          );
        }
      }

      return track[str2.length][str1.length];
    };

    const distance = getLevenshteinDistance(
      normalizedTranscription,
      normalizedExpected
    );
    const maxLength = Math.max(
      normalizedTranscription.length,
      normalizedExpected.length
    );

    // Convert distance to similarity score (0 to 1)
    return 1 - distance / maxLength;
  }
}

export const localTranscriptionService = new LocalTranscriptionService();
export default localTranscriptionService;
