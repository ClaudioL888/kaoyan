---
name: summarize-study-kb-updates
description: Summarize confirmed additions to the local Math II, 408, English II, and Politics knowledge bases for the previous day, previous 7 days, or previous 14 days. Use for daily, weekly, biweekly, yesterday, last-week, or last-two-weeks study knowledge reports, including scheduled runs. This is a read-only operational report and must not trigger an archive prompt.
---

# Summarize Study KB Updates

Produce time-bounded, subject-grouped reports from the confirmed knowledge-base activity log. Do not infer additions from file modification times.

## Fixed locations

- Knowledge root: `E:\桌面\学习\考研\学习知识库`.
- Activity log: `E:\桌面\学习\考研\学习知识库\activity_log.jsonl`.
- Collector: `E:\桌面\学习\考研\学习知识库\tools\collect_periodic_updates.py`.
- Reports: `E:\桌面\学习\考研\学习知识库\periodic-reports\daily|weekly|biweekly`.

## Window selection

- Daily or “前一天/昨天”: previous complete natural day, `[run date - 1 day 00:00, run date 00:00)`.
- Weekly or “前一周/过去一周”: previous complete 7 natural days, `[run date - 7 days 00:00, run date 00:00)`.
- Biweekly or “前两周”: previous complete 14 natural days, `[run date - 14 days 00:00, run date 00:00)`.
- Use Asia/Shanghai (China Standard Time, UTC+08:00), with a left-closed/right-open interval.

Run the collector with `--days 1`, `7`, or `14`. Optionally pass `--as-of YYYY-MM-DD` for a historical report. Parse every JSONL line independently. If a row is malformed or its `source_file` is missing, retain it under “数据缺口” instead of silently dropping it.

## Report content

Use this fixed subject order:

1. 数学二.
2. 408, subdivided into 数据结构、计算机组成原理、操作系统、计算机网络.
3. 英语二.
4. 政治.

For every subject show the number of new logical records and then each addition's archive time, chapter/module, title, core conclusion, method or condition boundary, source status, and linked question or range. Semantically collapse duplicate review-container and derived-entry rows; do not double-count the same knowledge point merely because it appears in two files.

When a stored question reference exists, open the referenced knowledge file and provide a detailed study example:

- year/book/chapter and question number or range;
- concise problem summary, not an invented or reconstructed verbatim question;
- recognition signal and decisive steps;
- wrong-answer trap or boundary;
- one transfer variation or next-time action.

Never fabricate a question from a generic rule. If no question is linked, state `暂无已记录关联题目` and explain the concept directly. Preserve the distinction between source year/date, verification date, and archive time. Mark `time_status: backfilled-existing` as “既有内容按用户指示回填日期”, not as evidence that the user learned it on that date.

If a subject has no additions, write `无新增` rather than omitting it.

## Long reports

If there are more than 12 logical records or the detailed examples would make the chat response unwieldy, write the complete Markdown report to the appropriate report directory with a stable filename:

- `daily/YYYY-MM-DD_previous-day.md`
- `weekly/YYYY-MM-DD_previous-7-days.md`
- `biweekly/YYYY-MM-DD_previous-14-days.md`

In chat, return the exact window, per-subject counts, 3-6 highest-value points, data gaps, and a clickable absolute file path. Do not truncate the file body.

## Boundaries

- This report is read-only: do not modify course entries, mastery status, weaknesses, catalogs, or activity rows.
- Do not ask whether the report should be archived; it is an operational summary.
- Do not treat an empty skeleton, metadata-only change, rule file, or skill edit as a new knowledge point.
- If the activity log is absent, report that the time-index is unavailable; do not fall back to filesystem timestamps.
