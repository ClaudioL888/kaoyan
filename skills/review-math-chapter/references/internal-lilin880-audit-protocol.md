# 隐式题源逐题知识库协议

本协议适用于数学二章节整理中实际处理的张宇30讲例题、36讲例题/练习和李林880。它要求保存完整逐题知识库证据，不改变用户可见的张宇1000题显式范围。文件名保留仅为兼容既有李林880档案。

## 存放与可见性

- 新记录存于 `E:\桌面\学习\考研\学习知识库\math2\source-question-records`；既有 `E:\桌面\学习\考研\学习知识库\math2\_internal\lilin880-audits` 无需迁移，视为兼容记录源。
- 每次完整章节或补充处理创建稳定 `audit_id` 目录，含 `manifest.json`、一个或多个 `*.audit.jsonl` 和可选 `README.md`。
- 每条记录必须声明 `source_family`（`zhangyu-30`、`zhangyu-36` 或 `lilin880`）与 `chat_visibility: hidden-by-default`。记录可被后续数学问答、章节整理和前端“题源逐题库”读取，用于检索已核验相似题、来源冲突与方法边界；默认不在聊天或 accepted-review 正文中逐题展示。
- 用户明确要求查看某一题源例题时，才在会话显示所需范围；它仍不得混入张宇1000题分母或另起复盘卡。

## 每题不可省略字段

每条 JSONL 对应一个原书编号题，至少含：

- `audit_id`、`chapter_id`、`source_family`、`source_section`、`source_pdf_pages`、`item_ref`、`item_kind`、`chat_visibility`；
- 可靠的 `prompt` 或题面摘要、题型/主题标签及共享题型池关联；
- 选择题的每个选项原文或可辨识摘要、逐项正误、理由和正式答案；
- 非选择题的每个小问、正式答案/解析要点、独立推导/检查和结论；
- `official_answer_source_pages`、`source_status`、`verification_status`、`reviewed_at` 和 `reviewed_by`。

题面模糊、题面与答案错位、版本不一致或独立推导与参考答案冲突时，不得补猜；创建真实的 `source-gap` 或 `conflict` 记录。

## 完整性门

- `manifest.json` 必须冻结来源版本、题目与答案页段、选择题选项/非选择题小问核验规则、私有总量、记录文件及完成状态。
- 只有每个冻结题均有一条记录，且每个选项/小问均有状态，才能标记 `verification_status: complete`。
- 用户可见的“已完成某题源范围逐题处理”必须可由该 manifest 与 JSONL 复读证明；旧 review 若没有所需记录，只能标为 `record-repair-in-progress`，直至补齐。
- 逐题库本身不是新的用户薄弱点证据，也不单独生成公共活动日志行；只有它提炼出的可迁移新方法，才按五态归并登记。
