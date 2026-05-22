import { SubtitleEntry } from "@/types/subtitle";

export function srtTimeToSeconds(time: string): number {
  const normalized = time.replace(",", ".");
  const match = normalized.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) return 0;
  const [, h, m, s, ms] = match;
  const total =
    parseInt(h, 10) * 3600 +
    parseInt(m, 10) * 60 +
    parseInt(s, 10) +
    parseInt(ms, 10) / 1000;
  return Math.round(total * 1000) / 1000;
}

export function serializeJson(entries: SubtitleEntry[]): string {
  const items = entries.map((entry) => ({
    start: srtTimeToSeconds(entry.startTime),
    end: srtTimeToSeconds(entry.endTime),
    text: entry.translated.trim() || entry.original,
  }));
  return JSON.stringify(items);
}

export function serializeVtt(entries: SubtitleEntry[], bilingual: boolean): string {
  let vtt = "WEBVTT\n\n";
  entries.forEach((entry, idx) => {
    const start = entry.startTime.replace(",", ".");
    const end = entry.endTime.replace(",", ".");
    const text = bilingual
      ? `${entry.original}\n${entry.translated || entry.original}`
      : entry.translated || entry.original;
    vtt += `${idx + 1}\n${start} --> ${end}\n${text}\n\n`;
  });
  return vtt;
}

export function serializeAss(entries: SubtitleEntry[], bilingual: boolean): string {
  let ass = `[Script Info]
Title: Translated Subtitles
ScriptType: v4.00+
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  entries.forEach((entry) => {
    const start = entry.startTime.replace(",", ".").substring(0, 11);
    const end = entry.endTime.replace(",", ".").substring(0, 11);
    const text = bilingual
      ? `${entry.original}\\N${entry.translated || entry.original}`
      : entry.translated || entry.original;
    ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
  });

  return ass;
}
