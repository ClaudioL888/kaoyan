# 考研复习工作台

这个仓库同步可复用的复习 Skill、结构化知识库、计划文件、复盘前端，以及此前已建立的 Canonical Schema 工程底座。

## 内容

- `skills/`：数学二、408、英语二、政治及学习汇总 Skill。
- `学习知识库/`：三系统知识库的结构化内容、目录、活动记录和组装后的复盘文档。
- `计划/`：总计划、周计划和日计划来源文件。
- `study-review-studio/`：复盘审阅与计划日历前端及其本地数据服务。
- `src/`、`tests/`、`config/` 等：原有结构化知识库工程与验证代码。

## 前端本地运行

```powershell
cd study-review-studio
npm ci
npm run dev
```

前端默认从仓库根目录的 `学习知识库/` 与 `计划/` 读取数据；新增或修改这些内容后，刷新页面即可看到同步结果。

## 原有结构化工程测试

```powershell
$env:PYTHONPATH = 'src'
python -m unittest discover -s tests -v
```

## 排除范围

课本、真题/题册 PDF、扫描件、图片、OCR 模型、字体、依赖缓存和构建产物不上传。它们仍保留在本地源资料目录中，并由知识库中的来源路径与审阅记录引用。
