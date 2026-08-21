# 砺学 · 复习观测台

面向本地考研计划和轻量知识库的只读前端。它直接读取上一级工作区中的 `计划` 与 `学习知识库`，把计划基线、确认归档、章节状态和完整复盘正文放在同一处审阅。

## 运行

```powershell
npm install
npm run dev
```

打开 `http://127.0.0.1:4173`。生产模式可使用：

```powershell
npm run build
npm start
```

## 数据约定

- 计划文件：`../计划/**/*.md`
- 知识库目录：`../学习知识库`
- 复盘正文：由 `*.review-manifest.json` 的 `assembled_file` 指向
- 活动记录：`../学习知识库/activity_log.jsonl`
- 章节状态：各科 `catalog.json`；`skeleton` 只表示可路由骨架，不计为已整理

服务端只读取这些文件。文件变化由监听器通过 SSE 推送到浏览器，页面随后重新读取完整快照；分段生成记录不会替代本地已经拼接并通过 manifest 校验的正文。

## 校验

```powershell
npm test
npm run build
```
