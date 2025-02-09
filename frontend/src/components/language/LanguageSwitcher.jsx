// src/components/language/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbek" },
  { code: "tg", name: "Тоҷикӣ" },
  { code: "es", name: "Español" },
  { code: "hi", name: "हिंदी" },
  { code: "ur", name: "اردو" },
  { code: "zh", name: "中文" },
];

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      localStorage.setItem("preferredLanguage", lang);
    } catch (error) {
      console.error("Language change failed:", error);
    }
  };

  return (
    <div className="flex items-center">
      <Globe className="mr-2 h-4 w-4" />
      <Select
        defaultValue={i18n.language || "en"}
        onValueChange={changeLanguage}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
