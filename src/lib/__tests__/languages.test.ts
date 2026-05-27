import {
  buildDefaultSystemPrompt,
  getTargetLanguageLabel,
  DEFAULT_TARGET_LANGUAGES,
  SOURCE_LANGUAGES,
  DEFAULT_ACTIVE_TAB,
} from "../languages";

describe("languages", () => {
  it("includes 8 default target languages", () => {
    const ids = DEFAULT_TARGET_LANGUAGES.map((l) => l.id);
    expect(ids).toEqual(["zh-TW", "ja", "ko", "es", "fr", "de", "pt", "ru"]);
    expect(ids).not.toContain("en");
    expect(ids).not.toContain("custom");
  });

  it("includes comprehensive source language options", () => {
    const en = SOURCE_LANGUAGES.find((l) => l.id === "en");
    expect(en).toBeDefined();
    expect(en!.promptName).toBe("English");
    expect(SOURCE_LANGUAGES.length).toBeGreaterThanOrEqual(100);
  });

  it("builds prompt without target language (handled by agent)", () => {
    const prompt = buildDefaultSystemPrompt("ja");
    expect(prompt).toContain("full subtitle script");
    expect(prompt).not.toContain("Japanese");
  });

  it("returns label for known language with default list", () => {
    expect(getTargetLanguageLabel("ja")).toBe("日本語");
    expect(getTargetLanguageLabel("zh-TW")).toBe("中文");
  });

  it("returns label using custom list", () => {
    const custom = [{ id: "xx", label: "Custom", promptName: "CustomLang" }];
    expect(getTargetLanguageLabel("xx", custom)).toBe("Custom");
    expect(getTargetLanguageLabel("nonexistent", custom)).toBe("nonexistent");
  });

  it("default active tab matches first default target language", () => {
    expect(DEFAULT_ACTIVE_TAB).toBe(DEFAULT_TARGET_LANGUAGES[0].id);
  });
});
