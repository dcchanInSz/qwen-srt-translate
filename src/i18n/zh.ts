import type { Translations } from "./types";

const zh: Translations = {
  // App / Header
  "app.title": "SRT 字幕翻译",
  "app.description": "基于大模型的交互式字幕翻译工具",
  "header.loadSrt": "加载 SRT",
  "header.settings": "\u2699 设置",
  "header.settingsTitle": "设置源语言和目标语言",
  "header.exportFormat": "导出格式\u2026",
  "header.exportAll": "导出全部 (ZIP)",
  "header.exporting": "导出中\u2026",

  // Sidebar
  "sidebar.provider": "提供商",
  "sidebar.model": "模型",
  "sidebar.selectModel": "\u2014 选择模型 \u2014",
  "sidebar.loading": "加载中\u2026",
  "sidebar.refreshModels": "刷新模型列表",
  "sidebar.systemPrompt": "系统提示词",
  "sidebar.editPrompt": "编辑提示词",
  "sidebar.promptHint": "切换语言 Tab 时自动更新提示词",
  "sidebar.translateAll": "全部翻译 ({n} 语言)",
  "sidebar.translateSelected": "翻译选中",
  "sidebar.noModel": "请先选择模型",
  "sidebar.translating": "{lang} 翻译中\u2026",
  "sidebar.failed": "{lang} 失败: {error}",
  "sidebar.partialFail": "{lang} 部分失败",
  "sidebar.success": "{lang} \u2713 完成",
  "sidebar.unknownError": "未知错误",
  "sidebar.multiFail": "{n} 个语言翻译失败: {list}",
  "sidebar.count": "共 {n} 条",
  "sidebar.providerSettings": "提供商设置",

  // Provider settings dialog
  "providerSettings.title": "{provider} 设置",
  "providerSettings.baseUrl": "服务地址",
  "providerSettings.baseUrlHint": "本地服务的地址和端口，例如 http://localhost:11434",
  "providerSettings.baseUrlHintCloud": "API 端点地址，例如 https://api.openai.com/v1",
  "providerSettings.baseUrlPlaceholder.ollama": "http://localhost:11434",
  "providerSettings.baseUrlPlaceholder.lmstudio": "http://localhost:1234",
  "providerSettings.baseUrlPlaceholder.openai": "https://api.openai.com/v1",
  "providerSettings.baseUrlPlaceholder.anthropic": "https://api.anthropic.com/v1",
  "providerSettings.apiKey": "API 密钥",
  "providerSettings.apiKeyPlaceholder": "输入 API 密钥",
  "providerSettings.apiKeyHint": "密钥仅存储在本地浏览器中，不会上传",
  "providerSettings.cancel": "取消",
  "providerSettings.save": "保存",

  // Subtitle table
  "table.empty": "加载 SRT 文件开始使用",
  "table.start": "开始",
  "table.end": "结束",
  "table.original": "原文 ({lang})",
  "table.translation": "译文",
  "table.actions": "操作",
  "table.doubleClick": "双击编辑",
  "table.moveUp": "与上一条交换译文",
  "table.moveDown": "与下一条交换译文",
  "table.split": "拆分",
  "table.merge": "与上一条合并",

  // Status bar
  "status.subtitles": "字幕：{n} 条",
  "status.translated": "已译（{lang}）：{n} 条",
  "status.selected": "已选：{n} 条",
  "status.noModel": "未选择",

  // Config dialog
  "config.title": "设置",
  "config.sourceLang": "源语言",
  "config.sourceHint": "选择的翻译模型需支持该源语言",
  "config.targetLang": "目标语言",
  "config.langCount": "{n} 种语言",
  "config.noTargets": "尚未添加目标语言",
  "config.selectLang": "\u2014 选择语言代码 \u2014",
  "config.add": "添加",
  "config.targetHint": "选择的翻译模型需支持目标语言",
  "config.reset": "恢复默认",
  "config.cancel": "取消",
  "config.save": "保存",

  // Page
  "page.dropHint": "拖放 SRT 文件到此处",

  // Providers
  "provider.google": "Google 翻译",
  "provider.ollama": "Ollama",
  "provider.lmstudio": "LM Studio",
  "provider.openai": "OpenAI",
  "provider.anthropic": "Anthropic",
};

export default zh;
