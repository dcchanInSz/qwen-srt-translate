"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { parseSrt, serializeSrt } from "@/lib/srt-parser";
import { serializeVtt, serializeAss, serializeJson } from "@/lib/exporters";
import { ExportFormat } from "@/types/subtitle";

export default function HeaderBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setEntries, setFileName, entries, fileName } = useStore();
  const [exportFormat, setExportFormat] = useState<ExportFormat | "">("");

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

  const handleExport = () => {
    if (!exportFormat) return;
    const bilingual = exportFormat.includes("bilingual");
    let content: string;
    let ext: string = "srt";

    if (exportFormat === "json") {
      content = serializeJson(entries);
      ext = "json";
    } else if (exportFormat.startsWith("vtt")) {
      content = serializeVtt(entries, bilingual);
      ext = "vtt";
    } else if (exportFormat.startsWith("ass")) {
      content = serializeAss(entries, bilingual);
      ext = "ass";
    } else {
      content = serializeSrt(entries, bilingual);
      ext = "srt";
    }

    const mime = exportFormat === "json" ? "application/json" : "text/plain";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.replace(/\.[^.]+$/, "") || "output"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 shrink-0">
      <h1 className="text-lg font-bold whitespace-nowrap">SRT 字幕翻译</h1>

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
        加载 SRT
      </button>

      {fileName && (
        <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
      )}

      <div className="flex-1" />

      {entries.length > 0 && (
        <>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="">导出格式…</option>
            <option value="srt">SRT（仅译文）</option>
            <option value="srt-bilingual">SRT（双语）</option>
            <option value="vtt">VTT（仅译文）</option>
            <option value="vtt-bilingual">VTT（双语）</option>
            <option value="ass">ASS（仅译文）</option>
            <option value="json">JSON（仅译文）</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!exportFormat}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            导出
          </button>
        </>
      )}
    </header>
  );
}
