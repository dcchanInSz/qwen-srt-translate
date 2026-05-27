export interface TargetLanguage {
  id: string;
  label: string;
  promptName: string;
}

export interface SourceLanguage {
  id: string;
  label: string;
  promptName: string;
}

interface LanguageOption {
  id: string;
  label: string;
  promptName: string;
}

export const ALL_LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: "af", label: "Afrikaans", promptName: "Afrikaans" },
  { id: "sq", label: "Shqip", promptName: "Albanian" },
  { id: "am", label: "አማርኛ", promptName: "Amharic" },
  { id: "ar", label: "العربية", promptName: "Arabic" },
  { id: "hy", label: "Հայերեն", promptName: "Armenian" },
  { id: "az", label: "Azərbaycan", promptName: "Azerbaijani" },
  { id: "eu", label: "Euskara", promptName: "Basque" },
  { id: "be", label: "Беларуская", promptName: "Belarusian" },
  { id: "bn", label: "বাংলা", promptName: "Bengali" },
  { id: "bs", label: "Bosanski", promptName: "Bosnian" },
  { id: "bg", label: "Български", promptName: "Bulgarian" },
  { id: "ca", label: "Català", promptName: "Catalan" },
  { id: "ceb", label: "Cebuano", promptName: "Cebuano" },
  { id: "zh-CN", label: "简体中文", promptName: "Simplified Chinese" },
  { id: "zh-TW", label: "繁體中文", promptName: "Traditional Chinese" },
  { id: "co", label: "Corsu", promptName: "Corsican" },
  { id: "hr", label: "Hrvatski", promptName: "Croatian" },
  { id: "cs", label: "Čeština", promptName: "Czech" },
  { id: "da", label: "Dansk", promptName: "Danish" },
  { id: "nl", label: "Nederlands", promptName: "Dutch" },
  { id: "en", label: "English", promptName: "English" },
  { id: "eo", label: "Esperanto", promptName: "Esperanto" },
  { id: "et", label: "Eesti", promptName: "Estonian" },
  { id: "fi", label: "Suomi", promptName: "Finnish" },
  { id: "fr", label: "Français", promptName: "French" },
  { id: "fy", label: "Frysk", promptName: "Frisian" },
  { id: "gl", label: "Galego", promptName: "Galician" },
  { id: "ka", label: "ქართული", promptName: "Georgian" },
  { id: "de", label: "Deutsch", promptName: "German" },
  { id: "el", label: "Ελληνικά", promptName: "Greek" },
  { id: "gu", label: "ગુજરાતી", promptName: "Gujarati" },
  { id: "ht", label: "Kreyòl Ayisyen", promptName: "Haitian Creole" },
  { id: "ha", label: "Hausa", promptName: "Hausa" },
  { id: "haw", label: "ʻŌlelo Hawaiʻi", promptName: "Hawaiian" },
  { id: "he", label: "עברית", promptName: "Hebrew" },
  { id: "hi", label: "हिन्दी", promptName: "Hindi" },
  { id: "hmn", label: "Hmoob", promptName: "Hmong" },
  { id: "hu", label: "Magyar", promptName: "Hungarian" },
  { id: "is", label: "Íslenska", promptName: "Icelandic" },
  { id: "ig", label: "Igbo", promptName: "Igbo" },
  { id: "id", label: "Bahasa Indonesia", promptName: "Indonesian" },
  { id: "ga", label: "Gaeilge", promptName: "Irish" },
  { id: "it", label: "Italiano", promptName: "Italian" },
  { id: "ja", label: "日本語", promptName: "Japanese" },
  { id: "jw", label: "Basa Jawa", promptName: "Javanese" },
  { id: "kn", label: "ಕನ್ನಡ", promptName: "Kannada" },
  { id: "kk", label: "Қазақ тілі", promptName: "Kazakh" },
  { id: "km", label: "ខ្មែរ", promptName: "Khmer" },
  { id: "ko", label: "한국어", promptName: "Korean" },
  { id: "ku", label: "Kurdî", promptName: "Kurdish" },
  { id: "ky", label: "Кыргызча", promptName: "Kyrgyz" },
  { id: "lo", label: "ລາວ", promptName: "Lao" },
  { id: "la", label: "Latina", promptName: "Latin" },
  { id: "lv", label: "Latviešu", promptName: "Latvian" },
  { id: "lt", label: "Lietuvių", promptName: "Lithuanian" },
  { id: "lb", label: "Lëtzebuergesch", promptName: "Luxembourgish" },
  { id: "mk", label: "Македонски", promptName: "Macedonian" },
  { id: "mg", label: "Malagasy", promptName: "Malagasy" },
  { id: "ms", label: "Bahasa Melayu", promptName: "Malay" },
  { id: "ml", label: "മലയാളം", promptName: "Malayalam" },
  { id: "mt", label: "Malti", promptName: "Maltese" },
  { id: "mi", label: "Māori", promptName: "Maori" },
  { id: "mr", label: "मराठी", promptName: "Marathi" },
  { id: "mn", label: "Монгол", promptName: "Mongolian" },
  { id: "my", label: "မြန်မာ", promptName: "Myanmar (Burmese)" },
  { id: "ne", label: "नेपाली", promptName: "Nepali" },
  { id: "no", label: "Norsk", promptName: "Norwegian" },
  { id: "ny", label: "Chichewa", promptName: "Nyanja (Chichewa)" },
  { id: "ps", label: "پښتو", promptName: "Pashto" },
  { id: "fa", label: "فارسی", promptName: "Persian" },
  { id: "pl", label: "Polski", promptName: "Polish" },
  { id: "pt", label: "Português", promptName: "Portuguese" },
  { id: "pa", label: "ਪੰਜਾਬੀ", promptName: "Punjabi" },
  { id: "ro", label: "Română", promptName: "Romanian" },
  { id: "ru", label: "Русский", promptName: "Russian" },
  { id: "sm", label: "Gagana Samoa", promptName: "Samoan" },
  { id: "gd", label: "Gàidhlig", promptName: "Scots Gaelic" },
  { id: "sr", label: "Српски", promptName: "Serbian" },
  { id: "st", label: "Sesotho", promptName: "Sesotho" },
  { id: "sn", label: "Shona", promptName: "Shona" },
  { id: "sd", label: "سنڌي", promptName: "Sindhi" },
  { id: "si", label: "සිංහල", promptName: "Sinhala" },
  { id: "sk", label: "Slovenčina", promptName: "Slovak" },
  { id: "sl", label: "Slovenščina", promptName: "Slovenian" },
  { id: "so", label: "Soomaali", promptName: "Somali" },
  { id: "es", label: "Español", promptName: "Spanish" },
  { id: "su", label: "Basa Sunda", promptName: "Sundanese" },
  { id: "sw", label: "Kiswahili", promptName: "Swahili" },
  { id: "sv", label: "Svenska", promptName: "Swedish" },
  { id: "tl", label: "Tagalog", promptName: "Tagalog (Filipino)" },
  { id: "tg", label: "Тоҷикӣ", promptName: "Tajik" },
  { id: "ta", label: "தமிழ்", promptName: "Tamil" },
  { id: "te", label: "తెలుగు", promptName: "Telugu" },
  { id: "th", label: "ไทย", promptName: "Thai" },
  { id: "tr", label: "Türkçe", promptName: "Turkish" },
  { id: "uk", label: "Українська", promptName: "Ukrainian" },
  { id: "ur", label: "اردو", promptName: "Urdu" },
  { id: "uz", label: "Oʻzbek", promptName: "Uzbek" },
  { id: "vi", label: "Tiếng Việt", promptName: "Vietnamese" },
  { id: "cy", label: "Cymraeg", promptName: "Welsh" },
  { id: "xh", label: "isiXhosa", promptName: "Xhosa" },
  { id: "yi", label: "ייִדיש", promptName: "Yiddish" },
  { id: "yo", label: "Yorùbá", promptName: "Yoruba" },
  { id: "zu", label: "isiZulu", promptName: "Zulu" },
];

export const SOURCE_LANGUAGES: SourceLanguage[] = ALL_LANGUAGE_OPTIONS;

export const DEFAULT_SOURCE_LANGUAGE: SourceLanguage = ALL_LANGUAGE_OPTIONS.find((l) => l.id === "en")!;

export const DEFAULT_TARGET_LANGUAGES: TargetLanguage[] = [
  { id: "zh-TW", label: "中文", promptName: "Traditional Chinese" },
  { id: "ja", label: "日本語", promptName: "Japanese" },
  { id: "ko", label: "한국어", promptName: "Korean" },
  { id: "es", label: "Español", promptName: "Spanish" },
  { id: "fr", label: "Français", promptName: "French" },
  { id: "de", label: "Deutsch", promptName: "German" },
  { id: "pt", label: "Português", promptName: "Portuguese" },
  { id: "ru", label: "Русский", promptName: "Russian" },
];

export const DEFAULT_ACTIVE_TAB = DEFAULT_TARGET_LANGUAGES[0].id;

export function getTargetLanguage(id: string, list?: TargetLanguage[]): TargetLanguage | undefined {
  return (list ?? DEFAULT_TARGET_LANGUAGES).find((l) => l.id === id);
}

export function getSourceLanguage(id: string): SourceLanguage | undefined {
  return SOURCE_LANGUAGES.find((l) => l.id === id);
}

const CONTEXT_AWARE_PROMPT = `Before translating, read the full subtitle script in the user message to understand the overall plot, characters, relationships, tone, and recurring terms. Use that context for consistent names and wording. Translate only the lines in [SEGMENTS TO TRANSLATE]. Preserve natural tone and timing-friendly brevity. Do not output any reasoning or analysis. Return only the translations.`;

export function buildDefaultSystemPrompt(_languageId: string): string {
  return `You are a professional subtitle translator. ${CONTEXT_AWARE_PROMPT}`;
}

export function getTargetLanguageLabel(languageId: string, list?: TargetLanguage[]): string {
  return getTargetLanguage(languageId, list)?.label ?? languageId;
}
