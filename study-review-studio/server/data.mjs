import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export const WORKSPACE_ROOT = path.resolve(process.env.STUDY_ROOT || path.join(process.cwd(), '..'))
export const KB_ROOT = path.join(WORKSPACE_ROOT, '学习知识库')
export const PLAN_ROOT = path.join(WORKSPACE_ROOT, '计划')

const subjectMeta = {
  math2: { label: '数学二', short: '数二', color: '#b55b3d' },
  '408.data-structures': { label: '408 · 数据结构', short: '数据结构', color: '#2f6f68' },
  '408.computer-organization': { label: '408 · 计算机组成原理', short: '计组', color: '#426c91' },
  '408.operating-systems': { label: '408 · 操作系统', short: '操作系统', color: '#6f5a87' },
  '408.computer-networks': { label: '408 · 计算机网络', short: '计网', color: '#567547' },
  english2: { label: '英语二', short: '英语二', color: '#9a6b2f' },
  politics: { label: '政治', short: '政治', color: '#8f4b56' },
}

const knowledgeSystems = {
  math2: [
    { key: 'knowledge', title: '教材核心知识', file: 'textbook_knowledge.md' },
    { key: 'methods', title: '题型与方法', file: 'question_methods.md' },
    { key: 'weaknesses', title: '个人真实薄弱点', file: 'user_weaknesses.md' },
  ],
  '408': [
    { key: 'knowledge', title: '教材核心知识', file: 'textbook_knowledge.md' },
    { key: 'methods', title: '题型与方法', file: 'question_methods.md' },
    { key: 'weaknesses', title: '个人真实薄弱点', file: 'user_weaknesses.md' },
  ],
  english2: [
    { key: 'knowledge', title: '语言证据与知识', file: 'evidence_and_language.md' },
    { key: 'methods', title: '答题方法', file: 'answer_methods.md' },
    { key: 'rules', title: '全局稳定规则', file: 'stable_rules.md', root: true },
    { key: 'weaknesses', title: '个人真实薄弱点', file: 'user_weaknesses.md' },
  ],
  politics: [
    { key: 'knowledge', title: '知识卡', file: 'knowledge_cards.md' },
    { key: 'boundaries', title: '概念边界', file: 'concept_boundaries.md' },
    { key: 'methods', title: '答题方法', file: 'answer_methods.md' },
    { key: 'weaknesses', title: '个人真实薄弱点', file: 'user_weaknesses.md' },
  ],
}

async function walk(root, predicate) {
  const result = []
  async function visit(directory) {
    let entries = []
    try { entries = await fs.readdir(directory, { withFileTypes: true }) } catch { return }
    await Promise.all(entries.map(async (entry) => {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) return visit(full)
      if (predicate(full, entry.name)) result.push(full)
    }))
  }
  await visit(root)
  return result.sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

function relativeFrom(root, file) {
  return path.relative(root, file).split(path.sep).join('/')
}

function titleFromMarkdown(content, fallback) {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function extractTodayRow(content) {
  const now = new Date()
  const monthDay = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric',
  }).format(now).replace(/\//g, '/')
  const candidates = [`${now.getMonth() + 1}/${now.getDate()}`, monthDay]
  const line = content.split(/\r?\n/).find((value) => candidates.some((candidate) => value.startsWith(`| ${candidate} `)))
  if (!line) return null
  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
  if (cells.length < 5) return null
  return { date: cells[0], math2: cells[1], ds408: cells[2], english2: cells[3], politics: cells[4] }
}

function normalizeSubject(rawSubject, catalogPath) {
  const normalized = String(rawSubject || '').toLowerCase()
  if (normalized.includes('math') || catalogPath.includes('/math2/')) return 'math2'
  if (normalized.includes('english') || catalogPath.includes('/english2/')) return 'english2'
  if (normalized.includes('politic') || catalogPath.includes('/politics/')) return 'politics'
  if (catalogPath.includes('/data-structures/')) return '408.data-structures'
  if (catalogPath.includes('/computer-organization/')) return '408.computer-organization'
  if (catalogPath.includes('/operating-systems/')) return '408.operating-systems'
  if (catalogPath.includes('/computer-networks/')) return '408.computer-networks'
  return rawSubject || 'unknown'
}

function normalizeUnit(unit, subject) {
  const id = unit.chapter_id || unit.module_id || unit.unit_id || `${subject}.${unit.path}`
  const status = unit.organization_status || 'skeleton'
  const reviewRefs = unit.accepted_review_refs || []
  const acceptedCount = Number(unit.accepted_review_count ?? reviewRefs.length ?? 0)
  return {
    id,
    subject,
    title: unit.title || id,
    path: unit.path || '',
    status,
    acceptedCount,
    updatedAt: unit.updated_at || unit.recorded_at || null,
    keywords: unit.keywords || [],
    reviewRefs,
  }
}

async function loadPlans() {
  const files = await walk(PLAN_ROOT, (_, name) => name.endsWith('.md'))
  return Promise.all(files.map(async (file) => {
    const content = await fs.readFile(file, 'utf8')
    return {
      id: crypto.createHash('sha1').update(file).digest('hex').slice(0, 12),
      title: titleFromMarkdown(content, path.basename(file, '.md')),
      filename: path.basename(file),
      relativePath: relativeFrom(WORKSPACE_ROOT, file),
      updatedAt: (await fs.stat(file)).mtime.toISOString(),
      today: extractTodayRow(content),
    }
  }))
}

function parseMarkdownTableRows(content, headerMatch) {
  const lines = content.split(/\r?\n/)
  const start = lines.findIndex((line) => line.includes(headerMatch))
  if (start < 0) return []
  const rows = []
  for (const line of lines.slice(start + 2)) {
    if (!/^\s*\|/.test(line)) break
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length) rows.push(cells)
  }
  return rows
}

async function loadDailyPlan() {
  const files = await walk(PLAN_ROOT, (_, name) => name.includes('精确执行计划') && name.endsWith('.md'))
  if (!files.length) return null
  const file = files.sort((a, b) => b.localeCompare(a, 'zh-CN'))[0]
  const content = await fs.readFile(file, 'utf8')
  const year = Number(content.match(/(20\d{2})年/)?.[1] || new Date().getFullYear())
  const dailyRows = parseMarkdownTableRows(content, '| 日期 |')
  const explicitDays = dailyRows.map(([date, math2, ds408, english2, politics]) => {
    const [month, day] = String(date).split('/').map(Number)
    return { date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, label: date, math2, ds408, english2, politics }
  }).filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date))
  const fixedRows = parseMarkdownTableRows(content, '| 时间 |')
  const weeklyFiles = await walk(PLAN_ROOT, (_, name) => name.includes('周度任务总表') && name.endsWith('.md'))
  const weeklyContent = weeklyFiles.length ? await fs.readFile(weeklyFiles.sort((a, b) => b.localeCompare(a, 'zh-CN'))[0], 'utf8') : ''
  const weeklyRows = parseMarkdownTableRows(weeklyContent, '| 周次 |')
  const dailyByDate = new Map(explicitDays.map((day) => [day.date, day]))
  let inferredStart = new Date(`${year}-12-14T12:00:00`)
  const weekTasks = []
  for (const [week, math2, ds408, english2, politics] of weeklyRows) {
    const range = String(week).match(/(\d{1,2})\/(\d{1,2})[—-](\d{1,2})\/(\d{1,2})/)
    let start
    let end
    if (range) {
      let startYear = year
      let endYear = year
      const startMonth = Number(range[1]); const endMonth = Number(range[3])
      if (endMonth < startMonth) endYear += 1
      start = new Date(`${startYear}-${String(startMonth).padStart(2, '0')}-${String(Number(range[2])).padStart(2, '0')}T12:00:00`)
      end = new Date(`${endYear}-${String(endMonth).padStart(2, '0')}-${String(Number(range[4])).padStart(2, '0')}T12:00:00`)
      inferredStart = new Date(end); inferredStart.setDate(end.getDate() + 1)
    } else {
      start = new Date(inferredStart)
      end = new Date(start); end.setDate(start.getDate() + 6)
      inferredStart = new Date(end); inferredStart.setDate(end.getDate() + 1)
    }
    weekTasks.push({ week, math2, ds408, english2, politics, start, end })
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const iso = cursor.toISOString().slice(0, 10)
      if (!dailyByDate.has(iso)) dailyByDate.set(iso, { date: iso, label: `${cursor.getMonth() + 1}/${cursor.getDate()}`, math2, ds408, english2, politics })
    }
  }
  const days = [...dailyByDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  return { source: relativeFrom(WORKSPACE_ROOT, file), days, fixed: fixedRows.map(([time, content]) => ({ time, content })), weeks: weekTasks.map(({ week, start, end }) => ({ week, start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) })) }
}

async function loadCatalogs() {
  const files = await walk(KB_ROOT, (file, name) => name === 'catalog.json')
  const catalogs = []
  const units = []
  for (const file of files) {
    const data = await readJson(file)
    const relativePath = relativeFrom(KB_ROOT, file)
    const subject = normalizeSubject(data.subject, relativePath)
    const meta = subjectMeta[subject] || { label: subject, short: subject, color: '#687078' }
    const rawUnits = data.chapters || data.modules || []
    const normalizedUnits = rawUnits.map((unit) => normalizeUnit(unit, subject))
    catalogs.push({ subject, ...meta, updatedAt: data.updated_at, unitCount: normalizedUnits.length })
    units.push(...normalizedUnits)
  }
  return { catalogs, units }
}

async function loadActivities() {
  const file = path.join(KB_ROOT, 'activity_log.jsonl')
  const raw = await fs.readFile(file, 'utf8')
  return raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)).sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at)))
}

function sourceFamilyLabel(value, file) {
  const family = String(value || '').toLowerCase()
  if (family === 'zhangyu-1000') return '张宇1000题'
  if (family === 'zhangyu-30') return '张宇30讲'
  if (family === 'zhangyu-36') return '张宇36讲'
  if (family === 'lilin880' || /lilin880/i.test(file)) return '李林880'
  return '章节题源'
}

async function loadZhangyuQuestionRecords(unitRoot) {
  const reviewRoot = path.join(unitRoot, 'reviews')
  const files = await walk(reviewRoot, (_, name) => name.endsWith('.md')).then((items) => items.sort((a, b) => b.localeCompare(a, 'zh-CN')))
  const records = new Map()
  for (const file of files) {
    let content
    try { content = await fs.readFile(file, 'utf8') } catch { continue }
    const lines = content.split(/\r?\n/)
    for (let index = 0; index < lines.length; index += 1) {
      const heading = lines[index]
      if (!/^#{1,4}\s+/.test(heading)) continue
      const number = heading.match(/第\s*(\d+)\s*题/)?.[1]
      if (!number) continue
      const label = heading.replace(/^#{1,4}\s+/, '').replace(/[【】]/g, '').replace(/\s*｜.*$/, '').replace(/^Zhangyu-1000\s*/i, '').trim()
      if (!/(?:1000题|基础篇|强化篇|填空题|选择题|解答题|计算题)/.test(label)) continue
      const key = `${label}|${number}`
      if (records.has(key)) continue
      let end = index + 1
      while (end < lines.length && !/^#{1,4}\s+/.test(lines[end])) end += 1
      const excerpt = lines.slice(index + 1, end).join('\n').trim()
      records.set(key, {
        source_family: 'zhangyu-1000',
        source_section: label || '1000题显式题目',
        item_ref: `zhangyu-1000.${label || `显式题目 第${number}题`}`,
        item_kind: 'explicit-review',
        review_excerpt: excerpt,
        recordFile: relativeFrom(KB_ROOT, file),
      })
    }
  }
  return [...records.values()]
}

async function loadSourceQuestionRecords(unitId) {
  const mathRoot = path.join(KB_ROOT, 'math2')
  const files = await walk(mathRoot, (_, name) => name.endsWith('.audit.jsonl'))
  const entries = []
  for (const file of files) {
    let lines = []
    try { lines = (await fs.readFile(file, 'utf8')).split(/\r?\n/).filter(Boolean) } catch { continue }
    for (const line of lines) {
      try {
        const record = JSON.parse(line)
        const isFirstChapterRawRecord = unitId === 'math2.calculus.ch01' && /^ch01\./.test(String(record.item_ref || ''))
        if (record.chapter_id === unitId || isFirstChapterRawRecord) entries.push({ ...record, recordFile: relativeFrom(KB_ROOT, file) })
      } catch { /* A malformed in-progress line is ignored until the writer finishes it. */ }
    }
  }
  return entries.sort((a, b) => `${a.source_section || ''}\u0000${a.item_ref || ''}`.localeCompare(`${b.source_section || ''}\u0000${b.item_ref || ''}`, 'zh-CN'))
}

function sourceQuestionMarkdown(records) {
  const headingSlug = (text) => String(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
  const prettyStatus = (value) => {
    const raw = String(value || '').trim()
    return ({ verified: '已核验', 'verified-with-formula-ocr-risk': '已核验（公式待复核）', true: '正确', false: '错误', pending: '待核验', conflict: '存在冲突', 'source-gap': '来源缺口' })[raw.toLowerCase()] || raw || '待核验'
  }
  const prettyItemRef = (value) => {
    const raw = String(value || '').trim()
    const zhangyu = raw.match(/^zhangyu-1000\.(.+)$/i)
    if (zhangyu) return `张宇1000题 · ${zhangyu[1].replace(/[|]+/g, ' · ').replace(/\s+/g, ' ').trim()}`
    const zhangyuExample = raw.match(/^zhangyu-(30|36)\.ch0?(\d+)\.example\.(\d+)\.(\d+)$/i)
    if (zhangyuExample) return `张宇${zhangyuExample[1]}讲 · 第${Number(zhangyuExample[2])}章 · 例${Number(zhangyuExample[3])}.${Number(zhangyuExample[4])}`
    const match = raw.match(/^ch\d+\.(basic|comprehensive|extension)\.(choice|fill|solution)\.(.+)$/i)
    if (!match) return raw.replace(/[._]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || '未编号题'
    const scope = { basic: '基础', comprehensive: '综合', extension: '拓展' }[match[1].toLowerCase()] || match[1]
    const kind = { choice: '选择题', fill: '填空题', solution: '解答题' }[match[2].toLowerCase()] || match[2]
    return `${scope}${kind} ${match[3].replace(/[-_]+/g, '—')}`
  }
  const mathify = (value) => String(value ?? '').split(/([，。；：、])/u).map((part) => {
    if (!part || /^[，。；：、]$/u.test(part) || /\$|\\\(|\\\[/u.test(part)) return part
    const looksLikeMath = /(?:[A-Za-z][A-Za-z0-9_']*\s*[=<>≤≥]|\b(?:arctan|sin|cos|tan|ln|lim|dy|dx|d[xy])\b|[A-Za-z]\s*\^|[φθλ]\s*['′]|\\(?:frac|sqrt|int|sum|lim)|[∫Σ]|[₀₁₂₃₄₅₆₇₈₉])/u.test(part)
    if (!looksLikeMath) return part
    const tex = part.trim().replace(/\\?(arctan|arcsin|arccos|sin|cos|tan|ln|log|lim)(?![A-Za-z])/g, '\\$1')
    return `$${tex}$`
  }).join('')
  const groups = new Map()
  for (const record of records) {
    const label = sourceFamilyLabel(record.source_family, record.recordFile)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(record)
  }
  const lines = [
    '# 题源逐题库',
    '',
    '> 这里保存已处理的30讲、36讲与李林880题目。它们与张宇1000题同样按选项/小问核验；区别只在于不作为会话逐题输出和复盘成品卡。',
    '',
    '## 分组索引',
    '',
  ]
  for (const [family, items] of groups) lines.push(`- [${family}（${items.length} 题）](#${headingSlug(`${family}（${items.length} 题）`)})`)
  lines.push('')
  for (const [family, items] of groups) {
    lines.push(`## ${family}（${items.length} 题）`, '')
    lines.push('**本组题目索引：**', '')
    for (const item of items) lines.push(`- [${prettyItemRef(item.item_ref)}](#${headingSlug(prettyItemRef(item.item_ref))})`)
    lines.push('')
    for (const item of items) {
      const humanRef = prettyItemRef(item.item_ref)
      const humanSource = `${family}${item.source_section ? ` · ${item.source_section}` : ''} · ${humanRef}`
      lines.push(`### ${humanRef}`, '', `- **来源：** ${humanSource}`, `- **题型：** ${(item.topic_tags || []).join('、') || item.type_pool || '未归类'}`, `- **题面摘要：** ${mathify(item.prompt || '题面待补')}`)
      if (item.review_excerpt) {
        lines.push('', item.review_excerpt.trim(), '')
        continue
      }
      const options = Array.isArray(item.options) ? item.options : (Array.isArray(item.choices) ? item.choices : [])
      if (options.length) {
        lines.push('- **选项核验：**')
        for (const option of options) lines.push(`  - ${option.label || '选项'}：${mathify(option.text || option.statement || option.prompt || '')}；${prettyStatus(option.status || option.judgment)}${option.reason ? `（${mathify(option.reason)}）` : ''}`)
      }
      if (Array.isArray(item.subquestions) && item.subquestions.length) {
        lines.push('- **小问核验：**')
        for (const part of item.subquestions) lines.push(`  - ${part.label || '小问'}：${mathify(part.formal_answer || '答案待补')}；${mathify(part.independent_check || part.official_analysis || part.status || '待核验')}`)
      }
      // Verification state and raw record path remain in JSONL/manifest only;
      // they are intentionally omitted from the reading-oriented frontend text.
      lines.push('')
    }
  }
  return `${lines.join('\n').trimEnd()}\n`
}

function isKnowledgeSystemActivity(activity) {
  const source = String(activity.source_file || activity.target_file || '').replace(/\\/g, '/').toLowerCase()
  return /\/(textbook_knowledge|question_methods|user_weaknesses|evidence_and_language|answer_methods|stable_rules|knowledge_cards|concept_boundaries)\.md$/.test(`/${source}`)
}

function recordKind(recordType) {
  if (recordType === 'user-weakness') return 'weakness'
  if (/method/.test(recordType)) return 'method'
  if (/conflict|boundary/.test(recordType)) return 'boundary'
  return 'knowledge'
}

export async function loadQuestionTypeIndex() {
  const [{ units }, activities] = await Promise.all([loadCatalogs(), loadActivities()])
  const unitNames = new Map(units.map((unit) => [unit.id, unit.title]))
  const systemActivities = activities.filter((activity) => isKnowledgeSystemActivity(activity))
  const weaknesses = systemActivities.filter((activity) => activity.record_type === 'user-weakness')
  const records = systemActivities.filter((activity) => activity.record_type !== 'user-weakness')
  const groups = new Map()

  for (const record of records) {
    const key = `${record.subject}\u0000${record.unit_id}\u0000${String(record.title || '').trim()}`
    if (!groups.has(key)) {
      const unitWeaknesses = weaknesses.filter((item) => item.subject === record.subject && item.unit_id === record.unit_id)
      const refs = Array.isArray(record.question_refs) ? record.question_refs : []
      const relatedWeaknesses = unitWeaknesses.filter((item) => {
        const weaknessRefs = Array.isArray(item.question_refs) ? item.question_refs : []
        return refs.some((ref) => weaknessRefs.includes(ref))
      })
      groups.set(key, {
        id: crypto.createHash('sha1').update(key).digest('hex').slice(0, 12),
        subject: record.subject,
        unitId: record.unit_id,
        unitTitle: unitNames.get(record.unit_id) || record.unit_id,
        title: record.title,
        kind: recordKind(record.record_type),
        records: [],
        relatedWeaknesses,
        unitWeaknesses: unitWeaknesses.filter((item) => !relatedWeaknesses.includes(item)),
      })
    }
    groups.get(key).records.push({
      id: record.record_id,
      recordedAt: record.recorded_at,
      recordType: record.record_type,
      summary: record.summary,
      questionRefs: Array.isArray(record.question_refs) ? record.question_refs : [],
      sourceStatus: record.source_status || null,
      sourceFile: record.source_file || record.target_file || null,
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: { types: groups.size, records: records.length, weaknesses: weaknesses.length },
    types: [...groups.values()].sort((a, b) => String(b.records[0]?.recordedAt).localeCompare(String(a.records[0]?.recordedAt))),
  }
}

function normalizeReviewText(content) {
  return content.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trimEnd() + '\n'
}

function digestReview(content) {
  return crypto.createHash('sha256').update(normalizeReviewText(content), 'utf8').digest('hex')
}

export function filterSupersededReviews(reviews) {
  const supersededReviewIds = new Set(reviews.flatMap((review) => review.supersedesReviewIds || []))
  return reviews.filter((review) => !supersededReviewIds.has(review.id))
}

async function loadReviews(activities = null) {
  const files = await walk(KB_ROOT, (_, name) => name.endsWith('.review-manifest.json'))
  const manifestedPaths = new Set()
  const migratedUnitIds = new Set()
  const manifested = await Promise.all(files.map(async (file) => {
    const manifest = await readJson(file)
    if (manifest.migration_status === 'existing_review_files_exactly_assembled_without_rewrite') migratedUnitIds.add(manifest.unit_id)
    for (const sourcePath of manifest.migrated_source_paths || []) manifestedPaths.add(String(sourcePath).replace(/\\/g, '/').toLowerCase())
    const reviewFile = path.resolve(path.dirname(file), manifest.review_path)
    manifestedPaths.add(relativeFrom(KB_ROOT, reviewFile).toLowerCase())
    let bytes = 0
    try { bytes = (await fs.stat(reviewFile)).size } catch {}
    return {
      id: manifest.review_id,
      dossierId: manifest.dossier_id,
      subject: manifest.subject,
      unitId: manifest.unit_id,
      scope: manifest.scope,
      acceptedAt: manifest.accepted_at,
      artifactStatus: manifest.artifact_status || 'legacy-unverified',
      segmentCount: manifest.segment_count || manifest.segments?.length || 0,
      characterCount: manifest.assembled_character_count || null,
      hash: manifest.assembled_normalized_sha256 || manifest.archived_file_sha256 || null,
      reviewBytes: bytes,
      manifestPath: relativeFrom(KB_ROOT, file),
      sourceStatus: manifest.source_status || null,
      expectedCoverage: manifest.expected_coverage || null,
      supersedesReviewIds: Array.isArray(manifest.supersedes_review_ids) ? manifest.supersedes_review_ids : [],
      appliesToUnitIds: Array.isArray(manifest.applies_to_unit_ids) ? manifest.applies_to_unit_ids : [],
      isAddendum: Array.isArray(manifest.applies_to_unit_ids) && manifest.applies_to_unit_ids.length > 0,
    }
  }))

  const acceptedActivities = (activities || await loadActivities()).filter((activity) => activity.record_type === 'accepted-review' && activity.source_file)
  const legacyByPath = new Map()
  for (const activity of acceptedActivities) {
    const relativePath = String(activity.source_file).replace(/\\/g, '/')
    if (migratedUnitIds.has(activity.unit_id)) continue
    if (manifestedPaths.has(relativePath.toLowerCase())) continue
    const previous = legacyByPath.get(relativePath)
    if (!previous || String(activity.recorded_at).localeCompare(String(previous.recorded_at)) > 0) legacyByPath.set(relativePath, activity)
  }

  const legacy = []
  for (const [relativePath, activity] of legacyByPath) {
    const reviewFile = path.resolve(KB_ROOT, ...relativePath.split('/'))
    if (!reviewFile.startsWith(`${KB_ROOT}${path.sep}`)) continue
    let content
    let stat
    try {
      ;[content, stat] = await Promise.all([fs.readFile(reviewFile, 'utf8'), fs.stat(reviewFile)])
    } catch { continue }
    const normalized = normalizeReviewText(content)
    const hash = digestReview(content)
    legacy.push({
      id: `legacy-${crypto.createHash('sha1').update(relativePath).digest('hex').slice(0, 12)}`,
      dossierId: activity.record_id,
      subject: activity.subject,
      unitId: activity.unit_id,
      scope: activity.title || titleFromMarkdown(content, path.basename(reviewFile, '.md')),
      acceptedAt: activity.recorded_at,
      artifactStatus: 'accepted-legacy',
      segmentCount: 1,
      characterCount: normalized.length,
      hash,
      reviewBytes: stat.size,
      manifestPath: `历史验收 · activity_log.jsonl → ${relativePath}`,
      sourceStatus: { manifest: '无独立 review manifest；验收依据为 activity_log.jsonl 中的 accepted-review 记录' },
      expectedCoverage: null,
      appliesToUnitIds: Array.isArray(activity.applies_to_unit_ids) ? activity.applies_to_unit_ids : [],
      isAddendum: Array.isArray(activity.applies_to_unit_ids) && activity.applies_to_unit_ids.length > 0,
      legacy: { relativePath },
    })
  }

  const allReviews = [...manifested, ...legacy]
  return filterSupersededReviews(allReviews)
    .sort((a, b) => String(b.acceptedAt).localeCompare(String(a.acceptedAt)))
}

export async function loadSnapshot() {
  const [{ catalogs, units }, plans, dailyPlan, activities, framework] = await Promise.all([
    loadCatalogs(), loadPlans(), loadDailyPlan(), loadActivities(), readJson(path.join(KB_ROOT, 'framework_manifest.json')),
  ])
  const reviews = await loadReviews(activities)
  const primaryReviewCount = reviews.filter((review) => !review.isAddendum).length
  const organized = units.filter((unit) => unit.status === 'organized').length
  const linked = units.filter((unit) => unit.status === 'partially-organized').length
  return {
    generatedAt: new Date().toISOString(),
    workspace: WORKSPACE_ROOT,
    totals: { units: units.length, organized, linked, skeleton: units.length - organized - linked, reviews: primaryReviewCount, reviewArtifacts: reviews.length, activities: activities.length },
    framework,
    catalogs,
    units,
    plans,
    dailyPlan,
    activities: activities.slice(0, 120),
    reviews,
  }
}

export async function loadPlan(id) {
  const files = await walk(PLAN_ROOT, (_, name) => name.endsWith('.md'))
  for (const file of files) {
    const fileId = crypto.createHash('sha1').update(file).digest('hex').slice(0, 12)
    if (fileId === id) return { id, content: await fs.readFile(file, 'utf8'), relativePath: relativeFrom(WORKSPACE_ROOT, file) }
  }
  return null
}

export async function loadKnowledgeUnit(id) {
  const catalogFiles = await walk(KB_ROOT, (_, name) => name === 'catalog.json')
  const activities = await loadActivities()
  for (const catalogFile of catalogFiles) {
    const data = await readJson(catalogFile)
    const catalogPath = relativeFrom(KB_ROOT, catalogFile)
    const subject = normalizeSubject(data.subject, catalogPath)
    const rawUnit = (data.chapters || data.modules || []).find((unit) =>
      (unit.chapter_id || unit.module_id || unit.unit_id) === id)
    if (!rawUnit) continue

    const subjectRoot = path.dirname(catalogFile)
    const unitRoot = path.resolve(subjectRoot, rawUnit.path || '')
    if (!unitRoot.startsWith(`${subjectRoot}${path.sep}`)) return null
    const systemGroup = subject.startsWith('408.') ? '408' : subject
    const definitions = knowledgeSystems[systemGroup] || []
    const systems = []
    for (const definition of definitions) {
      const file = path.join(definition.root ? subjectRoot : unitRoot, definition.file)
      let content
      let stat
      try { [content, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)]) } catch { continue }
      const relativePath = relativeFrom(KB_ROOT, file)
      const normalizedPath = relativePath.toLowerCase()
      const matchingActivities = activities.filter((activity) => {
        const candidates = [activity.source_file, activity.target_file].filter(Boolean)
        return candidates.some((candidate) => String(candidate).replace(/\\/g, '/').toLowerCase().endsWith(normalizedPath))
      })
      systems.push({
        key: definition.key,
        title: definition.title,
        filename: definition.file,
        relativePath,
        content,
        updatedAt: stat.mtime.toISOString(),
        activityCount: matchingActivities.length,
      })
    }
    if (subject === 'math2') {
      const records = [...await loadSourceQuestionRecords(id), ...await loadZhangyuQuestionRecords(unitRoot)]
      if (records.length) {
        systems.push({
          key: 'source-questions',
          title: '题源逐题库',
          filename: '逐题核验记录',
          relativePath: 'math2/source-question-records（含兼容李林记录）',
          content: sourceQuestionMarkdown(records),
          updatedAt: records.map((record) => record.reviewed_at).filter(Boolean).sort().at(-1) || new Date().toISOString(),
          activityCount: records.length,
        })
      }
    }
    return {
      id,
      subject,
      title: rawUnit.title || id,
      status: rawUnit.organization_status || 'skeleton',
      path: relativeFrom(KB_ROOT, unitRoot),
      systems,
      activityCount: systems.reduce((sum, system) => sum + system.activityCount, 0),
    }
  }
  return null
}

export async function loadReview(id) {
  const files = await walk(KB_ROOT, (_, name) => name.endsWith('.review-manifest.json'))
  for (const file of files) {
    const manifest = await readJson(file)
    if (manifest.review_id !== id) continue
    const reviewFile = path.resolve(path.dirname(file), manifest.review_path)
    return { manifest, content: await fs.readFile(reviewFile, 'utf8'), relativePath: relativeFrom(KB_ROOT, reviewFile) }
  }
  const reviews = await loadReviews()
  const review = reviews.find((candidate) => candidate.id === id && candidate.legacy)
  if (review) {
    const { relativePath } = review.legacy
    const reviewFile = path.resolve(KB_ROOT, ...relativePath.split('/'))
    const content = await fs.readFile(reviewFile, 'utf8')
    const characterCount = normalizeReviewText(content).length
    const hash = digestReview(content)
    return {
      manifest: {
        review_id: review.id,
        dossier_id: review.dossierId,
        subject: review.subject,
        unit_id: review.unitId,
        scope: review.scope,
        accepted_at: review.acceptedAt,
        artifact_status: 'accepted-legacy',
        segment_count: 1,
        assembled_character_count: characterCount,
        assembled_normalized_sha256: hash,
        source_status: review.sourceStatus,
        segments: [{ sequence: 1, scope: '既有已接受正文（无独立分段清单）', character_count: characterCount, revision: 1, normalized_sha256: hash }],
      },
      content,
      relativePath,
    }
  }
  return null
}
