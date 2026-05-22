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
      <span>Sentences: {entries.length}</span>
      <span>Translated: {translatedCount}</span>
      {selectedIndices.length > 0 && (
        <span>Selected: {selectedIndices.length}</span>
      )}
      <span className="ml-auto">
        {getTargetLanguageLabel(targetLanguage)} · {provider} / {model || "none"}
      </span>
      {translateError && (
        <span className="text-red-500">{translateError}</span>
      )}
    </footer>
  );
}
