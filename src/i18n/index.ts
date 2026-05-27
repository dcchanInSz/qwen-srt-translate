"use client";

import { createContext, useContext, useState, useCallback, useMemo, createElement, type ReactNode } from "react";
import type { Translations, Locale } from "./types";
import zh from "./zh";
import en from "./en";

const messages: Record<Locale, Translations> = { zh, en };

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = localStorage.getItem("app-locale");
  return stored === "en" ? "en" : "zh";
}

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "zh";
  return navigator.language.startsWith("zh") ? "zh" : "en";
}

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = getStoredLocale();
    if (stored === "zh" || stored === "en") return stored;
    return getBrowserLocale();
  });

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("app-locale", loc);
    document.documentElement.lang = loc === "zh" ? "zh-CN" : "en";
  }, []);

  const t = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>) => {
      let text = messages[locale][key];
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
