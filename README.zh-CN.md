# Qwen SRT Translate

基于 Next.js 的字幕翻译工具，通过本地 **Ollama** 或 **LM Studio** 调用大模型翻译 `.srt` 字幕文件。支持 8 种目标语言、多语言页签、在线编辑、多格式导出（SRT / VTT / ASS / JSON）。

## 功能特性

- **本地优先** — 所有翻译通过本地 LLM 服务器完成，无需云 API 密钥
- **上下文感知** — 翻译时将完整原文字幕作为上下文发送给模型，让模型先理解剧情、人物和术语
- **8 种目标语言** — 繁体中文、日语、韩语、西班牙语、法语、德语、葡萄牙语、俄语
- **多语言页签** — 各语言翻译可在标签页之间自由切换
- **在线编辑** — 双击任意单元格即可编辑时间轴、原文或译文
- **行操作** — 支持上移/下移、拆分、向上合并译文行
- **多格式导出** — 支持按语言导出 SRT / VTT / ASS / JSON，或一次性打包为 ZIP
- **Google 翻译备用** — 内置免费 Google 翻译，无需本地 LLM 即可快速翻译
- **Docker 部署** — 提供开箱即用的 Dockerfile 和 docker-compose.yml

## 截图

<!-- TODO: 添加截图 -->

## 前置条件

任选其一（或两者都装）：

- **[Ollama](https://ollama.com)** — 本地运行大模型。默认地址：`http://localhost:11434`
- **[LM Studio](https://lmstudio.ai)** — 加载模型后开启 Local Server（OpenAI 兼容 API）。默认地址：`http://localhost:1234/v1`

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 使用方式

1. 点击 **加载 SRT** 或将 `.srt` 文件拖拽到页面上
2. 在侧边栏选择 **Provider**（Ollama / LM Studio / Google 翻译）
3. 如使用 Ollama 或 LM Studio，点击 **Refresh Models** 刷新模型列表并选择模型
4. 选择 **Target Language** 标签页，点击 **翻译选中**（或 **全部翻译** 一次性翻译 8 种语言）
5. 审阅并在表格中直接编辑译文，完成后选择格式 **导出**

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OLLAMA_BASE` | `http://localhost:11434` | Ollama API 地址 |
| `LM_STUDIO_BASE` | `http://localhost:1234/v1` | LM Studio OpenAI 兼容 API 根路径 |

## Docker 部署

```bash
# 使用 Docker Compose 构建并运行
docker compose up -d --build
```

应用运行在 [http://localhost:3000](http://localhost:3000)。容器已配置通过 `host.docker.internal` 连接宿主机的 Ollama / LM Studio。

## 开发

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 生产构建
npm run build
npm start
```

## 技术栈

- [Next.js](https://nextjs.org) 16（App Router）
- [React](https://react.dev) 19
- [Zustand](https://zustand-demo.pmnd.rs) 状态管理
- [Vercel AI SDK](https://sdk.vercel.ai) LLM 集成
- [Tailwind CSS](https://tailwindcss.com) 4

## 参与贡献

欢迎贡献代码！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南。

## 许可证

[MIT](./LICENSE)
