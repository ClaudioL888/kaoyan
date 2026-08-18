# 第3章双 lane 合并报告

状态：merged_pending_sol。本报告只记录机械合并；未执行 Sol high 审计、KaTeX 全量编译或最终 Gate 9，不能据此宣称第3章通过 V0.4.1 验收。

## 合并边界

- 输入仅为磁盘上的 lanes/terra_a_questions 与 lanes/terra_b_textbook。
- 未重新识别任何已完成页面；未导入李林或第2章事实。
- 来源 ID 已统一为四个白名单角色：src.1000q.question、src.1000q.solution、src.textbook、src.example.question。

## 固定分母

| 类别 | 分母 | 页码/范围 |
|---|---:|---|
| 1000题基础题 | 15 | 题面 p14–15；解析 p21–25 |
| 1000题强化题 | 22 | 题面 p69–71；解析 p177–184 |
| 教材例题 | 11 | 例题册真实范围 p40–51 |
| 教材习题 | 9 | 例题册 p46–51；教材官方解答 p122–124 |
| 教材正文 | 20 页 | p105–124 |

例题册 p69–71 已保留为第5章排除证据：source scope 的 excluded_pdf_page_ranges、question staging 三条 out_of_scope_chapter_mismatch 记录及 assets 三条 range_conflict_chapter5 记录均存在。

## 输入与输出计数

| 对象 | A输入 | B输入 | 正式输出 |
|---|---:|---:|---:|
| 1000题题目 | 37 | 0 | 37 |
| 教材习题 | 0 | 9 | 9 |
| 教材例题 | 0 | 11 | 11 |
| questions.jsonl | 37 | 9 | 46 |
| examples.jsonl | 0 | 11 | 11 |
| question_registry.jsonl | 37 | 9 | 57（为11个例题补建页码注册项） |
| page_mappings.jsonl | 74 | 40 | 114 |
| 题面 staging | 5（聚合文件） | 35 | 40 |
| 解析 staging | 13（聚合文件） | 16 | 29 |
| question_packages | 37 | 9 | 46 |
| example_packages | 0 | 11 | 11 |
| 教材核心覆盖 | 0 | 20 | 20 |
| 知识点/公式/结论 | 0/0/0 | 7/13/12 | 7/13/12 |
| 题型/方法/关系 | 0/0/0 | 2/3/20 | 2/3/20 |
| assets_manifest | 0 | 23 | 53（补齐1000题与例题册实际页资产条目） |

## 冲突与处理

1. A 同时保留聚合 staging 与 basic/strong 分片。正式目录仅合并聚合文件，分片是 lane 内重复元数据，未重复写入。
2. B 使用 src.textbook_examples、src.1000q、src.1000s；前者统一为 src.example.question，后两者是未处理的别名 scope，正式目录保留 A 的实际 1000题范围而不重复写入。
3. B 的题目/例题使用 id、number、独立 item_specific_analysis。正式目录保留这些原字段，并补入统一字段 item_id、question_number、question_source_id、solution_source_id、answer_source_mapping_id、requested_outputs 与 ai_review；未改写题面、解析或官方答案文本。
4. B 原有例题没有 registry 行。根据已存在的题面页、解析页和包记录机械生成11条注册项；未添加新的来源事实。

## 机械检查

- JSON/JSONL 全部可解析。
- 57个题目/例题 ID、114个 mapping ID 均唯一；所有 mapping、relation、outline、题型池和方法池引用不断链。
- 所有57项具备题干、解析、来源页、答案、答案来源映射、配图字段和题目特定评述；评述完全重复数为0。
- 37/37 1000题保留 source_page_confirmed 官方答案；教材20项的既有答案来源状态已保留。
- 四个且仅四个 canonical source_id 出现在正式 source scopes；不新增第五份资料。
- 合并校验文件：reports/merge_validation.json。

## 非最终警告与后续门

- 教材覆盖中部分既有 complete 页有正核心计数但没有 captured_entity_ids；此为已有内容级台账一致性警告，未在不重读原页的前提下臆改。
- Sol high 审计、KaTeX 全量编译和主 Agent Gate 9 均未运行。
- 因此正式状态严格为 merged_pending_sol，不是 first_draft_accepted。
