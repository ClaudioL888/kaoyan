# 考研资料知识库（Phase 1）

这是“考研资料结构化与可增长知识系统”的第一阶段工程底座。

当前已实现的范围：

- 版本化的 Canonical Schema；
- 稳定 ID 与内容哈希规则；
- 原始 PDF、页面图像、裁切资产与页面区域的引用链；
- Parser Adapter 契约；
- 可验证的最小资料登记流程与单元测试。

当前不做批量 OCR、向量检索、知识图谱或 Agent。解析器的输出必须先转换为内部 Schema，不能被下游直接依赖。

## 三层数据原则

1. **原始层**：`SourceVersion`、原始 PDF 与从 PDF 提取/渲染得到的页面资产均不可修改。
2. **观测层**：`ParseRun`、`BlockObservation`、OCR 文本与 LaTeX 候选都属于某次模型运行的结果，可重跑、可并存。
3. **稳定层**：`Block`、`Question`、`Solution` 等长期实体引用观测层；人工修订创建新 revision，不覆盖原结果。

## 坐标与资产引用

`SourceAnchor` 必须同时包含 `page_id`、`rendition_id` 与像素坐标 `bbox`。像素坐标采用左上角为原点的 `[x0, y0, x1, y1]`，因此绝不会把不同 DPI、裁切或去倾斜版本的坐标混用。

`ContentAsset` 保存相对存储路径和 SHA-256；业务对象仅保存 `asset_id`，不保存裸 `image_path`。公式/图片裁切资产会记录父资产及裁切参数，可重新生成并核验。

## 运行测试

使用已配置的 Python 运行：

```powershell
$env:PYTHONPATH = 'src'
& 'C:\Users\ClaudioL\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest discover -s tests -v
```
