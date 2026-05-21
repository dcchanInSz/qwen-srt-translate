import { parseSrt, serializeSrt } from "../srt-parser";

const sampleSrt = `1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:03,500 --> 00:00:06,000
Good morning

`;

describe("parseSrt", () => {
  it("should parse a valid SRT file", () => {
    const entries = parseSrt(sampleSrt);
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe(1);
    expect(entries[0].startTime).toBe("00:00:01,000");
    expect(entries[0].endTime).toBe("00:00:03,000");
    expect(entries[0].original).toBe("Hello world");
    expect(entries[0].translated).toBe("");
    expect(entries[1].original).toBe("Good morning");
  });

  it("should handle multiline subtitles", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Line one
Line two

`;
    const entries = parseSrt(srt);
    expect(entries[0].original).toBe("Line one\nLine two");
  });

  it("should handle period as decimal separator", () => {
    const srt = `1
00:00:01.000 --> 00:00:03.000
Hello

`;
    const entries = parseSrt(srt);
    expect(entries[0].startTime).toBe("00:00:01,000");
  });

  it("should skip malformed timestamp and continue parsing", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
First subtitle

2
BAD TIMESTAMP LINE
This text is orphaned

3
00:00:06,000 --> 00:00:09,000
Third subtitle

`;
    const entries = parseSrt(srt);
    expect(entries).toHaveLength(2);
    expect(entries[0].original).toBe("First subtitle");
    expect(entries[1].original).toBe("Third subtitle");
  });
});

describe("serializeSrt", () => {
  it("should serialize entries to SRT format", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "你好" },
    ];
    const result = serializeSrt(entries, false);
    expect(result).toContain("00:00:01,000 --> 00:00:03,000");
    expect(result).toContain("你好");
  });

  it("should produce bilingual SRT", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "你好" },
    ];
    const result = serializeSrt(entries, true);
    expect(result).toContain("Hello\n你好");
  });

  it("should not duplicate original when translation is empty in bilingual mode", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "" },
    ];
    const result = serializeSrt(entries, true);
    expect(result).toContain("Hello");
    expect(result).not.toContain("Hello\nHello");
  });

  it("should output only original when translation is whitespace in bilingual mode", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "   " },
    ];
    const result = serializeSrt(entries, true);
    expect(result).toContain("Hello");
    expect(result).not.toContain("Hello\nHello");
  });
});
