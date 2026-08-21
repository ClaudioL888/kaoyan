export type View = 'overview' | 'plan' | 'knowledge' | 'reviews'

export type Unit = {
  id: string
  subject: string
  title: string
  path: string
  status: string
  acceptedCount: number
  updatedAt: string | null
  keywords: string[]
  reviewRefs: string[]
}

export type ReviewSummary = {
  id: string
  dossierId: string
  subject: string
  unitId: string
  scope: string
  acceptedAt: string
  artifactStatus: string
  segmentCount: number
  characterCount: number | null
  hash: string | null
  reviewBytes: number
  manifestPath: string
  sourceStatus: Record<string, unknown> | null
  expectedCoverage: Record<string, number> | null
  appliesToUnitIds: string[]
  isAddendum: boolean
}

export type Activity = {
  record_id: string
  recorded_at: string
  subject: string
  unit_id: string
  record_type: string
  title: string
  summary: string
  question_refs?: string[]
  source_status?: string
  source_file?: string
  manifest_file?: string
}

export type PlanSummary = {
  id: string
  title: string
  filename: string
  relativePath: string
  updatedAt: string
  today: null | { date: string; math2: string; ds408: string; english2: string; politics: string }
}

export type DailyPlan = {
  source: string
  days: Array<{ date: string; label: string; math2: string; ds408: string; english2: string; politics: string }>
  fixed: Array<{ time: string; content: string }>
  weeks?: Array<{ week: string; start: string; end: string }>
}

export type Snapshot = {
  revision: number
  generatedAt: string
  workspace: string
  totals: { units: number; organized: number; linked: number; skeleton: number; reviews: number; reviewArtifacts: number; activities: number }
  catalogs: Array<{ subject: string; label: string; short: string; color: string; updatedAt: string; unitCount: number }>
  units: Unit[]
  plans: PlanSummary[]
  dailyPlan: DailyPlan | null
  activities: Activity[]
  reviews: ReviewSummary[]
}

export type ReviewDetail = {
  manifest: Record<string, any>
  content: string
  relativePath: string
}

export type KnowledgeSystem = {
  key: string
  title: string
  filename: string
  relativePath: string
  content: string
  updatedAt: string
  activityCount: number
}

export type KnowledgeDetail = {
  id: string
  subject: string
  title: string
  status: string
  path: string
  systems: KnowledgeSystem[]
  activityCount: number
}

export type QuestionTypeRecord = {
  id: string
  recordedAt: string
  recordType: string
  summary: string
  questionRefs: string[]
  sourceStatus: string | null
  sourceFile: string | null
}

export type WeaknessRecord = Activity

export type QuestionTypeGroup = {
  id: string
  subject: string
  unitId: string
  unitTitle: string
  title: string
  kind: 'method' | 'knowledge' | 'boundary'
  records: QuestionTypeRecord[]
  relatedWeaknesses: WeaknessRecord[]
  unitWeaknesses: WeaknessRecord[]
}

export type QuestionTypeIndex = {
  generatedAt: string
  totals: { types: number; records: number; weaknesses: number }
  types: QuestionTypeGroup[]
}
