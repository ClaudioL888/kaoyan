const fieldLabels: Record<string, string> = {
  record_id: '记录编号', review_id: '复盘编号', dossier_id: '复盘档案', item_ref: '题目编号',
  source_file: '来源记录', source_status: '来源状态', manifest_file: '完整性清单', artifact_status: '复盘状态',
  recorded_at: '记录时间', question_refs: '关联题号', source_section: '来源分组', type_pool: '题型归类',
}

const statusLabels: Record<string, string> = {
  verified: '已核验', 'verified-with-formula-ocr-risk': '已核验（公式待复核）', pending: '待核验',
  conflict: '存在冲突', 'source-gap': '来源缺口', true: '正确', false: '错误',
}

function readableQuestionToken(value: string) {
  const match = value.match(/ch(\d{1,2})[._-](basic|comprehensive|extension)[._-](choice|fill|solution)[._-]([\d-]+)/i)
  if (!match) return null
  const scope: Record<string, string> = { basic: '基础', comprehensive: '综合', extension: '拓展' }
  const kind: Record<string, string> = { choice: '选择题', fill: '填空题', solution: '解答题' }
  return `第 ${Number(match[1])} 章 · ${scope[match[2].toLowerCase()] || match[2]}${kind[match[3].toLowerCase()] || match[3]} ${match[4].replace(/-/g, '—')}`
}

function readableSourceIdentifier(value: string) {
  const match = value.match(/zhangyu-(30|36)(?:\.|\s+)ch0?(\d+)(?:\.|\s+)example(?:\.|\s+)(\d+)(?:\.|\s+)(\d+)/i)
  if (!match) return null
  return `张宇${match[1]}讲 · 第${Number(match[2])}章 · 例${Number(match[3])}.${Number(match[4])}`
}

function readableSourcePath(value: string) {
  const normalized = value.replace(/\\/g, '/')
  if (!/\.(jsonl?|md|audit)$/i.test(normalized)) return null
  const basename = normalized.split('/').at(-1) || normalized
  const stem = basename.replace(/\.(jsonl?|audit)$/i, '').replace(/[-_]+/g, ' ').trim()
  const family = /lilin880/i.test(normalized) ? '李林880' : /zhangyu/i.test(normalized) ? '张宇题源' : /math2/i.test(normalized) ? '数学二知识库' : '来源记录'
  return `${family} · ${stem}`
}

export function humanizeInlineValue(value: string) {
  const raw = value.trim()
  const lower = raw.toLowerCase()
  if (fieldLabels[lower]) return fieldLabels[lower]
  if (statusLabels[lower]) return statusLabels[lower]
  const sourceIdentifier = readableSourceIdentifier(raw)
  if (sourceIdentifier) return sourceIdentifier
  const question = readableQuestionToken(raw)
  if (question) return question
  const source = readableSourcePath(raw)
  if (source) return source
  if (/^zhangyu-1000[._-]/i.test(raw)) return `张宇1000题 · ${raw.replace(/^zhangyu-1000[._-]/i, '').replace(/[._]+/g, ' ')}`
  return raw
}

export function humanizeReadableMarkdown(content: string) {
  return content
    .replace(/\*\*([A-Za-z][\w-]*)\s*([:：])\*\*/g, (_full, key: string, punctuation: string) => `**${fieldLabels[key.toLowerCase()] || key}${punctuation}**`)
    .replace(/`([^`\n]+)`/g, (_full, value: string) => {
      const readable = humanizeInlineValue(value)
      return readable === value.trim() ? _full : '`' + readable + '`'
    })
    .replace(/zhangyu-(30|36)(?:\.|\s+)ch0?(\d+)(?:\.|\s+)example(?:\.|\s+)(\d+)(?:\.|\s+)(\d+)/gi, (_full, family: string, chapter: string, major: string, minor: string) => `张宇${family}讲 · 第${Number(chapter)}章 · 例${Number(major)}.${Number(minor)}`)
    .replace(/(^|[：:；;]\s*)(verified-with-formula-ocr-risk|verified|pending|conflict|source-gap|true|false)(?=\s|$|[，。；,.;])/gim, (_full, prefix: string, value: string) => `${prefix}${statusLabels[value.toLowerCase()] || value}`)
}
