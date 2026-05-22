import { buildSystemContent, buildUserContent } from "../llm/types";
import { buildDefaultSystemPrompt } from "../languages";

describe("context-aware prompts", () => {
  it("system prompt instructs reading full script first", () => {
    const prompt = buildDefaultSystemPrompt("zh");
    expect(prompt).toMatch(/full subtitle script/i);
    expect(prompt).toMatch(/plot|characters/i);
  });

  it("buildSystemContent separates context from segments", () => {
    const content = buildSystemContent("Test prompt");
    expect(content).toContain("[FULL SUBTITLE SCRIPT]");
    expect(content).toContain("[SEGMENTS TO TRANSLATE]");
  });

  it("buildUserContent includes full script and segments", () => {
    const user = buildUserContent(["Hello", "World"], ["Hi", "There"]);
    expect(user).toContain("[FULL SUBTITLE SCRIPT");
    expect(user).toContain("1. Hello");
    expect(user).toContain("[SEGMENTS TO TRANSLATE]");
    expect(user).toContain("Hi\n---\nThere");
  });
});
