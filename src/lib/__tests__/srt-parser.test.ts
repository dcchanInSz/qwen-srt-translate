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
});
