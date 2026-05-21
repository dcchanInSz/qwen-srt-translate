# Subtitle Translation Agent - Design Document

## Overview

An interactive CAT-style subtitle translator built with Next.js/React + TypeScript, using local Ollama + Qwen models for translation.

## Architecture

```
┌─────────────────────────────────────────────┐
│                Next.js App                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ SRT Load │  │  Table   │  │  Export   │  │
│  │  Parser  │  │  Editor  │  │  Module   │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│                      │                       │
│              ┌───────┴───────┐               │
│              │  Translate    │               │
│              │  Engine       │               │
│              │  (Ollama API) │               │
│              └───────────────┘               │
└─────────────────────────────────────────────┘
```

## Tech Stack

- Next.js 14+ App Router
- React 18 + TypeScript
- Zustand (state management)
- Tailwind CSS (styling)
- Ollama HTTP API (local translation)

## Data Model

```ts
interface SubtitleEntry {
  id: number;
  startTime: string;   // "00:01:23,456"
  endTime: string;     // "00:01:25,789"
  original: string;
  translated: string;
  translatedAt?: number;
}
```

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: 文件名 + 工具栏 (加载/保存/导出/翻译设置)    │
├──────────┬──────────────────────────────────────────┤
│  侧边栏  │  表格编辑区 (5 columns)                    │
│          │  # | 开始时间 | 结束时间 | 原文 | 译文      │
│  - 模型  │                                          │
│  - 翻译  │                                          │
│  - 操作  │                                          │
├──────────┴──────────────────────────────────────────┤
│  Footer: 状态栏 (总句数/已翻译/选中行/模型状态)       │
└─────────────────────────────────────────────────────┘
```

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/models` | GET | Get available Ollama models |
| `/api/translate` | POST | Translate subtitle entries |

## Export Formats

- SRT (single language, bilingual)
- VTT (single language, bilingual)
- ASS (with style, bilingual)

## Features

- SRT file load/parse
- Table editor with inline editing (time, translation)
- Ollama model selection
- Single/batch translate
- Time axis editing with validation
- Keyboard navigation (arrows, Enter, Esc)
- Multi-format export
