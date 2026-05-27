export type Locale = "zh" | "en";

export interface Translations {
  // App / Header
  "app.title": string;
  "app.description": string;
  "header.loadSrt": string;
  "header.settings": string;
  "header.settingsTitle": string;
  "header.exportFormat": string;
  "header.exportAll": string;
  "header.exporting": string;

  // Sidebar
  "sidebar.provider": string;
  "sidebar.model": string;
  "sidebar.selectModel": string;
  "sidebar.loading": string;
  "sidebar.refreshModels": string;
  "sidebar.systemPrompt": string;
  "sidebar.editPrompt": string;
  "sidebar.promptHint": string;
  "sidebar.translateAll": string;
  "sidebar.translateSelected": string;
  "sidebar.noModel": string;
  "sidebar.translating": string;
  "sidebar.failed": string;
  "sidebar.partialFail": string;
  "sidebar.success": string;
  "sidebar.unknownError": string;
  "sidebar.multiFail": string;
  "sidebar.count": string;
  "sidebar.providerSettings": string;

  // Provider settings dialog
  "providerSettings.title": string;
  "providerSettings.baseUrl": string;
  "providerSettings.baseUrlHint": string;
  "providerSettings.baseUrlHintCloud": string;
  "providerSettings.baseUrlPlaceholder.ollama": string;
  "providerSettings.baseUrlPlaceholder.lmstudio": string;
  "providerSettings.baseUrlPlaceholder.openai": string;
  "providerSettings.baseUrlPlaceholder.anthropic": string;
  "providerSettings.apiKey": string;
  "providerSettings.apiKeyPlaceholder": string;
  "providerSettings.apiKeyHint": string;
  "providerSettings.cancel": string;
  "providerSettings.save": string;

  // Subtitle table
  "table.empty": string;
  "table.start": string;
  "table.end": string;
  "table.original": string;
  "table.translation": string;
  "table.actions": string;
  "table.doubleClick": string;
  "table.moveUp": string;
  "table.moveDown": string;
  "table.split": string;
  "table.merge": string;

  // Status bar
  "status.subtitles": string;
  "status.translated": string;
  "status.selected": string;
  "status.noModel": string;

  // Config dialog
  "config.title": string;
  "config.sourceLang": string;
  "config.sourceHint": string;
  "config.targetLang": string;
  "config.langCount": string;
  "config.noTargets": string;
  "config.selectLang": string;
  "config.add": string;
  "config.targetHint": string;
  "config.reset": string;
  "config.cancel": string;
  "config.save": string;

  // Page
  "page.dropHint": string;

  // Providers
  "provider.google": string;
  "provider.ollama": string;
  "provider.lmstudio": string;
  "provider.openai": string;
  "provider.anthropic": string;
}
