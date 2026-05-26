# Qwen SRT Translate

[中文文档](./README.zh-CN.md)

A Next.js-powered subtitle translation tool that uses local LLMs via **Ollama** or **LM Studio** to translate `.srt` files. Supports 8 target languages, multi-language tabs, inline editing, and multi-format export (SRT, VTT, ASS, JSON).

## Features

- **Local-first** — All translations run through your local LLM server; no cloud API keys required
- **Context-aware** — Sends the full subtitle script as context so the LLM understands plot, characters, and terminology
- **8 target languages** — Traditional Chinese, Japanese, Korean, Spanish, French, German, Portuguese, Russian
- **Multi-language tabs** — Switch between language translations side by side
- **Inline editing** — Double-click any cell to edit timestamps, original text, or translations
- **Row operations** — Move, split, and merge translation rows
- **Multi-format export** — Download translations as SRT, VTT, ASS, JSON, or all-in-one ZIP
- **Google Translate fallback** — Built-in free Google Translate for quick translations without a local LLM
- **Docker support** — Ready-to-use Dockerfile and docker-compose.yml

## Screenshot

<!-- TODO: add screenshot -->

## Prerequisites

Choose one (or install both):

- **[Ollama](https://ollama.com)** — Run LLMs locally. Default: `http://localhost:11434`
- **[LM Studio](https://lmstudio.ai)** — Load a model and start the Local Server (OpenAI-compatible API). Default: `http://localhost:1234/v1`

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click **Load SRT** or drag a `.srt` file onto the page
2. Select a **Provider** (Ollama / LM Studio / Google Translate) in the sidebar
3. For Ollama or LM Studio, click **Refresh Models** and select a model
4. Choose a **Target Language** tab and click **Translate Selected** (or **Translate All** for all 8 languages)
5. Review and edit translations inline, then **Export** in your preferred format

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE` | `http://localhost:11434` | Ollama API base URL |
| `LM_STUDIO_BASE` | `http://localhost:1234/v1` | LM Studio OpenAI-compatible API base URL |

## Docker

```bash
# Build and run with Docker Compose
docker compose up -d --build
```

The app will be available at [http://localhost:3000](http://localhost:3000). The container is configured to connect to Ollama/LM Studio running on your host machine via `host.docker.internal`.

## Development

```bash
# Run tests
npm test

# Lint
npm run lint

# Production build
npm run build
npm start
```

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Zustand](https://zustand-demo.pmnd.rs) for state management
- [Vercel AI SDK](https://sdk.vercel.ai) for LLM integration
- [Tailwind CSS](https://tailwindcss.com) 4

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE)
