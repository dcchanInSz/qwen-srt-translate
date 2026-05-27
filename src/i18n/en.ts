import type { Translations } from "./types";

const en: Translations = {
  // App / Header
  "app.title": "SRT Subtitle Translator",
  "app.description": "Interactive subtitle translation tool powered by LLMs",
  "header.loadSrt": "Load SRT",
  "header.settings": "\u2699 Settings",
  "header.settingsTitle": "Set source and target languages",
  "header.exportFormat": "Export format\u2026",
  "header.exportAll": "Export All (ZIP)",
  "header.exporting": "Exporting\u2026",

  // Sidebar
  "sidebar.provider": "Provider",
  "sidebar.model": "Model",
  "sidebar.selectModel": "\u2014 Select Model \u2014",
  "sidebar.loading": "Loading\u2026",
  "sidebar.refreshModels": "Refresh model list",
  "sidebar.systemPrompt": "System Prompt",
  "sidebar.editPrompt": "Edit prompt",
  "sidebar.promptHint": "Prompt auto-updates when switching language tabs",
  "sidebar.translateAll": "Translate All ({n} langs)",
  "sidebar.translateSelected": "Translate Selected",
  "sidebar.noModel": "Please select a model first",
  "sidebar.translating": "Translating {lang}\u2026",
  "sidebar.failed": "{lang} failed: {error}",
  "sidebar.partialFail": "{lang} partially failed",
  "sidebar.success": "{lang} \u2713 Done",
  "sidebar.unknownError": "Unknown error",
  "sidebar.multiFail": "{n} language(s) failed: {list}",
  "sidebar.count": "{n} entries",
  "sidebar.providerSettings": "Provider Settings",

  // Provider settings dialog
  "providerSettings.title": "{provider} Settings",
  "providerSettings.baseUrl": "Base URL",
  "providerSettings.baseUrlHint": "Local server address and port, e.g. http://localhost:11434",
  "providerSettings.baseUrlHintCloud": "API endpoint URL, e.g. https://api.openai.com/v1",
  "providerSettings.baseUrlPlaceholder.ollama": "http://localhost:11434",
  "providerSettings.baseUrlPlaceholder.lmstudio": "http://localhost:1234",
  "providerSettings.baseUrlPlaceholder.openai": "https://api.openai.com/v1",
  "providerSettings.baseUrlPlaceholder.anthropic": "https://api.anthropic.com/v1",
  "providerSettings.apiKey": "API Key",
  "providerSettings.apiKeyPlaceholder": "Enter API key",
  "providerSettings.apiKeyHint": "Key is stored locally in your browser only",
  "providerSettings.cancel": "Cancel",
  "providerSettings.save": "Save",

  // Subtitle table
  "table.empty": "Load an SRT file to get started",
  "table.start": "Start",
  "table.end": "End",
  "table.original": "Original ({lang})",
  "table.translation": "Translation",
  "table.actions": "Actions",
  "table.doubleClick": "Double-click to edit",
  "table.moveUp": "Swap translation with above",
  "table.moveDown": "Swap translation with below",
  "table.split": "Split",
  "table.merge": "Merge with above",

  // Status bar
  "status.subtitles": "Subtitles: {n}",
  "status.translated": "Translated ({lang}): {n}",
  "status.selected": "Selected: {n}",
  "status.noModel": "None",

  // Config dialog
  "config.title": "Settings",
  "config.sourceLang": "Source Language",
  "config.sourceHint": "The selected translation model must support this source language",
  "config.targetLang": "Target Languages",
  "config.langCount": "{n} language(s)",
  "config.noTargets": "No target languages added yet",
  "config.selectLang": "\u2014 Select Language Code \u2014",
  "config.add": "Add",
  "config.targetHint": "The selected translation model must support the target languages",
  "config.reset": "Reset to Default",
  "config.cancel": "Cancel",
  "config.save": "Save",

  // Page
  "page.dropHint": "Drop SRT file here",

  // Providers
  "provider.google": "Google Translate",
  "provider.ollama": "Ollama",
  "provider.lmstudio": "LM Studio",
  "provider.openai": "OpenAI",
  "provider.anthropic": "Anthropic",
};

export default en;
