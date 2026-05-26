const GOOGLE_LANG_MAP: Record<string, string> = {
  "zh-TW": "zh-TW",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
  ru: "ru",
};

async function translateSingle(text: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
  const data = await res.json();
  return data[0]?.[0]?.[0] ?? text;
}

export async function translate(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  const lang = GOOGLE_LANG_MAP[targetLanguage];
  if (!lang) throw new Error(`Unsupported target language: ${targetLanguage}`);

  const urlBase = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t`;
  let qs = texts.map((t) => `q=${encodeURIComponent(t)}`).join("&");
  const fullUrl = `${urlBase}&${qs}`;

  if (fullUrl.length < 1800) {
    const res = await fetch(fullUrl);
    if (res.ok) {
      const data = await res.json();
      const results: string[] = data[0]?.map((r: unknown[]) => r[0] as string) ?? [];
      if (results.length === texts.length) return results;
    }
  }

  const results: string[] = [];
  for (let i = 0; i < texts.length; i++) {
    const t = await translateSingle(texts[i], lang);
    results.push(t);
    if (i < texts.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}
