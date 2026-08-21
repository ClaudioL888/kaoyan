# 第2章“数列极限”核心修复报告

## 状态

- 修复阶段状态：audit_failed_needs_correction；随后 Gate 9 已完成并将当前章节状态更新为 first_draft_accepted。
- 本轮完成了 Sol 审计所列的教材核心修正及其本地机械复验；没有重新生成 23 道 1000 题，也没有调用 Sol。
- 本报告是核心修复阶段报告；最终验收结论以同目录 acceptance_report.md 为准。

## 事实来源与页面复核

- 审计清单来源：reports/sol_audit_summary.md；其条目仅用于定位，不作为教材事实。
- 唯一教材事实来源：数二/27张宇基础30讲（高数）_新书签.pdf。
- 已依据先前已保存的渲染图继续复核、未重新渲染的 PDF 页：p83、p84、p87-p94、p96、p102，共 12 页。
- 涉及教材逐页覆盖台账：p82-p104，共 23/23 页，均为 page_checked=true 且 status=complete。

## 新增与修改

- 新增教材核心实体：12 条（5 条结论、7 条注意事项）。
- 重写教材定义：1 条（p83 数列定义，补全一般项/通项文字）。
- 新增公式：11 条；正式公式总数由 24 条增至 35 条。
- 修改既有公式 KaTeX 表达：8 条，移除会使严格 KaTeX 编译失败的 Unicode 根号、中文标点和非 LaTeX 箭头。
- 覆盖的遗漏页包括：p83 子列/整体函数；p84 等差等比、单调有界及等比和条件；p87 绝对值逆命题和子列逆命题；p88-p89 保号性、四则与存在性组合；p90 海涅三种取法；p91 放缩和一阶等价；p92-p93 常用不等式、压缩映射；p94 根式分段结论；p96 单调性 c/d/e；p102 反例与“做与不做几乎无异”注意。
- 修复例题 ex.ch02.2.5 的汇总和例题包：最大值为 2，最小值为 1/2，选 A。
- 保留强化题 q.c02.advanced.003 的 question_figure_presence=false。

## 来源 ID 一致性

- chapter.json、source_scopes.jsonl 与根目录记录统一使用四个白名单来源 ID：
  src.math2.textbook_ch02、src.math2.textbook_examples_ch02、src.math2.1000_questions、src.math2.1000_solutions。
- 根目录 JSONL 中未发现第五个来源 ID。

## 写后机械验证

- 根目录 13 个正式 JSONL 文件：全部可解析。
- 各正式 JSONL 的稳定 ID：无重复。
- textbook_core_coverage.jsonl：23 行，p82-p104 无缺页，捕获实体 ID 无断链。
- formulas.jsonl：35/35 含非空 applicability_conditions。
- KaTeX：使用本地缓存的 KaTeX 11.6.2 严格编译 35/35，失败 0。
- JSON 包文件：question_packages 30 个、example_packages 18 个，全部可解析。

## 修复阶段遗留项与后续结论

- 教材核心修正范围内没有因页面不可读而保留的 needs_review 项。
- 修复阶段结束时尚未执行完整 Gate 9；后续主 Agent 已完成题面/解析字段、联合题包分母、关系反向索引、重复评述、Sol 台账和 KaTeX 的全量重验。
- examples.jsonl 的 25 条已由 18 个 example_packages 与 7 个 question_packages 联合逐项覆盖，分母差异已闭环。
- 当前最终状态及全部 Gate 9 证据见 acceptance_report.md。
