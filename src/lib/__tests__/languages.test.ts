import {
  buildDefaultSystemPrompt,
  getTargetLanguageLabel,
  TARGET_LANGUAGES,
  DEFAULT_ACTIVE_TAB,
} from "../languages";

describe("languages", () => {
  it("includes 8 target languages only", () => {
    const ids = TARGET_LANGUAGES.map((l) => l.id);
    expect(ids).toEqual(["zh-TW", "ja", "ko", "es", "fr", "de", "pt", "ru"]);
    expect(ids).not.toContain("en");
    expect(ids).not.toContain("custom");
  });

  it("builds prompt with target language name", () => {
    const prompt = buildDefaultSystemPrompt("ja");
    expect(prompt).toContain("Japanese");
    expect(prompt).toContain("full subtitle script");
  });

  it("returns label for known language", () => {
    expect(getTargetLanguageLabel("ja")).toBe("日本語");
    expect(getTargetLanguageLabel("zh-TW")).toBe("中文");
  });

  it("default active tab is zh-TW", () => {
    expect(DEFAULT_ACTIVE_TAB).toBe("zh-TW");
  });
});
