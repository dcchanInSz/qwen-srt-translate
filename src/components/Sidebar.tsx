"use client";

import { useCallback, useEffect, useState } from "react";
import { LLM_PROVIDERS } from "@/lib/llm";
import { TARGET_LANGUAGES } from "@/lib/languages";
import { useStore } from "@/store/useStore";

export default function Sidebar() {
  const {
    entries, selectedIndices, provider, model, targetLanguage, systemPrompt,
    translateError,
    setProvider, setModel, setTargetLanguage, setSystemPrompt, setTranslateError,
    updateEntry,
  } = useStore();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState("");

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

  const doTranslate = async (indices: number[]) => {
    if (!model) {
      setTranslateError("请先选择模型");
      return;
    }
    setTranslating(true);
    setTranslateError(null);
    setProgress(`正在翻译 ${indices.length} 条…`);

    try {
      const reqBody = {
        provider,
        model,
        systemPrompt,
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
      console.log("[Sidebar] translate response:", data);
      if (data.error) {
        setTranslateError(data.error);
      } else {
        const translations = data.translations as { index: number; text: string }[];
        const emptyCount = translations.filter(t => !t.text).length;
        console.log("[Sidebar] translations received:", {
          count: translations.length,
          emptyCount,
          samples: translations.filter(t => t.text).slice(0, 3).map(t => ({ index: t.index, text: t.text.slice(0, 50) })),
        });
        translations.forEach((t) => {
          const currentEntries = useStore.getState().entries;
          const entry = currentEntries[t.index];
          if (entry) {
            updateEntry(entry.id, { translated: t.text });
          }
        });
        setProgress("");
      }
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "翻译失败");
    }
    setTranslating(false);
  };

  const handleTranslateAll = () => {
    const untranslated = entries
      .map((e, i) => (e.translated ? -1 : i))
      .filter((i) => i >= 0);
    if (untranslated.length === 0) return;
    doTranslate(untranslated);
  };

  const handleTranslateSelected = () => {
    if (selectedIndices.length === 0) return;
    doTranslate(selectedIndices);
  };

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

      <div>
        <label className="text-xs font-medium text-gray-500">目标语言</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full mt-1 p-1.5 border rounded text-sm"
        >
          {TARGET_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">系统提示词</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          className="w-full mt-1 p-1.5 border rounded text-xs resize-y"
          placeholder="编辑提示词，或在上方选择「自定义」"
        />
        {targetLanguage !== "custom" && (
          <p className="mt-1 text-[10px] text-gray-400">
            根据目标语言自动生成。修改后将切换为「自定义」。
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleTranslateAll}
          disabled={translating || !model || entries.length === 0}
          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          全部翻译
        </button>
        <button
          onClick={handleTranslateSelected}
          disabled={translating || selectedIndices.length === 0}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          翻译选中
        </button>
      </div>

      {progress && <p className="text-xs text-blue-600">{progress}</p>}
      {translateError && (
        <p className="text-xs text-red-500">{translateError}</p>
      )}

      <div className="text-xs text-gray-400 mt-auto">
        共 {entries.length} 条 · 已译 {entries.filter((e) => e.translated).length} 条
      </div>
    </aside>
  );
}
