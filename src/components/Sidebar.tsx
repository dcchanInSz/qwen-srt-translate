"use client";

import { useCallback, useEffect, useState } from "react";
import { LLM_PROVIDERS } from "@/lib/llm";
import { useStore } from "@/store/useStore";
import { TARGET_LANGUAGES } from "@/lib/languages";

export default function Sidebar() {
  const {
    entries, selectedIndices, provider, model, systemPrompt,
    translateError,
    setProvider, setModel, setSystemPrompt, setTranslateError,
    updateTranslation,
  } = useStore();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState("");
  const [googleTranslating, setGoogleTranslating] = useState<Record<string, boolean>>({});
  const [googleProgress, setGoogleProgress] = useState("");

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const res = await fetch(`/api/models?provider=${provider}`);
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
  }, [provider]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
  }, [fetchModels]);

  const doTranslate = async (indices: number[], isGoogle: boolean) => {
    if (!isGoogle && !model) {
      setTranslateError("请先选择模型");
      return;
    }
    const allLangs = TARGET_LANGUAGES.map((l) => l.id);

    const setter = isGoogle ? setGoogleTranslating : setTranslating;
    const progressSetter = isGoogle ? setGoogleProgress : setProgress;

    const initial: Record<string, boolean> = {};
    allLangs.forEach((l) => (initial[l] = true));
    setter(initial);
    setTranslateError(null);
    progressSetter(`正在翻译 ${indices.length} 条 × ${allLangs.length} 语言…`);

    try {
      const reqBody: Record<string, unknown> = {
        provider: isGoogle ? "google" : provider,
        model: isGoogle ? "" : model,
        systemPrompt,
        targetLanguages: allLangs,
        context: entries.map((e) => e.original),
        entries: indices.map((i) => ({
          index: i,
          text: entries[i].original,
        })),
      };
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();

      if (data.error && !data.results) {
        setTranslateError(data.error);
        setter({});
        return;
      }

      const results = data.results as Record<string, { index: number; text: string }[]>;
      for (const [lang, translations] of Object.entries(results)) {
        translations.forEach((t) => {
          const currentEntries = useStore.getState().entries;
          const entry = currentEntries[t.index];
          if (entry) {
            updateTranslation(entry.id, lang, t.text);
          }
        });
      }

      if (data.errors) {
        const errLangs = Object.keys(data.errors);
        setTranslateError(`部分语言翻译失败: ${errLangs.join(", ")}`);
      }

      progressSetter("");
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "翻译失败");
    }
    setter({});
  };

  const handleTranslateAll = () => {
    const isGoogle = provider === "google";
    if (!isGoogle) {
      const untranslated = entries
        .map((e, i) => (Object.keys(e.translations).length < TARGET_LANGUAGES.length ? i : -1))
        .filter((i) => i >= 0);
      if (untranslated.length === 0) return;
      doTranslate(untranslated, false);
    } else {
      const untranslated = entries
        .map((e, i) => (Object.keys(e.translations).length < TARGET_LANGUAGES.length ? i : -1))
        .filter((i) => i >= 0);
      if (untranslated.length === 0) return;
      doTranslate(untranslated, true);
    }
  };

  const handleTranslateSelected = () => {
    if (selectedIndices.length === 0) return;
    doTranslate(selectedIndices, provider === "google");
  };

  const anyTranslating = Object.values(translating).some(Boolean) || Object.values(googleTranslating).some(Boolean);

  return (
    <aside className="w-56 shrink-0 border-r p-3 flex flex-col gap-3 bg-gray-50 overflow-y-auto">
      <div>
        <label className="text-xs font-medium text-gray-500">提供商</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as typeof provider)}
          className="w-full mt-1 p-1.5 border rounded text-sm"
        >
          {LLM_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      {provider !== "google" && (
        <div>
          <label className="text-xs font-medium text-gray-500">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full mt-1 p-1.5 border rounded text-sm"
          >
            <option value="">— 选择模型 —</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={fetchModels}
            disabled={loadingModels}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            {loadingModels ? "加载中…" : "刷新模型列表"}
          </button>
        </div>
      )}

      {provider !== "google" && (
        <div>
          <label className="text-xs font-medium text-gray-500">系统提示词</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full mt-1 p-1.5 border rounded text-xs resize-y"
            placeholder="编辑提示词"
          />
          <p className="mt-1 text-[10px] text-gray-400">
            切换语言 Tab 时自动更新提示词
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleTranslateAll}
          disabled={anyTranslating || (provider !== "google" && !model) || entries.length === 0}
          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          全部翻译 (8 语言)
        </button>
        <button
          onClick={handleTranslateSelected}
          disabled={anyTranslating || selectedIndices.length === 0}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          翻译选中
        </button>
      </div>

      {progress && <p className="text-xs text-blue-600">{progress}</p>}
      {googleProgress && <p className="text-xs text-emerald-600">{googleProgress}</p>}
      {translateError && (
        <p className="text-xs text-red-500">{translateError}</p>
      )}

      <div className="text-xs text-gray-400 mt-auto">
        共 {entries.length} 条
      </div>
    </aside>
  );
}
