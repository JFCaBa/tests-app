import { useTranslation } from "react-i18next";

export const SUBJECTS = [
  { id: "listening", name: "", icon: "🎧" },
  { id: "grammar", name: "", icon: "📝" },
  { id: "history", name: "", icon: "📚" },
  { id: "laws", name: "", icon: "⚖️" },
  { id: "reading", name: "", icon: "📖" },
  { id: "writing", name: "", icon: "✍️" },
];

export const SUGGESTIONS = {
  listening: [
    "How can I improve my listening comprehension?",
    "What are common mistakes in listening tests?",
    "Tips for understanding fast speech",
  ],
  grammar: [
    "Help with case usage",
    "Verb aspects explanation",
    "Common grammar mistakes",
  ],
  history: [
    "Key historical dates to remember",
    "Important historical figures",
    "Tips for history exam preparation",
  ],
  laws: [
    "Essential legal concepts",
    "Common law test questions",
    "How to study legal terminology",
  ],
  reading: [
    "Reading comprehension strategies",
    "How to improve reading speed",
    "Tips for understanding context",
  ],
  writing: [
    "Writing structure tips",
    "Common writing mistakes",
    "How to improve essay writing",
  ],
};

// Function to get the translated name of a subject
export const getSubjectName = (subjectId, t) => {
  return t(`subjects.details.${subjectId}.name`);
};
