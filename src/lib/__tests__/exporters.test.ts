import { srtTimeToSeconds, serializeJson } from "../exporters";

describe("srtTimeToSeconds", () => {
  it("converts SRT timestamps to seconds", () => {
    expect(srtTimeToSeconds("00:00:01,133")).toBe(1.133);
    expect(srtTimeToSeconds("00:00:02,333")).toBe(2.333);
    expect(srtTimeToSeconds("00:00:12,466")).toBe(12.466);
  });
});

describe("serializeJson", () => {
  it("exports entries as JSON array with start, end, text", () => {
    const entries = [
      {
        id: 1,
        startTime: "00:00:01,133",
        endTime: "00:00:02,333",
        original: "Hey John.",
        translated: "你好，约翰。",
      },
      {
        id: 2,
        startTime: "00:00:02,666",
        endTime: "00:00:03,500",
        original: "How is everything?",
        translated: "",
      },
    ];
    const result = JSON.parse(serializeJson(entries));
    expect(result).toEqual([
      { start: 1.133, end: 2.333, text: "你好，约翰。" },
      { start: 2.666, end: 3.5, text: "How is everything?" },
    ]);
  });

  it("preserves newlines in text", () => {
    const entries = [
      {
        id: 1,
        startTime: "00:00:12,466",
        endTime: "00:00:15,233",
        original: "Darling please,\nhelp me to take care of my brother, okay?",
        translated: "亲爱的，\n请帮我照顾弟弟，好吗？",
      },
    ];
    const result = JSON.parse(serializeJson(entries));
    expect(result[0].text).toBe("亲爱的，\n请帮我照顾弟弟，好吗？");
  });
});
