"use client";

import { getTargetLanguageLabel } from "@/lib/languages";
import { useStore } from "@/store/useStore";

export default function StatusBar() {
  const entries = useStore((s) => s.entries);
  const selectedIndices = useStore((s) => s.selectedIndices);
  const provider = useStore((s) => s.provider);
  const model = useStore((s) => s.model);
  const targetLanguage = useStore((s) => s.targetLanguage);
  const translateError = useStore((s) => s.translateError);

  const translatedCount = entries.filter((e) => e.translated).length;

  return (
    <footer className="flex items-center gap-4 px-4 py-1 border-t bg-gray-50 text-xs text-gray-500 shrink-0">
      <span>字幕：{entries.length} 条</span>
      <span>已译：{translatedCount} 条</span>
      {selectedIndices.length > 0 && (
        <span>已选：{selectedIndices.length} 条</span>
      )}
      <span className="ml-auto">
        {getTargetLanguageLabel(targetLanguage)} · {provider} / {model || "未选择"}
      </span>
      {translateError && (
        <span className="text-red-500">{translateError}</span>
      )}
    </footer>
  );
}
