# Qwen SRT Translate

基于 Next.js 的字幕翻译工具，支持通过本地 **Ollama** 或 **LM Studio** 调用大模型进行翻译。

## 前置条件

任选其一（或两者都装）：

- **Ollama**：默认 `http://localhost:11434`
- **LM Studio**：在 LM Studio 中加载模型并开启 Local Server（OpenAI 兼容 API），默认 `http://localhost:1234/v1`

## 环境变量（可选）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OLLAMA_BASE` | `http://localhost:11434` | Ollama API 地址 |
| `LM_STUDIO_BASE` | `http://localhost:1234/v1` | LM Studio OpenAI 兼容 API 根路径 |

## 使用 LM Studio

1. 在 LM Studio 中下载并加载模型
2. 打开 **Local Server**，确认端口（默认 1234）
3. 启动本应用：`npm run dev`
4. 在侧边栏 **Provider** 选择 **LM Studio**，点击 **Refresh models** 选择模型后翻译

## 目标语言

侧边栏 **Target Language** 可选择多种目标语言（中文简/繁、英语、日语、韩语、西法德葡俄等）。选择后会自动生成对应的系统提示词；手动编辑提示词将切换为 **Custom** 模式。

翻译时会将**完整原文字幕**作为上下文发给模型，让其先理解整体情节、人物与术语，再翻译当前选中的句子。

## 开发

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build
npm test
```
