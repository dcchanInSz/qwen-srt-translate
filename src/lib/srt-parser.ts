import { SubtitleEntry } from "@/types/subtitle";

export function parseSrt(content: string): SubtitleEntry[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const entries: SubtitleEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;

    const indexLine = lines[i].trim();
    const id = parseInt(indexLine, 10);
    i++;

    if (i >= lines.length) break;
    const timeLine = lines[i].trim();
    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
    if (!timeMatch) {
      while (i < lines.length && lines[i].trim() !== "") i++;
      continue;
    }
    const [, start, end] = timeMatch;
    i++;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i]);
      i++;
    }
    const original = textLines.join("\n").trim();

    entries.push({
      id: id || entries.length + 1,
      startTime: start.replace(".", ","),
      endTime: end.replace(".", ","),
      original,
      translations: {},
    });
  }

  return entries;
}

export function serializeSrt(entries: SubtitleEntry[], languageId: string, bilingual: boolean): string {
  return entries
    .map((entry, idx) => {
      const id = idx + 1;
      const time = `${entry.startTime} --> ${entry.endTime}`;
      const trans = entry.translations[languageId] || "";
      const text = bilingual
        ? trans.trim()
          ? `${entry.original}\n${trans}`
          : entry.original
        : trans.trim() || entry.original;
      return `${id}\n${time}\n${text}`;
    })
    .join("\n\n") + "\n";
}
