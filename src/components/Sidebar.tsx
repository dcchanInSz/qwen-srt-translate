"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export default function Sidebar() {
  const {
    entries, selectedIndices, model, systemPrompt, translateError,
    setModel, setSystemPrompt, setTranslateError, updateEntry,
  } = useStore();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState("");

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(data.models?.map((m: { name: string }) => m.name) || []);
    } catch {
      setModels([]);
    }
    setLoadingModels(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
  }, [fetchModels]);

  const doTranslate = async (indices: number[]) => {
    if (!model) {
      setTranslateError("Please select a model first");
      return;
    }
    setTranslating(true);
    setTranslateError(null);
    setProgress(`Translating ${indices.length} entries...`);

    try {
      const reqBody = {
        model,
        systemPrompt,
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
      if (data.error) {
        setTranslateError(data.error);
      } else {
        data.translations.forEach((t: { index: number; text: string }) => {
          updateEntry(entries[t.index].id, { translated: t.text });
        });
        setProgress("");
      }
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "Translation failed");
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
        <label className="text-xs font-medium text-gray-500">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full mt-1 p-1.5 border rounded text-sm"
        >
          <option value="">-- Select model --</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          onClick={fetchModels}
          disabled={loadingModels}
          className="mt-1 text-xs text-blue-500 hover:underline"
        >
          {loadingModels ? "Loading..." : "Refresh models"}
        </button>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          className="w-full mt-1 p-1.5 border rounded text-xs resize-y"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleTranslateAll}
          disabled={translating || !model || entries.length === 0}
          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Translate All
        </button>
        <button
          onClick={handleTranslateSelected}
          disabled={translating || selectedIndices.length === 0}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Translate Selected
        </button>
      </div>

      {progress && <p className="text-xs text-blue-600">{progress}</p>}
      {translateError && (
        <p className="text-xs text-red-500">{translateError}</p>
      )}

      <div className="text-xs text-gray-400 mt-auto">
        Total: {entries.length} | Translated: {entries.filter((e) => e.translated).length}
      </div>
    </aside>
  );
}
