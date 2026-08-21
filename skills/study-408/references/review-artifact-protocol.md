# Stage A 分段交付、拼接归档与前端契约

本协议适用于章节、成组或整套复盘。它只改变长正文的传输和归档方式，不降低完整第一版、覆盖审计、双重确认或来源核验要求。

## 会话分段

- 优先在一次回复中完成；受单次输出长度限制时，允许在同一 Codex 任务中连续分段交付。
- “传输分段”不是安全题量分批，也不是独立 review。模板完整性以全部传输段拼接后的 Stage A 为准。
- 第一段建立稳定 `dossier_id`；后续段必须沿用。每段使用以下边界，正文只放在 BEGIN/END 之间：

```text
[STAGE_A_SEGMENT dossier_id="..." index="1" revision="1" scope="..." status="continues|final"]
[BEGIN_STAGE_A_SEGMENT_BODY]
...本段原始正文...
[END_STAGE_A_SEGMENT_BODY]
```

- 在完整标题、题目、表格或代码块边界处分段；不得截断公式环境、表格行、题面、选项或小问。
- 中间段结束时只能说明下一段起点，并可请用户回复 `继续本章梳理`。这只是继续传输，不是准确性确认或归档授权。
- 最后一段必须标 `status="final"`，列出段序、各段范围、完整模板栏目、显式题目/选项/小问覆盖和未解决缺口，然后才展示待确认归纳并请求双重确认。
- 修订已输出段时，以同一 `index` 输出更高 `revision` 并注明替代原因；旧版本保留为历史证据，最终 manifest 只选择用户实际验收的版本。

## Stage B 拼接门

用户确认准确且同意归档后，先恢复所有被验收段，再进行任何知识提炼：

1. 仅取 BEGIN/END 之间的 assistant `final_answer` 正文；不纳入 commentary、reasoning、工具输出、继续提示或聊天寒暄。
2. 校验 `dossier_id` 一致、`index` 从 1 连续、每段只有一个选中 revision、最后一段为 final，并核对段清单和覆盖审计。
3. 以 UTF-8、LF 换行计算每段 SHA-256。按 index 顺序拼接；段间只加入可识别的归档元数据分隔符，不改写、压缩或重排正文。
4. 本地只保存一个完整 review Markdown，不把传输段分别登记为 accepted reviews。
5. 同目录生成同名 `.review-manifest.json`。若任一段缺失、截断、重复、顺序不明或无法证明属于已验收版本，停止并报告正文缺口；不得用摘要、PDF 重扫或模型重写填空。
6. 拼接完成并校验后，才允许从 assembled Stage A 派生轻量知识条目并更新 catalog/activity log。

推荐使用：

`E:\桌面\学习\考研\学习知识库\tools\assemble_stage_a_review.py`

脚本输入一个草案 manifest 和各段临时 Markdown，只在双重确认字段为 true、段序连续且输出文件不存在时写入 review 与正式 manifest。

## Manifest 最小字段

```json
{
  "schema_version": "1.0",
  "frontend_contract_version": "1.0",
  "review_id": "...",
  "dossier_id": "...",
  "subject": "408.data-structures",
  "unit_id": "...",
  "scope": "...",
  "template_id": "...",
  "template_version": "...",
  "accepted_at": "YYYY-MM-DDTHH:mm:ss+08:00",
  "source_thread_id": "...",
  "user_accuracy_confirmed": true,
  "user_archive_authorized": true,
  "segments": [
    {"sequence": 1, "revision": 1, "scope": "...", "turn_id": "...", "item_id": "...", "path": "..."}
  ]
}
```

正式 manifest 还必须含每段字符数/哈希、assembled 正文哈希、review 相对路径和 `artifact_status: exact-single|exact-assembled`。

## 前端读取

- 前端以 manifest 为复盘真实性和分段来源入口，以 review Markdown 为正文入口。
- 默认可按模板标题建立审阅索引，但“模板视图”只是虚拟映射；“原序正文”必须保持 assembled Stage A 的段序。
- 展示段来源、哈希、验收时间、覆盖审计、缺口与冲突。缺 manifest 的旧 review 只能标为 legacy/unverified，不能自动声称 exact。
- activity log 只登记一个 accepted-review 容器；传输段不分别计数，派生条目继续通过 `derived_record_ids` 语义去重。

## 前端发布门（强制）

- 每份已接受完整 review/addendum 必须以一个 assembled Markdown 和同目录、同 stem 的 `.review-manifest.json` 成对发布；只写正文或只写 manifest 都视为归档失败。
- 使用原子写入：先写 review，后写 manifest；manifest 是前端发布标志。成对文件写完并复读校验前，禁止新增 `accepted_review_refs`、accepted-review 活动记录或完成状态。
- 写入后必须运行 `E:\桌面\学习\考研\学习知识库\tools\validate_frontend_reviews.py`。返回非零、哈希不符、路径越界、段序错误、重复 `review_id` 或替代关系异常时，禁止报告已归档/已完成。
- 已接受成品不可静默覆盖。修订必须生成新的 `review_id` 和成对文件；若新版取代旧版，在新 manifest 写 `supersedes_review_ids` 数组。前端隐藏被替代版本，但原文件仍保留用于追溯。
- 前端运行时由知识库文件监听与 SSE 自动刷新；前端未运行时不构成归档阻塞，下次启动必须从 manifest 重新发现。Skill 不依赖 HTTP 服务存活，但必须满足本地发布门。
