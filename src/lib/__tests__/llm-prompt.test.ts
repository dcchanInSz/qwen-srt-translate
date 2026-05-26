import { buildDefaultSystemPrompt } from "../languages";

describe("context-aware prompts", () => {
  it("system prompt instructs reading full script first", () => {
    const prompt = buildDefaultSystemPrompt("ja");
    expect(prompt).toMatch(/full subtitle script/i);
    expect(prompt).toMatch(/context/i);
  });

  it("system prompt is language-independent", () => {
    const en = buildDefaultSystemPrompt("en");
    const ja = buildDefaultSystemPrompt("ja");
    expect(en).toBe(ja);
  });
});
