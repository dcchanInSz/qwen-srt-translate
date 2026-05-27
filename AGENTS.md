<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: qwen-srt-translate

SRT 字幕翻译工具 — 使用本地 LLM（Ollama / LM Studio / Google Gemini / Anthropic）翻译 SRT 字幕文件。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.2.6 (App Router) |
| UI | React 19.2.4 |
| 样式 | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| 状态管理 | Zustand v5 |
| LLM SDK | Vercel AI SDK v6 (`@ai-sdk/openai-compatible`, `@ai-sdk/anthropic`) |
| 校验 | Zod v4 |
| 语言 | TypeScript 5 |
| 测试 | Jest v30 + ts-jest |
| Lint | ESLint v9 flat config |
| 打包 | Next.js 内置 Turbopack |
| 包管理 | npm（CI/Docker 用 npm，本地也可用 pnpm） |

## 项目结构

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── models/          # GET /api/models - 获取可用模型列表
│   │   └── translate/       # POST /api/translate - 执行翻译
│   ├── layout.tsx           # 根布局（metadata, fonts）
│   ├── page.tsx             # 主页（拖拽上传 SRT、字幕表格）
│   └── globals.css          # Tailwind v4 入口 (@import "tailwindcss")
├── components/              # React 客户端组件（全部使用 "use client"）
│   ├── ClientLayout.tsx
│   ├── ConfigDialog.tsx
│   ├── HeaderBar.tsx
│   ├── ProviderSettingsDialog.tsx
│   ├── Sidebar.tsx
│   ├── StatusBar.tsx
│   └── SubtitleTable.tsx
├── i18n/                    # 国际化（中/英）
│   ├── index.ts             # useI18n hook + I18nProvider
│   ├── types.ts
│   ├── en.ts
│   └── zh.ts
├── lib/                     # 业务逻辑（server-safe）
│   ├── srt-parser.ts        # SRT 解析
│   ├── exporters.ts         # 导出 SRT/VTT/ASS/JSON
│   ├── languages.ts         # 语言代码/名称映射
│   ├── llm/                 # LLM 抽象层
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── providers.ts     # Provider 注册表
│   │   ├── google.ts        # Google Gemini
│   │   └── agent.ts         # LLM 翻译 Agent
│   └── __tests__/           # Jest 单元测试
│       ├── srt-parser.test.ts
│       ├── exporters.test.ts
│       ├── languages.test.ts
│       └── llm-prompt.test.ts
├── store/
│   └── useStore.ts          # Zustand 全局状态
└── types/
    └── subtitle.ts          # SubtitleEntry 等类型定义
```

## 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbopack HMR) |
| `npm run build` | 生产构建 (standalone 输出) |
| `npm start` | 启动生产服务 |
| `npm run lint` | ESLint 检查 |
| `npm test` | 运行 Jest 测试 |

## 代码约定

- 组件文件使用 `"use client"` 指令
- 路径别名 `@/` 映射到 `src/`
- TypeScript strict mode
- 使用 `zustand` 管理全局状态，store 文件在 `src/store/`
- API 路由负责 LLM 调用，前端只做 UI 和状态管理
- 翻译核心逻辑在 `src/lib/llm/agent.ts`
