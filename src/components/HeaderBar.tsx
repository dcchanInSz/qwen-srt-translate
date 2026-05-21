"use client";

import { useRef } from "react";
import { useStore } from "@/store/useStore";
import { parseSrt, serializeSrt } from "@/lib/srt-parser";
import { serializeVtt, serializeAss } from "@/lib/exporters";
import { ExportFormat } from "@/types/subtitle";

export default function HeaderBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setEntries, setFileName, entries, fileName } = useStore();

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const parsed = parseSrt(content);
      setEntries(parsed);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleExport = (format: ExportFormat) => {
    const bilingual = format.includes("bilingual");
    let content: string;
    let ext: string = "srt";

    if (format.startsWith("vtt")) {
      content = serializeVtt(entries, bilingual);
      ext = "vtt";
    } else if (format.startsWith("ass")) {
      content = serializeAss(entries, bilingual);
      ext = "ass";
    } else {
      content = serializeSrt(entries, bilingual);
      ext = "srt";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.replace(/\.[^.]+$/, "") || "output"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 shrink-0">
      <h1 className="text-lg font-bold whitespace-nowrap">SRT Translator</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept=".srt"
        onChange={handleLoad}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Load SRT
      </button>

      {fileName && (
        <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
      )}

      <div className="flex-1" />

      {entries.length > 0 && (
        <select
          onChange={(e) => handleExport(e.target.value as ExportFormat)}
          defaultValue=""
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="" disabled>Export...</option>
          <option value="srt">SRT (Translation only)</option>
          <option value="srt-bilingual">SRT (Bilingual)</option>
          <option value="vtt">VTT (Translation only)</option>
          <option value="vtt-bilingual">VTT (Bilingual)</option>
          <option value="ass">ASS (Translation only)</option>
        </select>
      )}
    </header>
  );
}
