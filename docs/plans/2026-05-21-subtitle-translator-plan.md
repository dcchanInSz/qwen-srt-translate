# Subtitle Translation Agent - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive CAT-style subtitle translator with Next.js, React, TypeScript, Zustand, Tailwind CSS, and Ollama local LLM.

**Architecture:** Next.js App Router app with client-side table editor, API routes proxy to Ollama, Zustand for global state. SRT parser runs in browser; translation via `/api/translate` → Ollama HTTP API.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Zustand 5, Tailwind CSS 4, Ollama HTTP API

---

### Task 1: Project Foundation & Data Types

**Files:**
- Create: `src/types/subtitle.ts`
- Create: `src/lib/srt-parser.ts`
- Create: `src/lib/__tests__/srt-parser.test.ts`

**Step 1: Define data types**

```typescript
// src/types/subtitle.ts
export interface SubtitleEntry {
  id: number;
  startTime: string;   // "00:01:23,456"
  endTime: string;     // "00:01:25,789"
  original: string;
  translated: string;
  translatedAt?: number;
}

export interface TranslateRequest {
  model: string;
  systemPrompt: string;
  entries: { index: number; text: string }[];
}

export interface TranslateResponse {
  translations: { index: number; text: string }[];
}

export type ExportFormat = "srt" | "srt-bilingual" | "vtt" | "vtt-bilingual" | "ass";
```

**Step 2: Implement SRT parser**

```typescript
// src/lib/srt-parser.ts
import { SubtitleEntry } from "@/types/subtitle";

export function parseSrt(content: string): SubtitleEntry[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const entries: SubtitleEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) break;

    const indexLine = lines[i].trim();
    const id = parseInt(indexLine, 10);
    i++;

    if (i >= lines.length) break;
    const timeLine = lines[i].trim();
    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
    if (!timeMatch) break;
    const [, start, end] = timeMatch;
    i++;

    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i]);
      i++;
    }
    const original = textLines.join("\n").trim();

    entries.push({
      id: id || entries.length + 1,
      startTime: start.replace(".", ","),
      endTime: end.replace(".", ","),
      original,
      translated: "",
    });
  }

  return entries;
}

export function serializeSrt(entries: SubtitleEntry[], bilingual: boolean): string {
  return entries
    .map((entry, idx) => {
      const id = idx + 1;
      const time = `${entry.startTime} --> ${entry.endTime}`;
      const text = bilingual
        ? `${entry.original}\n${entry.translated || entry.original}`
        : entry.translated || entry.original;
      return `${id}\n${time}\n${text}`;
    })
    .join("\n\n") + "\n";
}
```

**Step 3: Write tests for SRT parser**

```typescript
// src/lib/__tests__/srt-parser.test.ts
import { parseSrt, serializeSrt } from "../srt-parser";

const sampleSrt = `1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:03,500 --> 00:00:06,000
Good morning

`;

describe("parseSrt", () => {
  it("should parse a valid SRT file", () => {
    const entries = parseSrt(sampleSrt);
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe(1);
    expect(entries[0].startTime).toBe("00:00:01,000");
    expect(entries[0].endTime).toBe("00:00:03,000");
    expect(entries[0].original).toBe("Hello world");
    expect(entries[0].translated).toBe("");
    expect(entries[1].original).toBe("Good morning");
  });

  it("should handle multiline subtitles", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Line one
Line two

`;
    const entries = parseSrt(srt);
    expect(entries[0].original).toBe("Line one\nLine two");
  });

  it("should handle period as decimal separator", () => {
    const srt = `1
00:00:01.000 --> 00:00:03.000
Hello

`;
    const entries = parseSrt(srt);
    expect(entries[0].startTime).toBe("00:00:01,000");
  });
});

describe("serializeSrt", () => {
  it("should serialize entries to SRT format", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "你好" },
    ];
    const result = serializeSrt(entries, false);
    expect(result).toContain("00:00:01,000 --> 00:00:03,000");
    expect(result).toContain("你好");
  });

  it("should produce bilingual SRT", () => {
    const entries = [
      { id: 1, startTime: "00:00:01,000", endTime: "00:00:03,000", original: "Hello", translated: "你好" },
    ];
    const result = serializeSrt(entries, true);
    expect(result).toContain("Hello\n你好");
  });
});
```

**Step 4: Run tests**

```bash
npx jest src/lib/__tests__/srt-parser.test.ts --no-coverage
```

**Step 5: Install Jest if needed**

If Jest is not available, install:
```bash
npm install -D jest @types/jest ts-jest
```

And add `jest.config.ts`:
```typescript
import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
export default config;
```

---

### Task 2: Zustand Store (Global State)

**Files:**
- Create: `src/store/useStore.ts`

**Step 1: Create the store**

```typescript
// src/store/useStore.ts
"use client";

import { create } from "zustand";
import { SubtitleEntry, ExportFormat } from "@/types/subtitle";

interface AppState {
  entries: SubtitleEntry[];
  fileName: string | null;
  selectedIndices: number[];
  model: string;
  systemPrompt: string;
  translateError: string | null;

  setEntries: (entries: SubtitleEntry[]) => void;
  setFileName: (name: string | null) => void;
  updateEntry: (id: number, updates: Partial<SubtitleEntry>) => void;
  setSelectedIndices: (indices: number[]) => void;
  toggleSelected: (index: number) => void;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTranslateError: (error: string | null) => void;
  translatedCount: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  entries: [],
  fileName: null,
  selectedIndices: [],
  model: "",
  systemPrompt: "你是一个专业的字幕翻译器。请将以下字幕翻译为中文，保持自然的语序和表达。",
  translateError: null,

  setEntries: (entries) => set({ entries, selectedIndices: [] }),
  setFileName: (fileName) => set({ fileName }),
  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates, translatedAt: Date.now() } : e
      ),
    })),
  setSelectedIndices: (selectedIndices) => set({ selectedIndices }),
  toggleSelected: (index) =>
    set((state) => {
      const indices = state.selectedIndices.includes(index)
        ? state.selectedIndices.filter((i) => i !== index)
        : [...state.selectedIndices, index];
      return { selectedIndices: indices };
    }),
  setModel: (model) => set({ model }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setTranslateError: (translateError) => set({ translateError }),
  translatedCount: () => get().entries.filter((e) => e.translated).length,
}));
```

---

### Task 3: API Routes

**Files:**
- Create: `src/app/api/models/route.ts`
- Create: `src/app/api/translate/route.ts`
- Create: `src/lib/ollama.ts`

**Step 1: Create Ollama client utility**

```typescript
// src/lib/ollama.ts
const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export async function getModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!res.ok) throw new Error(`Ollama API error: ${res.status}`);
  const data = await res.json();
  return data.models || [];
}

export async function translate(
  model: string,
  systemPrompt: string,
  texts: string[]
): Promise<string[]> {
  const separator = "\n---\n";
  const combined = texts.join(separator);

  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}

重要规则：我会给你多段文本，每段用 "---" 分隔。请翻译每一段，保持相同的分隔符格式。不要添加任何额外解释。`,
        },
        { role: "user", content: combined },
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama translate error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data.message?.content || "";

  return content.split("\n---\n").map((s: string) => s.trim());
}
```

**Step 2: Create API route for models**

```typescript
// src/app/api/models/route.ts
import { NextResponse } from "next/server";
import { getModels } from "@/lib/ollama";

export async function GET() {
  try {
    const models = await getModels();
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create API route for translate**

```typescript
// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/ollama";
import { TranslateRequest } from "@/types/subtitle";

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { model, systemPrompt, entries } = body;

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    const texts = entries.map((e) => e.text);
    const translated = await translate(model, systemPrompt, texts);

    const translations = entries.map((entry, i) => ({
      index: entry.index,
      text: translated[i] || entry.text,
    }));

    return NextResponse.json({ translations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
```

---

### Task 4: Layout & UI Components

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Create: `src/components/HeaderBar.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/SubtitleTable.tsx`
- Create: `src/components/StatusBar.tsx`

**Step 1: Update layout to set metadata**

```tsx
// src/app/layout.tsx (modify metadata title/description)
export const metadata: Metadata = {
  title: "Qwen SRT Translator",
  description: "Interactive subtitle translation with Qwen LLM",
};
```

**Step 2: Create HeaderBar component**

```tsx
// src/components/HeaderBar.tsx
"use client";

import { useRef } from "react";
import { useStore } from "@/store/useStore";
import { parseSrt, serializeSrt } from "@/lib/srt-parser";
import { ExportFormat } from "@/types/subtitle";

export default function HeaderBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setEntries, setFileName, entries, fileName } = useStore();

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

  const handleExport = (format: ExportFormat) => {
    const bilingual = format.includes("bilingual");
    const srtContent = serializeSrt(entries, bilingual);
    const ext = format.startsWith("vtt") ? "vtt" : format.startsWith("ass") ? "ass" : "srt";
    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.replace(/\.[^.]+$/, "") || "output"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 shrink-0">
      <h1 className="text-lg font-bold whitespace-nowrap">SRT Translator</h1>

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
        Load SRT
      </button>

      {fileName && (
        <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
      )}

      <div className="flex-1" />

      {entries.length > 0 && (
        <select
          onChange={(e) => handleExport(e.target.value as ExportFormat)}
          defaultValue=""
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="" disabled>Export...</option>
          <option value="srt">SRT (Translation only)</option>
          <option value="srt-bilingual">SRT (Bilingual)</option>
          <option value="vtt">VTT (Translation only)</option>
          <option value="vtt-bilingual">VTT (Bilingual)</option>
          <option value="ass">ASS (Translation only)</option>
        </select>
      )}
    </header>
  );
}
```

**Step 3: Create Sidebar component**

```tsx
// src/components/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export default function Sidebar() {
  const {
    entries, selectedIndices, model, systemPrompt,
    setModel, setSystemPrompt, setTranslateError, updateEntry,
  } = useStore();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(data.models?.map((m: { name: string }) => m.name) || []);
    } catch {
      setModels([]);
    }
    setLoadingModels(false);
  };

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
      {useStore((s) => s.translateError) && (
        <p className="text-xs text-red-500">{useStore((s) => s.translateError)}</p>
      )}

      <div className="text-xs text-gray-400 mt-auto">
        Total: {entries.length} | Translated: {entries.filter((e) => e.translated).length}
      </div>
    </aside>
  );
}
```

**Step 4: Create SubtitleTable component**

```tsx
// src/components/SubtitleTable.tsx
"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { SubtitleEntry } from "@/types/subtitle";

const TIME_REGEX = /^\d{2}:\d{2}:\d{2}[,.]\d{3}$/;

function EditableCell({
  value,
  onSave,
  className = "",
  validate,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  validate?: (v: string) => boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);

  const handleSave = useCallback(() => {
    if (validate && !validate(draft)) {
      setError(true);
      return;
    }
    setError(false);
    onSave(draft);
    setEditing(false);
  }, [draft, onSave, validate]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setError(false);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") handleCancel();
    },
    [handleSave, handleCancel]
  );

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(false);
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full p-0.5 border rounded text-sm outline-none ${error ? "border-red-500 bg-red-50" : "border-blue-400"} ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`p-1 text-sm cursor-pointer hover:bg-gray-100 rounded min-h-[24px] ${className}`}
    >
      {value || <span className="text-gray-300">Double-click to edit</span>}
    </div>
  );
}

export default function SubtitleTable() {
  const { entries, selectedIndices, updateEntry, toggleSelected } = useStore();

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Load an SRT file to begin
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th className="w-8 p-2 text-left text-xs font-medium text-gray-500 border-b">
              <input
                type="checkbox"
                checked={selectedIndices.length === entries.length && entries.length > 0}
                onChange={() => {
                  if (selectedIndices.length === entries.length) {
                    useStore.getState().setSelectedIndices([]);
                  } else {
                    useStore.getState().setSelectedIndices(entries.map((_, i) => i));
                  }
                }}
                className="w-3.5 h-3.5"
              />
            </th>
            <th className="w-10 p-2 text-left text-xs font-medium text-gray-500 border-b">#</th>
            <th className="w-28 p-2 text-left text-xs font-medium text-gray-500 border-b">Start</th>
            <th className="w-28 p-2 text-left text-xs font-medium text-gray-500 border-b">End</th>
            <th className="p-2 text-left text-xs font-medium text-gray-500 border-b">Original</th>
            <th className="p-2 text-left text-xs font-medium text-gray-500 border-b">Translation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <tr
                key={entry.id}
                className={`border-b ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <td className="p-1 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(idx)}
                    className="w-3.5 h-3.5"
                  />
                </td>
                <td className="p-1 text-xs text-gray-400 text-center">{idx + 1}</td>
                <td className="p-1">
                  <EditableCell
                    value={entry.startTime}
                    onSave={(v) => updateEntry(entry.id, { startTime: v })}
                    validate={(v) => TIME_REGEX.test(v)}
                    className="font-mono text-xs"
                  />
                </td>
                <td className="p-1">
                  <EditableCell
                    value={entry.endTime}
                    onSave={(v) => updateEntry(entry.id, { endTime: v })}
                    validate={(v) => TIME_REGEX.test(v)}
                    className="font-mono text-xs"
                  />
                </td>
                <td className="p-1 text-sm whitespace-pre-wrap">{entry.original}</td>
                <td className="p-1">
                  <EditableCell
                    value={entry.translated}
                    onSave={(v) => updateEntry(entry.id, { translated: v })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 5: Create StatusBar component**

```tsx
// src/components/StatusBar.tsx
"use client";

import { useStore } from "@/store/useStore";

export default function StatusBar() {
  const entries = useStore((s) => s.entries);
  const selectedIndices = useStore((s) => s.selectedIndices);
  const model = useStore((s) => s.model);
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
        Model: {model || "none"}
      </span>
      {translateError && (
        <span className="text-red-500">{translateError}</span>
      )}
    </footer>
  );
}
```

**Step 6: Update page.tsx**

```tsx
// src/app/page.tsx
"use client";

import HeaderBar from "@/components/HeaderBar";
import Sidebar from "@/components/Sidebar";
import SubtitleTable from "@/components/SubtitleTable";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <SubtitleTable />
      </div>
      <StatusBar />
    </div>
  );
}
```

---

### Task 5: Integration & Final Touches

**Files:**
- Create: `src/lib/exporters.ts` (VTT/ASS export)
- Modify: `src/components/HeaderBar.tsx` (use exporters)
- Update: `src/app/globals.css` (tailwind base)

**Step 1: Create VTT/ASS exporters**

```typescript
// src/lib/exporters.ts
import { SubtitleEntry } from "@/types/subtitle";

export function serializeVtt(entries: SubtitleEntry[], bilingual: boolean): string {
  let vtt = "WEBVTT\n\n";
  entries.forEach((entry, idx) => {
    const start = entry.startTime.replace(",", ".");
    const end = entry.endTime.replace(",", ".");
    const text = bilingual
      ? `${entry.original}\n${entry.translated || entry.original}`
      : entry.translated || entry.original;
    vtt += `${idx + 1}\n${start} --> ${end}\n${text}\n\n`;
  });
  return vtt;
}

export function serializeAss(entries: SubtitleEntry[], bilingual: boolean): string {
  let ass = `[Script Info]
Title: Translated Subtitles
ScriptType: v4.00+
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  entries.forEach((entry) => {
    const start = entry.startTime.replace(",", ".").substring(0, 11);
    const end = entry.endTime.replace(",", ".").substring(0, 11);
    const text = bilingual
      ? `${entry.original}\\N${entry.translated || entry.original}`
      : entry.translated || entry.original;
    ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
  });

  return ass;
}
```

**Step 2: Update HeaderBar export handler to use exporters**

In HeaderBar, update `handleExport` to call appropriate serializer based on format.

```tsx
import { serializeVtt, serializeAss } from "@/lib/exporters";

const handleExport = (format: ExportFormat) => {
  const bilingual = format.includes("bilingual");
  let content: string;
  let ext: string = "srt";

  if (format.startsWith("vtt")) {
    content = serializeVtt(entries, bilingual);
    ext = "vtt";
  } else if (format.startsWith("ass")) {
    content = serializeAss(entries, bilingual);
    ext = "ass";
  } else {
    content = serializeSrt(entries, bilingual);
    ext = "srt";
  }

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName?.replace(/\.[^.]+$/, "") || "output"}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Step 3: Ensure globals.css has proper base**

```css
/* src/app/globals.css */
@import "tailwindcss";
```

**Step 4: Verify build**

```bash
npm run build
```

---

### Task 6: Testing & Polish

**Files:**
- Verify: All tests pass
- Modify: Various components for edge cases

**Step 1: Run lint**

```bash
npm run lint
```

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

**Step 3: Manual test checklist**

- [ ] Load SRT file - entries populate table
- [ ] Select Ollama model from sidebar
- [ ] Translate all - translations populate
- [ ] Translate selected rows
- [ ] Double-click time cell - edit with validation
- [ ] Double-click translation cell - edit text
- [ ] Invalid time format shows red border
- [ ] Export SRT / VTT / ASS (translation only + bilingual)
- [ ] Checkbox select all / select individual
- [ ] Error when Ollama not running shows error message
