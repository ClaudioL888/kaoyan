---
name: answer-math-kb
description: Answer Math II concepts, single questions, error diagnoses, and method-comparison queries by reading the lightweight local three-system knowledge base first. End every course-content answer with a concrete summary and archive prompt, and write only after the user approves both summary accuracy and archiving. Answer file, save-status, progress, path, or skill-behavior questions directly without an archive prompt. Use review-math-chapter for bounded multi-question chapter reviews.
---

# Answer Math KB

Use the local study memory as the first retrieval layer for Math II Q&A. Knowledge-base-first means searching for and using relevant stored knowledge before solving; it does not mean forcing every question to match a book problem or reproducing an official method. Keep the answer natural and useful; expose provenance only when the user asks for it.

## Fixed locations

- Knowledge root: `E:\桌面\学习\考研\学习知识库\math2`.
- Source root: `E:\桌面\学习\考研\数二`.
- The archived GitHub repository and old full-coverage outputs are not default knowledge sources.

## Chapter-organization source boundary

- Ordinary single-question Q&A does not trigger a chapter-wide Li Lin 880 scan. If the user asks for a chapter, section, or range organization, route to `review-math-chapter`.
- In that chapter workflow, Li Lin 880 and the frozen 30讲/36讲 examples are processed into per-question source records at the same semantic standard as Zhang Yu 1000 Questions: every choice option and every non-choice subquestion, source/answer evidence, and an independent mathematical check. They remain implicit only in **chat presentation**: the default visible denominator, answer table, detailed solutions, and coverage audit remain Zhang Yu 1000 Questions.
- The chapter workflow stores these records in the local Math II knowledge base following `review-math-chapter/references/internal-lilin880-audit-protocol.md`; legacy Li Lin files under `学习知识库\math2\_internal\lilin880-audits` remain valid. In a later single-question Q&A, search a matching source-question record before rechecking the source. Do not dump the hidden batch into an ordinary answer unless the user asks for those source questions.
- If the user directly asks about one specific Li Lin 880 question, answer that supplied question normally as a single-question request. That does not turn 880 into a visible parallel batch during later chapter organization.

## Course-content boundary

- Trigger the summary and archive prompt for mathematical definitions, theorems, formulas, conditions, single questions, option analysis, derivations, method choices, error diagnosis, traps, and transfer rules.
- Do not trigger it for whether a chapter was saved or completed, file paths and structure, coverage counts, update time, task progress, source availability, knowledge-base management, or skill behavior. Answer those operational questions directly without `待确认` or a save invitation.
- For mixed requests, summarize only the independently reusable mathematics. Never archive file status, workflow status, or configuration text as study knowledge.

## Retrieval workflow

Before retrieval, treat `organization_status: skeleton` as a valid routing target, not as evidence that the chapter has been organized.

1. Classify the request as concept, single question, error diagnosis, method comparison, historical similarity, or new reusable case.
2. Search `catalog.json` and chapter `chapter.json` by title, aliases, keywords, notation, question numbers, and distinctive problem features. Then search the relevant three-system Markdown files before deciding how to solve. Do not skip this search merely because the problem can be solved from general mathematical knowledge.
3. Read the relevant `textbook_knowledge.md`, `question_methods.md`, and `user_weaknesses.md` sections. When the current problem is likely the same as, or materially related to, an accepted archived question or case, search `reviews/` and read the matching section even if the lightweight summary appears sufficient. Do not read or force-match an accepted review when no meaningful match exists.
   - Do not stop at exact-title or exact-question matches. Compare the current item with nearby entries by mathematical object, recognition signal, decisive method, assumptions, boundary, trap, and representative-question role so the later archive route can target the nearest knowledge or method pool.
4. Answer from the retrieved knowledge plus the current problem. Stored knowledge should inform the interpretation, method choice, known traps, and prior conflicts, but it does not lock the answer to the stored or official method. If there is no relevant stored content, solve the supplied problem independently and say nothing that implies a source match. Never imply that a user weakness exists unless it is recorded from real user evidence.
5. If the local memory is missing, stale, or conflicting, say internally what needs checking and re-read the relevant original PDF or official solution. Distinguish stored summary, newly verified source fact, and independent derivation in your reasoning; show that distinction to the user only when useful or requested.

## Accepted-review hit reminder

After retrieval and before the substantive solution, classify the relationship to accepted material. This visible reminder is mandatory when an accepted hit exists; it is not an archive request and never authorizes a write.

- `EXACT_ACCEPTED`: the current item is the same accepted problem or case. Match the source/book and edition when known, chapter/section, basic/advanced part, question number, and the expression, conditions, or option structure. Read the exact matching review section before answering, then begin with one concise notice such as `已命中既有整理：{资料/范围/题号}。本次先以该复盘为底稿，再回答你当前问法。`
- `RELATED_ACCEPTED`: the item is not the same original problem, but an accepted entry has the same transferable object, recognition signal, decisive method, condition boundary, or trap. Read the relevant knowledge/method entry and, when materially useful, its accepted review section. Say `已命中相关整理：{题型/方法/知识点}；不是同一道原题。`
- `DRAFT_OR_SKELETON`: only a routing skeleton, draft, unaccepted Stage A output, or unverified legacy result exists. Never call it `已整理`. Mention `已有路由骨架/待验收草稿，但没有可复用的已接受整理` only when that status helps the user.
- `NO_HIT`: no meaningful accepted match exists. Give no hit notice and solve independently.
- `CONFLICT`: an accepted analysis exists but the current version, statement, assumptions, or derived result conflicts with it. Tell the user that a prior accepted analysis exists but a conflict must be rechecked, then verify the matching source before giving the final judgment.

Do not treat the same question number from another chapter, book, part, or edition as an exact hit. The reminder must not dump the stored answer, imply that the user is weak at the topic, expose an absolute path, or claim that the current exchange has been saved. In the ending merge pre-judgment, an exact hit with no reusable increment is normally `等价` or `无需新增`; a new explanation or boundary is `补充`; a verified disagreement is `冲突`.

## Invisible provenance rule

Except for the mandatory accepted-review hit reminder above, do not write repetitive phrases such as “根据知识库”“在你的本地文件中” or expose file paths/page citations in an ordinary answer. If the user asks “以前是否遇到过这种题型”, “你为什么这样判断”, or requests sources, expand on the matching stored case, differences, and source status.

## Course-content summary and archive workflow

1. Solve the current question first. Do not start by dumping stored notes.
2. Explain the key trigger, method, conditions, trap, and a short transfer boundary.
3. Every course-content answer must end with `本次数学问题归纳（待确认，尚未保存）`, covering the question, mathematical conclusion, recognition signal, method, conditions, transfer boundary, archive type, proposed text, user evidence when applicable, `归并判定（预判）`, and `拟归并目标`. Use one of `等价 / 补充 / 相邻 / 冲突 / 全新 / 无需新增`; if nothing new should be written, do not invent an entry.
4. Ask whether the summary is accurate and whether the user agrees to archive it. The user may reply `归纳准确，确认归入` to satisfy both gates.
5. Do not write unless the user both approves the current summary's accuracy and explicitly agrees to archive it. Accuracy-only, save-only, correction, discussion, or silence is not enough.
6. If the user corrects the summary, display the revised full summary and wait again for both confirmations.
7. After both confirmations, read [knowledge-protocol.md](references/knowledge-protocol.md), recheck the proposed target, execute its five-state merge gate, preserve conflicts, update metadata, validate JSON, re-read the changed sections, and report the actual merge result. If the recheck materially changes the proposed category or target, show a revised full summary and obtain both confirmations again before writing.

## Personal weakness boundary

Use `user_weaknesses.md` only for a user-provided wrong answer, hesitation, repeated question, incorrect method, or explicit self-assessment. A generic textbook trap belongs in textbook knowledge or question methods.

Do not treat a correct conclusion volunteered by the user as proof that the point is mastered or “not a weakness”; it proves only that the current sentence is correct. Infer stability from wording and context:

- confidence plus a correct reason, conditions, and transfer boundary suggests current mastery, but do not persist a negative label such as “not weak” from one exchange;
- hedging, guessing, repeated reassurance, contradiction, “原来/我之前以为”, a correct answer reached only after hints, or inability to explain the reason suggests a candidate weakness;
- if the signal is ambiguous, label it `候选薄弱点（待确认）` in the summary and ask: `这条是你已经掌握后的总结，还是你仍容易混淆、希望记录为薄弱点？`

Never write a candidate weakness to `user_weaknesses.md`. After the user answers, show a revised full summary and obtain the usual accuracy and archive confirmations before writing.

## Answer quality rules

- Do the mathematics independently; do not blindly follow a stored summary or answer key.
- For a likely match to an archived problem, compare the stored conclusion and conditions with the current derivation before answering. An equivalent alternative method is allowed; a mismatch in answer, assumptions, domain, or option judgment requires checking the matching archived analysis and, when necessary, the official source.
- Give the shortest explanation that makes the method and boundary clear; expand for a difficult or repeatedly misunderstood point.
- For choices, analyze every option when the user asks for a full analysis or when a wrong option reveals the key trap.
- If the current problem conflicts with stored knowledge, preserve the old entry and state the current resolution after checking the source.
- Do not launch chapter-wide scans, full-book OCR, subagent pipelines, page-image generation, bbox work, relation graphs, or formal coverage audits.
- Do not save a draft merely because the answer is correct; persistence always requires user confirmation.
- The final block requirement applies only to course-content answers. Operational answers must not imitate it.

## When no local chapter exists

The normal case is now a prebuilt chapter skeleton. Route by `catalog.json` aliases and keywords even when `organization_status` is `skeleton`. A skeleton is only a destination: it is not prior mathematical knowledge and must never be described as an organized or completed chapter.

For a question in a skeleton chapter:

1. Read the current problem and any supplied material first; verify the relevant textbook or official solution when needed, otherwise label the result as an independent derivation.
2. Answer normally instead of refusing because the chapter files are empty.
3. Use the usual concrete summary and dual-confirmation archive gate.
4. After confirmation, append only the accepted increment and increase `confirmed_increment_count`; keep `organization_status: skeleton`.
5. Do not create an accepted chapter review or upgrade the chapter to `organized` from a single question. Only `review-math-chapter` may do that after the complete first-version contract.

If a genuinely in-scope Math II unit is absent from the catalog, verify its source scope and create only skeleton metadata and empty files before routing. Do not prefill course content. If the unit is outside Math II, say so instead of expanding the framework.

## Record time and activity log

Every successful archive must give each logical entry an actual archive timestamp in Asia/Shanghai (China Standard Time, UTC+08:00): show `记录时间：YYYY-MM-DD HH:mm:ss +08:00` in Markdown and store ISO `recorded_at`. Then append one matching JSON object to `E:\桌面\学习\考研\学习知识库\activity_log.jsonl` with subject, chapter, record type, title, reusable summary, source file, question references, and source status. Do not use file modification time as the record time.

Only write the timestamp and activity row after both confirmations and the content write succeed. `无需新增`, `已有等价内容`, rejected summaries, and candidate weaknesses create no activity row. Past-paper year and source publication or verification dates remain separate from the archive timestamp.
