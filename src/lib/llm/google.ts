const GOOGLE_LANG_MAP: Record<string, string> = {
  af: "af",
  sq: "sq",
  am: "am",
  ar: "ar",
  hy: "hy",
  az: "az",
  eu: "eu",
  be: "be",
  bn: "bn",
  bs: "bs",
  bg: "bg",
  ca: "ca",
  ceb: "ceb",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  co: "co",
  hr: "hr",
  cs: "cs",
  da: "da",
  nl: "nl",
  en: "en",
  eo: "eo",
  et: "et",
  fi: "fi",
  fr: "fr",
  fy: "fy",
  gl: "gl",
  ka: "ka",
  de: "de",
  el: "el",
  gu: "gu",
  ht: "ht",
  ha: "ha",
  haw: "haw",
  he: "he",
  hi: "hi",
  hmn: "hmn",
  hu: "hu",
  is: "is",
  ig: "ig",
  id: "id",
  ga: "ga",
  it: "it",
  ja: "ja",
  jw: "jw",
  kn: "kn",
  kk: "kk",
  km: "km",
  ko: "ko",
  ku: "ku",
  ky: "ky",
  lo: "lo",
  la: "la",
  lv: "lv",
  lt: "lt",
  lb: "lb",
  mk: "mk",
  mg: "mg",
  ms: "ms",
  ml: "ml",
  mt: "mt",
  mi: "mi",
  mr: "mr",
  mn: "mn",
  my: "my",
  ne: "ne",
  no: "no",
  ny: "ny",
  ps: "ps",
  fa: "fa",
  pl: "pl",
  pt: "pt",
  pa: "pa",
  ro: "ro",
  ru: "ru",
  sm: "sm",
  gd: "gd",
  sr: "sr",
  st: "st",
  sn: "sn",
  sd: "sd",
  si: "si",
  sk: "sk",
  sl: "sl",
  so: "so",
  es: "es",
  su: "su",
  sw: "sw",
  sv: "sv",
  tl: "tl",
  tg: "tg",
  ta: "ta",
  te: "te",
  th: "th",
  tr: "tr",
  uk: "uk",
  ur: "ur",
  uz: "uz",
  vi: "vi",
  cy: "cy",
  xh: "xh",
  yi: "yi",
  yo: "yo",
  zu: "zu",
};

async function translateSingle(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
  const data = await res.json();
  return data[0]?.[0]?.[0] ?? text;
}

export async function translate(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  const srcLang = GOOGLE_LANG_MAP[sourceLanguage] || "auto";
  const tgtLang = GOOGLE_LANG_MAP[targetLanguage];
  if (!tgtLang) throw new Error(`Unsupported target language: ${targetLanguage}`);

  const urlBase = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=${tgtLang}&dt=t`;
  const qs = texts.map((t) => `q=${encodeURIComponent(t)}`).join("&");
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
    const t = await translateSingle(texts[i], srcLang, tgtLang);
    results.push(t);
    if (i < texts.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}
