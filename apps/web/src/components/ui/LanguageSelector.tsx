"use client";

import React from "react";
import { useLanguageStore, LanguageCode } from "@/lib/i18n";
import { Languages } from "lucide-react";

const LANGUAGES: { code: LanguageCode; label: string; nativeName: string }[] = [
  { code: "en", label: "English", nativeName: "EN" },
  { code: "hi", label: "Hindi", nativeName: "हिंदी" },
  { code: "as", label: "Assamese", nativeName: "অসমীয়া" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা" },
];

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer text-xs">
      <Languages className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="bg-transparent border-0 text-slate-700 font-semibold focus:ring-0 text-[12px] py-1 pl-1 pr-1 cursor-pointer focus:outline-none appearance-none"
        aria-label="Select Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white text-slate-800">
            {lang.nativeName} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
};

