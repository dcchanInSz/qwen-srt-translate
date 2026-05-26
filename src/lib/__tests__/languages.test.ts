import {
  buildDefaultSystemPrompt,
  getTargetLanguageLabel,
  TARGET_LANGUAGES,
} from "../languages";

describe("languages", () => {
  it("includes common target languages", () => {
    const ids = TARGET_LANGUAGES.map((l) => l.id);
    expect(ids).toContain("en");
    expect(ids).toContain("ja");
    expect(ids).toContain("custom");
  });

  it("builds prompt with target language name", () => {
    const prompt = buildDefaultSystemPrompt("ja");
    expect(prompt).toContain("Japanese");
    expect(prompt).toContain("full subtitle script");
  });

  it("returns label for known language", () => {
    expect(getTargetLanguageLabel("en")).toBe("英语");
  });
});
