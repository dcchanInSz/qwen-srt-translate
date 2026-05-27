"use client";

import { useCallback, useEffect, useState } from "react";
import { LLM_PROVIDERS, type LlmProvider } from "@/lib/llm";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/i18n";
import type { Translations } from "@/i18n/types";
import ProviderSettingsDialog from "@/components/ProviderSettingsDialog";

const providerI18nKey: Record<LlmProvider, keyof Translations> = {
  google: "provider.google",
  ollama: "provider.ollama",
  lmstudio: "provider.lmstudio",
  openai: "provider.openai",
  anthropic: "provider.anthropic",
};

export default function Sidebar() {
  const { t } = useI18n();
  const {
    entries, selectedIndices, provider, model, activeTab, systemPrompt,
    translateError, providerConfigs,
    setProvider, setModel, setSystemPrompt, setTranslateError,
    updateTranslation,
    sourceLanguage, targetLanguages,
  } = useStore();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [googleTranslating, setGoogleTranslating] = useState<Record<string, boolean>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [translateLog, setTranslateLog] = useState<{ text: string; type: "info" | "success" | "error" }[]>([]);

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const config = providerConfigs[provider] || { baseUrl: "", apiKey: "" };
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, config }),
      });
      const data = await res.json();
      const modelList = data.models?.map((m: { name: string }) => m.name) || [];
      setModels(modelList);
      const state = useStore.getState();
      if (modelList.length > 0 && !state.model) {
        state.setModel(modelList[0]);
      }
    } catch {
      setModels([]);
    }
    setLoadingModels(false);
  }, [provider, providerConfigs]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const doTranslate = async (indices: number[], targetLangs: string[], isGoogle: boolean) => {
    if (!isGoogle && !model) {
      setTranslateError(t("sidebar.noModel"));
      return;
    }

    const setter = isGoogle ? setGoogleTranslating : setTranslating;
    setTranslateError(null);
    setTranslateLog([]);

    const totalLangs = targetLangs.length;
    const failedLangs: string[] = [];
    const config = providerConfigs[isGoogle ? "google" : provider] || { baseUrl: "", apiKey: "" };

    for (let li = 0; li < targetLangs.length; li++) {
      const lang = targetLangs[li];
      const langLabel = targetLanguages.find((l) => l.id === lang)?.label || lang;

      setter((prev) => ({ ...prev, [lang]: true }));
      setTranslateLog((prev) => [...prev, { text: `[${li + 1}/${totalLangs}] ${t("sidebar.translating", { lang: langLabel })}`, type: "info" }]);

      try {
        const reqBody: Record<string, unknown> = {
          provider: isGoogle ? "google" : provider,
          model: isGoogle ? "" : model,
          systemPrompt,
          targetLanguages: [lang],
          sourceLanguage: sourceLanguage.id,
          context: entries.map((e) => e.original),
          entries: indices.map((i) => ({
            index: i,
            text: entries[i].original,
          })),
          providerConfig: config,
        };
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });
        const data = await res.json();

        if (data.error && !data.results) {
          failedLangs.push(lang);
          setTranslateLog((prev) => [...prev, { text: `[${li + 1}/${totalLangs}] ${t("sidebar.failed", { lang: langLabel, error: data.error })}`, type: "error" }]);
          continue;
        }

        const results = data.results as Record<string, { index: number; text: string }[]>;
        for (const [rLang, translations] of Object.entries(results)) {
          translations.forEach((tr) => {
            const currentEntries = useStore.getState().entries;
            const entry = currentEntries[tr.index];
            if (entry) {
              updateTranslation(entry.id, rLang, tr.text);
            }
          });
        }

        if (data.errors) {
          failedLangs.push(lang);
          setTranslateLog((prev) => [...prev, { text: `[${li + 1}/${totalLangs}] ${t("sidebar.partialFail", { lang: langLabel })}`, type: "error" }]);
        } else {
          setTranslateLog((prev) => [...prev, { text: `[${li + 1}/${totalLangs}] ${t("sidebar.success", { lang: langLabel })}`, type: "success" }]);
        }
      } catch (err) {
        failedLangs.push(lang);
        setTranslateLog((prev) => [...prev, { text: `[${li + 1}/${totalLangs}] ${t("sidebar.failed", { lang: langLabel, error: err instanceof Error ? err.message : t("sidebar.unknownError") })}`, type: "error" }]);
      }

      setter((prev) => ({ ...prev, [lang]: false }));

      if (li < targetLangs.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (failedLangs.length > 0) {
      setTranslateError(t("sidebar.multiFail", { n: failedLangs.length, list: failedLangs.join(", ") }));
    }
  };

  const handleTranslateAll = () => {
    const isGoogle = provider === "google";
    const allLangs = targetLanguages.map((l) => l.id);
    const untranslated = entries
      .map((e, i) => (Object.keys(e.translations).length < allLangs.length ? i : -1))
      .filter((i) => i >= 0);
    if (untranslated.length === 0) return;
    doTranslate(untranslated, allLangs, isGoogle);
  };

  const handleTranslateSelected = () => {
    if (selectedIndices.length === 0) return;
    doTranslate(selectedIndices, [activeTab], provider === "google");
  };

  const anyTranslating = Object.values(translating).some(Boolean) || Object.values(googleTranslating).some(Boolean);

  return (
    <aside className="w-56 shrink-0 border-r p-3 flex flex-col gap-3 bg-gray-50 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">{t("sidebar.provider")}</label>
          {provider !== "google" && (
            <button
              onClick={() => setSettingsOpen(true)}
              title={t("sidebar.providerSettings")}
              className="text-gray-400 hover:text-gray-600 text-xs leading-none px-1"
            >
              &#9881;
            </button>
          )}
        </div>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as typeof provider)}
          className="w-full mt-1 p-1.5 border rounded text-sm"
        >
          {LLM_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{t(providerI18nKey[p.id])}</option>
          ))}
        </select>
      </div>

      {provider !== "google" && (
        <div>
          <label className="text-xs font-medium text-gray-500">{t("sidebar.model")}</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full mt-1 p-1.5 border rounded text-sm"
          >
            <option value="">{t("sidebar.selectModel")}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={fetchModels}
            disabled={loadingModels}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            {loadingModels ? t("sidebar.loading") : t("sidebar.refreshModels")}
          </button>
        </div>
      )}

      {provider !== "google" && (
        <div>
          <label className="text-xs font-medium text-gray-500">{t("sidebar.systemPrompt")}</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full mt-1 p-1.5 border rounded text-xs resize-y"
            placeholder={t("sidebar.editPrompt")}
          />
          <p className="mt-1 text-[10px] text-gray-400">
            {t("sidebar.promptHint")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleTranslateAll}
          disabled={anyTranslating || (provider !== "google" && !model) || entries.length === 0}
          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          {t("sidebar.translateAll", { n: targetLanguages.length })}
        </button>
        <button
          onClick={handleTranslateSelected}
          disabled={anyTranslating || selectedIndices.length === 0}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {t("sidebar.translateSelected")}
        </button>
      </div>

      {translateLog.length > 0 && (
        <div className="text-[11px] text-gray-600 space-y-0.5 max-h-48 overflow-y-auto">
          {translateLog.map((line, i) => (
            <div key={i} className={line.type === "error" ? "text-red-500" : line.type === "success" ? "text-green-600" : ""}>
              {line.text}
            </div>
          ))}
        </div>
      )}
      {translateError && (
        <p className="text-xs text-red-500">{translateError}</p>
      )}

      <div className="text-xs text-gray-400 mt-auto">
        {t("sidebar.count", { n: entries.length })}
      </div>

      <ProviderSettingsDialog
        open={settingsOpen}
        provider={provider}
        onClose={() => setSettingsOpen(false)}
      />
    </aside>
  );
}
