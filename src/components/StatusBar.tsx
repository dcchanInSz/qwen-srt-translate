"use client";

import { getTargetLanguageLabel } from "@/lib/languages";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/i18n";

export default function StatusBar() {
  const entries = useStore((s) => s.entries);
  const selectedIndices = useStore((s) => s.selectedIndices);
  const provider = useStore((s) => s.provider);
  const model = useStore((s) => s.model);
  const activeTab = useStore((s) => s.activeTab);
  const translateError = useStore((s) => s.translateError);
  const { t } = useI18n();

  const translatedCount = entries.filter((e) => e.translations[activeTab]).length;

  return (
    <footer className="flex items-center gap-4 px-4 py-1 border-t bg-gray-50 text-xs text-gray-500 shrink-0">
      <span>{t("status.subtitles", { n: entries.length })}</span>
      <span>{t("status.translated", { lang: getTargetLanguageLabel(activeTab), n: translatedCount })}</span>
      {selectedIndices.length > 0 && (
        <span>{t("status.selected", { n: selectedIndices.length })}</span>
      )}
      <span className="ml-auto">
        {provider} / {model || t("status.noModel")}
      </span>
      {translateError && (
        <span className="text-red-500">{translateError}</span>
      )}
    </footer>
  );
}
