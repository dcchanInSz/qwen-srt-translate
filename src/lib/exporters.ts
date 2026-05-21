import { SubtitleEntry } from "@/types/subtitle";

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
