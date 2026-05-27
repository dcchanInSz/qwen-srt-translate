"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { parseSrt } from "@/lib/srt-parser";
import { ExportFormat } from "@/types/subtitle";
import ConfigDialog from "@/components/ConfigDialog";
import { useI18n } from "@/i18n";

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

  const store = useStore.getState();
  const sourceLang = { id: store.sourceLanguage.id, name: store.sourceLanguage.label };
  const allLanguages = [sourceLang, ...store.targetLanguages.map((l) => ({ id: l.id, name: l.label }))];

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
  const { t, locale, setLocale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setEntries, setFileName, entries, fileName } = useStore();
  const [exportFormat, setExportFormat] = useState<ExportFormat | "">("");
  const [exporting, setExporting] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

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
    <>
      <header className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 shrink-0">
        <h1 className="text-lg font-bold whitespace-nowrap">{t("app.title")}</h1>

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
          {t("header.loadSrt")}
        </button>

        {fileName && (
          <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded text-sm"
          title="Switch Language / 切换语言"
        >
          {locale === "zh" ? "EN" : "中"}
        </button>

        <button
          onClick={() => setConfigOpen(true)}
          title={t("header.settingsTitle")}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded text-sm"
        >
          {t("header.settings")}
        </button>

        {entries.length > 0 && (
          <>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="">{t("header.exportFormat")}</option>
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
              {exporting ? t("header.exporting") : t("header.exportAll")}
            </button>
          </>
        )}
      </header>

      <ConfigDialog open={configOpen} onClose={() => setConfigOpen(false)} />
    </>
  );
}
