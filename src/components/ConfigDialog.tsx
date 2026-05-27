"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/i18n";
import {
  SOURCE_LANGUAGES,
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGES,
  ALL_LANGUAGE_OPTIONS,
  type SourceLanguage,
  type TargetLanguage,
} from "@/lib/languages";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConfigDialog({ open, onClose }: Props) {
  const { sourceLanguage, targetLanguages, setSourceLanguage, setTargetLanguages } = useStore();
  const { t } = useI18n();

  const [draftSource, setDraftSource] = useState<SourceLanguage>(sourceLanguage);
  const [draftTargets, setDraftTargets] = useState<TargetLanguage[]>(targetLanguages);
  const [selectedCode, setSelectedCode] = useState("");

  if (!open) return null;

  const handleReset = () => {
    setDraftSource(DEFAULT_SOURCE_LANGUAGE);
    setDraftTargets(DEFAULT_TARGET_LANGUAGES);
  };

  const handleSave = () => {
    setSourceLanguage(draftSource);
    setTargetLanguages(draftTargets);
    onClose();
  };

  const handleAddLanguage = () => {
    if (!selectedCode) return;
    if (draftTargets.some((l) => l.id === selectedCode)) return;
    const option = ALL_LANGUAGE_OPTIONS.find((l) => l.id === selectedCode);
    if (!option) return;
    setDraftTargets([...draftTargets, { id: option.id, label: option.label, promptName: option.promptName }]);
    setSelectedCode("");
  };

  const handleRemoveLanguage = (id: string) => {
    setDraftTargets(draftTargets.filter((l) => l.id !== id));
  };

  const availableOptions = ALL_LANGUAGE_OPTIONS.filter(
    (opt) => !draftTargets.some((t) => t.id === opt.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-[480px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">{t("config.title")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("config.sourceLang")}</label>
            <select
              value={draftSource.id}
              onChange={(e) => {
                const found = SOURCE_LANGUAGES.find((l) => l.id === e.target.value);
                if (found) setDraftSource(found);
              }}
              className="w-full p-2 border rounded text-sm"
            >
              {SOURCE_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label} ({l.id})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">{t("config.sourceHint")}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{t("config.targetLang")}</label>
              <span className="text-xs text-gray-400">{t("config.langCount", { n: draftTargets.length })}</span>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded divide-y">
              {draftTargets.length === 0 && (
                <p className="p-3 text-sm text-gray-400 text-center">{t("config.noTargets")}</p>
              )}
              {draftTargets.map((l) => (
                <div key={l.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <span className="text-gray-400 w-20 shrink-0 font-mono text-xs">{l.id}</span>
                  <span className="flex-1">{l.label}</span>
                  <span className="text-gray-400 text-xs">{l.promptName}</span>
                  <button
                    onClick={() => handleRemoveLanguage(l.id)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none ml-1 shrink-0"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-1.5">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="flex-1 p-1.5 border rounded text-xs"
              >
                <option value="">{t("config.selectLang")}</option>
                {availableOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddLanguage}
                disabled={!selectedCode}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 shrink-0 disabled:opacity-50"
              >
                {t("config.add")}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">{t("config.targetHint")}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            {t("config.reset")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100"
            >
              {t("config.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={draftTargets.length === 0}
              className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {t("config.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
