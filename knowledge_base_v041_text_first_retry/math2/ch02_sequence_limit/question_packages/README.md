# 题目包索引

每道题的完整题干、官方解析、答案形态、页级来源、配图声明和题目特定 `ai_review` 以稳定 `question_id` 保存在上级 `questions.jsonl`；本目录 `index.jsonl` 为 23 个独立题目包的页级/答案/状态索引，`canonical_record` 指向完整记录，避免复制产生来源漂移。

题目包状态均已归一化为 `reviewed_page_level`；该状态表示本 lane 已完成原页视觉读取和页级组装，不等同于整章 V0.4.1 验收通过。
