// src/services/grammar.service.js

const grammarTips = {
  caseUsage: [
    {
      example: "Мы решили завтра пойти к нему в больницу.",
      explanation: "'к нему' requires the dative case.",
    },
    {
      example: "Летом он был в Санкт-Петербурге в гостях у своего друга.",
      explanation: "'у своего друга' requires the genitive case.",
    },
  ],
  verbConjugation: [
    {
      example: "Михаил раньше работал шофёром, поэтому он умеет водить машину.",
      explanation:
        "'умеет' is used to indicate ability due to past experience.",
    },
    {
      example: "У тебя сегодня тяжёлый пакет! Что ты несёшь?",
      explanation:
        "'несёшь' is the correct present tense conjugation of 'нести'.",
    },
  ],
  pronounUsage: [
    {
      example: "В аэропорту я не узнала племянника. Он так вырос.",
      explanation: "Correct use of possessive and personal pronouns.",
    },
  ],
  conjunctions: [
    {
      example: "Мы решили закончить сегодня эту работу, потому что устали.",
      explanation: "'потому что' is used to indicate cause.",
    },
  ],
  adjectiveAgreement:
    "Adjectives must agree in gender, number, and case with the nouns they modify.",
  adverbs: [
    {
      example: "Ты сделал эту работу хорошо.",
      explanation: "'хорошо' is the correct adverb form of 'хороший'.",
    },
  ],
  wordOrder:
    "Russian word order is flexible, but the topic often comes first, followed by new information.",
  questionWords: [
    {
      example: "Ты не знаешь, почему этот магазин не работает?",
      explanation: "'почему' is used to ask about reasons.",
    },
  ],
};

class GrammarService {
  searchByCategory(category) {
    return grammarTips[category] || null;
  }

  findExample(keyword) {
    for (const category in grammarTips) {
      if (Array.isArray(grammarTips[category])) {
        const match = grammarTips[category].find((item) =>
          item.example.includes(keyword)
        );
        if (match) return match;
      }
    }
    return null;
  }
}

export const grammarService = new GrammarService();
export default grammarService;
