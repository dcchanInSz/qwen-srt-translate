"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { parseSrt } from "@/lib/srt-parser";
import { ExportFormat } from "@/types/subtitle";
import { TARGET_LANGUAGES } from "@/lib/languages";

async function exportAllLanguages(entries: ReturnType<typeof useStore.getState>["entries"], format: ExportFormat, baseName: string) {
  const JSZip = (await import("jszip")).default;
  const { serializeSrt } = await import("@/lib/srt-parser");
  const { serializeVtt, serializeAss, serializeJson } = await import("@/lib/exporters");

  const zip = new JSZip();

  const extMap: Record<ExportFormat, string> = {
    srt: "srt",
    vtt: "vtt",
    ass: "ass",
    json: "json",
  };
  const ext = extMap[format];

  const allLanguages = [{ id: "en", name: "English" }, ...TARGET_LANGUAGES];

  for (const lang of allLanguages) {
    let content: string;
    if (format === "json") {
      content = serializeJson(entries, lang.id);
    } else if (format === "vtt") {
      content = serializeVtt(entries, lang.id, false);
    } else if (format === "ass") {
      content = serializeAss(entries, lang.id, false);
    } else {
      content = serializeSrt(entries, lang.id, false);
    }
    zip.file(`${baseName}_${lang.id}.${ext}`, content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}_translations.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HeaderBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setEntries, setFileName, entries, fileName } = useStore();
  const [exportFormat, setExportFormat] = useState<ExportFormat | "">("");
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async () => {
    if (!exportFormat) return;
    setExporting(true);
    try {
      const baseName = fileName?.replace(/\.[^.]+$/, "") || "output";
      const currentEntries = useStore.getState().entries;
      await exportAllLanguages(currentEntries, exportFormat, baseName);
    } finally {
      setExporting(false);
    }
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
            <option value="srt">SRT</option>
            <option value="vtt">VTT</option>
            <option value="ass">ASS</option>
            <option value="json">JSON</option>
          </select>
          <button
            onClick={handleExport}
            disabled={!exportFormat || exporting}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {exporting ? "导出中…" : "导出全部 (ZIP)"}
          </button>
        </>
      )}
    </header>
  );
}
