import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./translations";

const i18n = i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "uz", "tg", "es", "hi", "ur", "zh"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["navigator", "htmlTag", "path", "localStorage"],
      lookupLocalStorage: "preferredLanguage",
      caches: ["localStorage"],
      checkWhitelist: true,
    },
    react: { useSuspense: false },
  });

export default i18n;
