---
name: review-math-chapter
description: Review a bounded Math II chapter, section, or question range into a complete study dossier using available sources. End the completed course-content dossier with a concrete acceptance-and-archive summary, and save only after the user approves both its accuracy and archiving. Answer operational questions about files, status, progress, paths, or skill behavior directly without an archive prompt. Use answer-math-kb for ordinary single-question Q&A.
---

# Review Math Chapter

Produce a complete study-first chapter dossier before any organization or persistence. The accepted dossier is the sole content basis for the later organization stage.

## Mandatory two-stage contract

1. **Stage A - complete first-version content:** use the full user template to produce the entire review in chat. A preflight, outline, answer table, partial batch, or proposed knowledge-base increment is not a substitute for this artifact.
2. **Stage B - organize from the accepted content:** begin only after explicit user acceptance. Archive the accepted Stage A body first, then derive the lightweight three-system entries from that body.
3. Never bypass Stage A by scanning PDFs directly into the knowledge base. Never silently rewrite, shorten, or replace the accepted review during Stage B.
4. If a safe-range split is required, each accepted batch must still use the full applicable Stage A structure. After all batches, produce a range-level integrated summary and coverage audit before asking for save confirmation.

Long Stage A content may be delivered as consecutive transport segments in the same Codex task. Transport segmentation does not create separate reviews and does not relax the safe-range rule: use one stable `dossier_id`, explicit segment body markers, continuous segment indexes, and ask for acceptance only after the final segment supplies the complete inventory and coverage audit. Follow [review-artifact-protocol.md](references/review-artifact-protocol.md).

### Stage B artifact-integrity gate

Before writing, recover the exact accepted Stage A body from the current task or an explicit accepted artifact. When it was delivered in transport segments, restore the selected revisions and assemble them in index order before deriving anything. Archive that body without paraphrasing, compression, reordered sections, or regenerated question wording; an archival metadata header and a Stage B execution footer may wrap it. Verify every segment and the assembled body by normalized hash or exact line/content comparison, and create the adjacent review manifest required by [review-artifact-protocol.md](references/review-artifact-protocol.md). If the exact body is unavailable, stop with a storage-gap report: do not reconstruct a summary and label it an accepted complete review.

## Fixed locations

- Use `E:\桌面\学习\考研\数二` as the default source directory.
- Mandatory Zhang Yu foundation sources:
  - Calculus foundation text: `E:\桌面\学习\考研\数二\27张宇基础30讲（高数）_新书签.pdf`.
  - Linear-algebra foundation text: `E:\桌面\学习\考研\数二\27张宇基础30讲线代_新书签.pdf`.
  - Calculus worked-example collection: `E:\桌面\学习\考研\数二\张宇30讲高数例题.pdf`.
  - Linear-algebra worked-example collection: `E:\桌面\学习\考研\数二\张宇30讲线代例题.pdf`.
- Mandatory Zhang Yu strengthening source directory: `E:\桌面\学习\考研\数二\27张宇强化36讲PDF`.
  - Calculus reviews must include the relevant scope from `27张宇《高数18讲》强化.pdf`.
  - Linear-algebra reviews must include the relevant scope from `27张宇《线代9讲》强化.pdf`.
  - `27张宇《概率9讲》强化.pdf` is outside Math II and must never enter a Math II review, denominator, or knowledge-base entry.
- Mandatory Li Lin 880 implicit-support lane:
  - Calculus question carrier: `E:\桌面\学习\考研\数二\880\【横版】李林880数二高数篇做题本.pdf`.
  - Linear-algebra question carrier: `E:\桌面\学习\考研\数二\880\【横版】李林880数二线代篇做题本.pdf`.
  - Answer/analysis source: `E:\桌面\学习\考研\数二\880\【PDF】27版880参考答案.pdf`.
  - A4紧凑版、留白版和基础/强化重排版是重复题面载体；默认只选一个可读版本，不把版式副本当作额外证据或额外题量。
- Use `E:\桌面\学习\考研\学习知识库\math2` as the only knowledge-base root.
- Do not use the archived GitHub knowledge base or any legacy local knowledge-base output as a source of mathematical facts.

## Unified type pool before detailed solutions

For the default chapter-review workflow, first register every explicit exercise in the Zhang Yu 1000 Questions foundation/strengthening range named by the user. Zhang Yu 1000 Questions remains the only default visible exercise denominator, answer table, detailed-solution set, and coverage-audit set. Another exercise book becomes explicit only when the user separately asks to display and review that book; Li Lin 880 remains implicit under the rule below even though it is itself a question book.

Assign every explicit exercise exactly one primary type and any useful secondary tags. Classify by decisive structure and method rather than wording alone. For every type, first output its recognition signals, core model, preferred method, conditions, common variations, traps, difficulty progression, and all representative explicit question references. Then explain the explicit exercises in their original source and question order. End with a coverage audit proving that every registered exercise has a primary type and a full solution.

Textbook examples, Zhang Yu foundation 30 Lectures and its worked-example collections, applicable strengthening 36 Lectures examples, and Li Lin 880 form **implicit source-question lanes**. Freeze the chapter-relevant range for each lane and create one durable per-question knowledge-base record for every processed item: choices require every option; non-choices require every subquestion; the record must retain source/answer evidence, an independent check, status, and the shared type-pool link. Li Lin 880 is always full-coverage for its frozen range, never representative sampling. The only difference from Zhang Yu 1000 is presentation: Zhang Yu 1000 is the default chat-visible denominator, answer table, detailed-solution set, and coverage audit; 30/36 examples and Li Lin records are not printed item-by-item in the normal chat dossier and never enter that denominator. They remain queryable in the local knowledge base and frontend source-question library, without creating a separate accepted-review card. An unreadable, unmatched, or conflicting item is a source gap, never a reason to substitute a sample.

## Prebuilt chapter skeletons

`math2/catalog.json` contains all current Math II calculus and linear-algebra units as routing skeletons. `organization_status: skeleton` means only that the directory exists; it does not supply facts and must not be reported as an organized chapter. Use the skeleton path for Stage A scope and later Stage B storage, but derive Stage A only from the actual source set and the user's current material.

A bounded single-question request belongs to `answer-math-kb`; it may add a confirmed increment while leaving the chapter a skeleton. Upgrade a chapter to `organized` only after this Skill has produced the complete first-version dossier, the user has accepted its accuracy and archiving, the accepted body has been stored, and coverage checks pass. A partial batch or isolated increment cannot upgrade status.

## Required input

Require a bounded range: a chapter, section, or continuous question-number interval. Accept optional source paths, focus points, and user-provided mistakes or questions.

If the range is absent and cannot be inferred unambiguously from the current conversation, ask for it before reading whole books.

## Course-content boundary

- A requested chapter, section, question range, mathematical correction, or method-level review is course content and must end with the confirmation block below.
- Save-status checks, file paths, coverage counts, update times, source availability, progress reports, knowledge-base management, and skill rules are operational. Answer them directly without `待确认` or a save invitation.
- For mixed requests, only the reusable mathematics and accepted dossier scope enter the summary; operational status must not be archived as mathematical knowledge.

## Load detailed references

- Read [portable-prompt.md](references/portable-prompt.md) completely before producing a chapter review. It contains the user's complete original structure and is the canonical Stage A output contract. Do not replace it with a shorter house outline.
- Read [zhangyu-36-source-protocol.md](references/zhangyu-36-source-protocol.md) completely for every Math II chapter review. Despite the legacy filename, it governs the foundation 30 Lectures, strengthening 36 Lectures, and Li Lin 880 implicit-support lanes; none may be silently omitted.
- Read [internal-lilin880-audit-protocol.md](references/internal-lilin880-audit-protocol.md) completely whenever any 30讲、36讲 or Li Lin source question/example is used, repaired, or inspected. Despite its legacy filename, it governs durable source-question records, their chat visibility boundary, and the completion gate.
- Read [review-artifact-protocol.md](references/review-artifact-protocol.md) completely whenever Stage A must be delivered in multiple responses, when archiving any complete review, or when inspecting/recovering an old review for frontend use.
- Read [storage-protocol.md](references/storage-protocol.md) completely only when the user explicitly confirms saving, or when inspecting/updating an existing chapter folder.

## Workflow

1. Before source preflight, compare the requested chapter/section/question range with `accepted_review_refs`, chapter status, and the actual accepted review files.
   - `FULL_ACCEPTED_OVERLAP`: for a complete accepted overlap, tell the user concisely that the range already has an accepted organization, read that accepted review, and use it as the baseline. If the user still requests a fresh re-review, proceed, but do not describe the result as newly organized or newly saved before confirmation.
   - `PARTIAL_ACCEPTED_OVERLAP`: state which exact subrange is already accepted and which subrange is new, then read the overlapping review before production.
   - `DRAFT_OR_SKELETON`: a skeleton, draft, unaccepted Stage A output, or legacy status without an accepted review is not `已整理` and must not trigger an accepted-hit claim.
   - `NO_HIT`: when no accepted range overlaps, give no hit notice and continue with the normal source preflight.
   - `CONFLICT`: treat a version/source/range conflict as a conflict to verify, not as an exact hit. The overlap notice is provenance only and never authorizes a write.
2. Discover only the actually available textbook, Zhang Yu foundation 30 Lectures text and worked-example collection, applicable strengthening 36 Lectures text, Zhang Yu 1000 Questions question book and official solution, the corresponding Li Lin 880 subject book and reference answer, and user-supplied files. Prefer user-named files; otherwise search the default source directory. The applicable foundation, strengthening, and 880 lanes are mandatory for chapter organization: if one is missing, damaged, or its relevant scope cannot be verified, report that source gap instead of silently claiming it was used.
3. Preflight the requested range before full analysis:
   - identify source roles and obvious duplicates;
   - establish printed-page/PDF-page correspondence when it can be verified;
   - locate the corresponding foundation 30 Lectures and strengthening 36 Lectures scopes and freeze their printed/PDF page ranges by visual verification;
    - freeze the chapter-relevant example/question ranges for 30 Lectures, 36 Lectures, and Li Lin 880; process every used item into durable source-question records (all options/subquestions, source comparison, independent check, and type-pool link), without listing them as the chat-visible question denominator;
    - select one canonical Li Lin 880 question carrier and freeze its complete topic-mapped range plus corresponding answer range; complete its full-item audit and manifest with the same record standard;
   - count only the user-specified Zhang Yu 1000 Questions range as the default problem/subquestion denominator; another book counts only after a separate explicit request to display that book, while 880 remains excluded from the visible denominator under this rule;
   - note missing pages, missing sources, version differences, or damaged options.
4. Enforce the safe range of at most 25 numbered questions and 35 subquestions only on the explicit Zhang Yu 1000 exercise denominator. If it is exceeded, propose contiguous question-range splits and wait for the user to select a smaller range. A narrow exception applies to a classification-only follow-up over an already accepted range: every explicit item must already have a directly retrievable complete accepted solution, and the follow-up may only register, type, audit, and link those solutions without reproducing or re-solving them. If even one accepted solution is missing or cannot be directly located, the exception is invalid and the missing detailed content must be restored or regenerated in safe contiguous batches and newly accepted. Textbook/Zhang Yu worked examples and all implicitly processed Li Lin 880 items do not consume this quota and must not be turned into a parallel visible exercise batch. This exemption affects only the user-visible Zhang Yu range: it never permits sampling the 880 range, which must be fully audited internally before an 880-enhanced dossier can be declared complete.
5. Read relevant textbook, foundation 30 Lectures, strengthening 36 Lectures knowledge blocks, worked examples, and in-book solutions; complete the frozen implicit source-question records before synthesizing them into the same type pool. Synthesize reusable methods, conditions, traps, variations, and transfer rules into one chapter explanation. Do not reproduce, enumerate, solve visibly, answer-table, or coverage-audit the implicit sources in chat. Every Zhang Yu 1000 question, option, and subquestion in the specified range remains explicit and must be typed and fully covered. Do not expand to another chapter or to Probability 9 Lectures.
6. Quote only short, verified textbook passages for definitions, cautions, corollaries, or direct solving grounds. Record both printed page and PDF reader page when verified. Mark all unverified wording as summary or derivation; never put it in quotation marks.
7. Independently solve and check the mathematics. When sources conflict, list each position, the independent derivation, and the adopted result with reasons.
8. Produce the complete Stage A review in chat using all applicable sections one through seventeen of the canonical template. Preserve headings for inapplicable sections and explain why they do not apply. Prefer one response; if transport segmentation is necessary, follow the artifact protocol and continue from the exact next heading without repeating or shortening earlier sections.
9. End with `本次数学章节归纳（待确认，尚未保存）`, naming the accepted range, coverage, core conclusions, principal methods, conflicts/gaps, mastery assessment for any user-volunteered conclusions, and proposed additions to textbook knowledge, question methods, and user weaknesses. For each derived logical item also give `归并判定（预判）` and `拟归并目标`; use `等价 / 补充 / 相邻 / 冲突 / 全新 / 无需新增`. If no addition is needed, state that explicitly.
10. Ask whether this summary accurately represents the complete Stage A dossier and whether the user agrees to archive it. For segmented delivery, ask only after the final segment and segment/coverage inventory. Suggest `归纳准确，确认归入` as a combined reply.
11. Treat `阶段一内容产出完成` as `待用户验收`, not as organized or saved. A correction requires a revised full summary and a new accuracy confirmation.
12. Do not write any knowledge-base file until the user both approves the current summary/dossier accuracy and explicitly agrees to archiving. Accuracy-only or save-only is insufficient.
13. After both confirmations, assemble all accepted Stage A segments into one review Markdown and its `.review-manifest.json`, verify the segment and assembled hashes, then apply the five-state merge gate in [storage-protocol.md](references/storage-protocol.md) to every derived logical item before updating the three systems. Recheck the proposed target; a material target/category change requires a revised summary and new dual confirmation. Then update metadata, validate every edited JSON file, re-read outputs, and pass the frontend publication gate in [review-artifact-protocol.md](references/review-artifact-protocol.md). Only then report `本章知识库已完成`.

## Cost and scope guardrails

- Use one content-producing agent. Do not create subagent pipelines.
- Do not run whole-book OCR, bulk-generate permanent page-image evidence, create bounding boxes, build relation graphs, batch-compile KaTeX, run a second-model audit, or recreate global coverage gates. Required source-question records for 30/36/Li Lin are the narrow exception to ordinary no-atomization guidance; keep them as a searchable local knowledge-base lane, not a graph, a chat transcript, or a separate accepted-review card. Use only targeted temporary rendering of relevant pages for navigation and visual verification.
- Do not continue in the background after the requested range is complete.
- Treat source PDFs as the authority and saved Markdown as revisable study memory.

## Personal weakness boundary

Write to `user_weaknesses.md` only when the user supplied a wrong answer, hesitation, repeated question, incorrect method, or explicit self-assessment. Keep general traps in `textbook_knowledge.md` or `question_methods.md`.

A correct conclusion volunteered by the user does not prove stable mastery and must not be recorded as “not a weakness.” Use the user's wording and surrounding work: confident reasoning with conditions and transfer supports a temporary mastery signal; hedging, guessing, self-correction, repeated confirmation, contradiction, hint-dependence, or inability to explain supports only `候选薄弱点（待确认）`. If ambiguous, ask whether the statement is an already-mastered summary or a still-unstable point the user wants recorded. Never persist a candidate; after clarification, revise the dossier summary and obtain both accuracy and archive confirmation again.

## Save confirmation boundary

If the user confirms saving but the accepted review is not present in the current conversation, request the review text or file. Do not reconstruct a missing accepted answer from memory.

The confirmation block is mandatory only for course-content dossiers. Operational answers must not append it.

## Record time and activity log

After an accepted dossier is successfully archived, timestamp the review and every newly derived logical knowledge/method/weakness entry with the actual Asia/Shanghai (China Standard Time, UTC+08:00) archive time (`记录时间` in Markdown and ISO `recorded_at` in metadata). Append corresponding rows to `E:\桌面\学习\考研\学习知识库\activity_log.jsonl`; include the review scope, question ranges, source status, and target files. Deduplicate semantic child entries so a periodic report does not count the review container and the same derived point as two new knowledge points.

Create one accepted-review container row for every archived complete review or accepted addendum and link its actual derived activity rows through `derived_record_ids` (an empty array is allowed). Every derived Markdown logical item must carry its own full timestamp, not only a date in its heading.

No timestamped activity row is created before both confirmations or for unchanged/deduplicated content. Source publication dates and question years must remain distinct from the archive time.
