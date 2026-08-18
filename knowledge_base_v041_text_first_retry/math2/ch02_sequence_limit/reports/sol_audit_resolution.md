# Sol 审计历史非 pass 项闭环证据

Sol 原始台账 reports/sol_audit.jsonl 保持为历史审计记录，其中 37 条 needs_correction 和 1 条 error 不被重写。本表记录主 Agent 对当前文件的复验结果。

- q.c02.advanced.003：questions.jsonl 的 question_figure_presence=false，solution_figure_presence=true；解析 p173 的 y=xe^x 图已视觉复核。
- ex.ch02.2.5：examples.jsonl 与 example_packages/ex_ch02_2_5.json 的官方答案均为“最大值为2，最小值为1/2，选A”。
- ex.ch02.2.13、ex.ch02.2.14、ex.ch02.2.15：solution_figure_presence=true；例2.13 解析映射为 p96-p97，例2.14 为 p97-p98，例2.15 为 p99-p100；p97-p100 图示已视觉复核。
- textbook_core_page.82：章节入口改为普通教材入口，不再把总览写作教材结论。
- textbook_core_page.83、84、87、88、89、90、91、92、93、94、95、96、98、102：各页 captured_entity_ids 已指向当前核心实体；逐页状态 complete，实体引用复验无断链。
- f.arithmetic.general、f.arithmetic.sum、f.geometric.general、f.geometric.sum、f.sum.k、f.sum.k2、f.sum.telescoping、f.limit.definition、f.abs_limit、f.limit.operations、f.squeeze、f.squeeze.sum_bounds、f.contraction、f.speed_ratio、f.common_ineq、f.trig_small：35/35 公式记录均有 applicability_conditions，且本轮严格 KaTeX 通过。
- page_mappings.cross_page_flags：所有多页映射均写有 cross_page=true、starts_on_page 和 continuation_of。
- source_id.consistency：chapter.json、source_scopes.jsonl、正式记录与暂存中的唯一 source_id 集合为四份白名单 ID。

本轮当前文件复验：Sol 台账 90 行、历史 unresolved 0、上述 38 条历史非 pass 项均已闭环，无保留错误。
