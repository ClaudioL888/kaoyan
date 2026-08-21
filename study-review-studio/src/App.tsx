import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, BookOpen, CalendarDays, Check, ChevronRight,
  CircleDot, FileCheck2, FileText, Hash, LayoutDashboard, LibraryBig,
  ListTree, Menu, Radio, RefreshCw, Search, ShieldCheck, Sparkles, Tags, Target, X,
} from 'lucide-react'
import type { Activity, DailyPlan, KnowledgeDetail, PlanSummary, QuestionTypeGroup, QuestionTypeIndex, ReviewDetail, ReviewSummary, Snapshot, Unit, View } from './types'

const Markdown = lazy(() => import('./Markdown'))

const subjectLabels: Record<string, string> = {
  math2: '数学二', '408.data-structures': '数据结构', '408.computer-organization': '计组',
  '408.operating-systems': '操作系统', '408.computer-networks': '计网', english2: '英语二', politics: '政治',
}

const nav = [
  { id: 'overview' as View, label: '今日总览', icon: LayoutDashboard },
  { id: 'plan' as View, label: '计划', icon: CalendarDays },
  { id: 'knowledge' as View, label: '知识库', icon: LibraryBig },
  { id: 'reviews' as View, label: '复盘审阅', icon: FileCheck2 },
]

const formatTime = (value?: string | null, withDate = false) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', month: withDate ? 'numeric' : undefined, day: withDate ? 'numeric' : undefined,
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(value))
}

function statusLabel(status: string) {
  if (status === 'organized') return '已整理'
  if (status === 'partially-organized') return '已有复盘'
  return '待整理'
}

function subjectGroup(subject: string) {
  return subject.startsWith('408.') ? '408' : subject
}

function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [view, setView] = useState<View>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [changeNotice, setChangeNotice] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const response = await fetch('/api/snapshot')
      if (!response.ok) throw new Error(`数据读取失败 (${response.status})`)
      setSnapshot(await response.json())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '无法读取本地知识库')
    } finally { if (!quiet) setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const events = new EventSource('/api/events')
    events.addEventListener('ready', () => setLive(true))
    events.addEventListener('change', (event) => {
      const payload = JSON.parse((event as MessageEvent).data)
      setChangeNotice(`${payload.path} 已更新`)
      void refresh(true)
      window.setTimeout(() => setChangeNotice(null), 3200)
    })
    events.onerror = () => setLive(false)
    return () => events.close()
  }, [refresh])

  if (loading && !snapshot) return <LoadingScreen />
  if (error && !snapshot) return <ErrorScreen message={error} onRetry={() => void refresh()} />
  if (!snapshot) return null

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} open={sidebarOpen} close={() => setSidebarOpen(false)} snapshot={snapshot} />
      <main className="main-shell">
        <Topbar view={view} snapshot={snapshot} live={live} menu={() => setSidebarOpen(true)} refresh={() => void refresh()} />
        <div className="page">
          {view === 'overview' && <Overview snapshot={snapshot} go={setView} />}
          {view === 'plan' && <PlanView plans={snapshot.plans} dailyPlan={snapshot.dailyPlan} />}
          {view === 'knowledge' && <KnowledgeView units={snapshot.units} catalogs={snapshot.catalogs} revision={snapshot.revision} />}
          {view === 'reviews' && <ReviewsView reviews={snapshot.reviews} units={snapshot.units} />}
        </div>
      </main>
      {changeNotice && <div className="toast"><Radio size={15} />{changeNotice}</div>}
    </div>
  )
}

function LoadingScreen() {
  return <div className="center-state"><div className="loading-mark"><RefreshCw size={22} /></div><p>正在读取计划与知识库…</p></div>
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="center-state"><p>{message}</p><button className="primary-button" onClick={onRetry}>重新连接</button></div>
}

function Sidebar({ view, setView, open, close, snapshot }: { view: View; setView: (value: View) => void; open: boolean; close: () => void; snapshot: Snapshot }) {
  return <>
    <button className={`sidebar-scrim ${open ? 'is-open' : ''}`} aria-label="关闭导航" onClick={close} />
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="brand"><div className="brand-mark">砺</div><div><strong>砺学</strong><span>复习观测台</span></div><button className="icon-button sidebar-close" onClick={close}><X size={18} /></button></div>
      <nav className="nav-list">
        {nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); close() }}><item.icon size={17} /><span>{item.label}</span>{item.id === 'reviews' && <em>{snapshot.totals.reviews}</em>}</button>)}
      </nav>
      <div className="sidebar-foot">
        <div className="mini-progress"><span>知识库覆盖</span><strong>{snapshot.totals.organized + snapshot.totals.linked}/{snapshot.totals.units}</strong></div>
        <div className="progress-track"><i style={{ width: `${((snapshot.totals.organized + snapshot.totals.linked) / snapshot.totals.units) * 100}%` }} /></div>
        <p>骨架不等于已整理。这里只统计已接受复盘或已组织章节。</p>
      </div>
    </aside>
  </>
}

function Topbar({ view, snapshot, live, menu, refresh }: { view: View; snapshot: Snapshot; live: boolean; menu: () => void; refresh: () => void }) {
  const title = nav.find((item) => item.id === view)?.label
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={menu}><Menu size={19} /></button><div><span className="eyebrow">2026 考研 · 22408</span><h1>{title}</h1></div></div><div className="topbar-actions"><div className={`live-chip ${live ? 'is-live' : ''}`}><span />{live ? '实时同步' : '正在重连'}</div><span className="sync-time">更新于 {formatTime(snapshot.generatedAt)}</span><button className="icon-button" aria-label="刷新" onClick={refresh}><RefreshCw size={17} /></button></div></header>
}

function Overview({ snapshot, go }: { snapshot: Snapshot; go: (view: View) => void }) {
  const currentPlan = snapshot.plans.find((plan) => plan.today)?.today
  const latestReviews = snapshot.reviews.filter((review) => !review.isAddendum).slice(0, 3)
  const acceptedToday = snapshot.activities.filter((item) => item.record_type === 'accepted-review').slice(0, 4)
  const groups = ['math2', '408', 'english2', 'politics'].map((group) => {
    const units = snapshot.units.filter((unit) => subjectGroup(unit.subject) === group)
    const touched = units.filter((unit) => unit.status !== 'skeleton').length
    return { group, units, touched }
  })
  return <div className="overview-grid">
    <section className="hero-card">
      <div className="hero-copy"><span className="kicker"><Sparkles size={14} /> 今日学习现场</span><h2>计划在左，真实进展在右。</h2><p>计划是基线，知识库活动是已经发生的事实。两者并列展示，不用完成记录反推掌握度。</p></div>
      <div className="hero-stats"><div><strong>{snapshot.totals.activities}</strong><span>确认记录</span></div><div><strong>{snapshot.totals.reviews}</strong><span>可审阅复盘</span></div><div><strong>{snapshot.totals.organized + snapshot.totals.linked}</strong><span>已触达单元</span></div></div>
    </section>

    <section className="panel today-panel"><PanelHeader eyebrow="PLAN BASELINE" title="今日计划基线" action="查看完整计划" onAction={() => go('plan')} />
      {currentPlan ? <div className="today-list">
        <TodayRow subject="数学二" tone="math" text={currentPlan.math2} />
        <TodayRow subject="408" tone="cs" text={currentPlan.ds408} />
        <TodayRow subject="英语二" tone="english" text={currentPlan.english2} />
        <TodayRow subject="政治" tone="politics" text={currentPlan.politics} />
      </div> : <Empty text="当前计划文件没有匹配到今天的行。" />}
    </section>

    <section className="panel activity-panel"><PanelHeader eyebrow="CONFIRMED CHANGES" title="最近确认归档" action="进入知识库" onAction={() => go('knowledge')} />
      <div className="activity-list">{acceptedToday.map((item) => <ActivityRow key={item.record_id} item={item} />)}</div>
    </section>

    <section className="subject-grid">{groups.map(({ group, units, touched }) => <SubjectCard key={group} group={group} total={units.length} touched={touched} latest={units.map((unit) => unit.updatedAt).filter(Boolean).sort().at(-1) || null} />)}</section>

    <section className="panel review-strip"><PanelHeader eyebrow="READY TO REVIEW" title="最近复盘成品" action="全部复盘" onAction={() => go('reviews')} />
      <div className="review-cards">{latestReviews.map((review) => <ReviewMini key={review.id} review={review} onOpen={() => go('reviews')} />)}</div>
    </section>
  </div>
}

function PanelHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="panel-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <button className="text-button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}</div>
}

function TodayRow({ subject, text, tone }: { subject: string; text: string; tone: string }) {
  return <div className="today-row"><span className={`subject-dot ${tone}`} /><strong>{subject}</strong><p>{text}</p></div>
}

function ActivityRow({ item }: { item: Activity }) {
  return <article className="activity-row"><div className="activity-icon"><Check size={14} /></div><div><div className="activity-meta"><span>{subjectLabels[item.subject] || item.subject}</span><time>{formatTime(item.recorded_at, true)}</time></div><h3>{item.title}</h3><p>{item.summary}</p>{item.question_refs?.length ? <small>{item.question_refs.join(' · ')}</small> : null}</div></article>
}

function SubjectCard({ group, total, touched, latest }: { group: string; total: number; touched: number; latest: string | null }) {
  const labels: Record<string, string> = { math2: '数学二', '408': '408', english2: '英语二', politics: '政治' }
  const ratio = total ? touched / total : 0
  return <article className={`subject-card subject-${group.replace('.', '-')}`}><div className="subject-card-top"><span>{labels[group]}</span><strong>{touched}<em> / {total}</em></strong></div><div className="progress-track"><i style={{ width: `${ratio * 100}%` }} /></div><p>{touched ? `最近更新 ${formatTime(latest, true)}` : '已建骨架，尚无接受复盘'}</p></article>
}

function ReviewMini({ review, onOpen }: { review: ReviewSummary; onOpen: () => void }) {
  return <button className="review-mini" onClick={onOpen}><div className="review-mini-icon"><BookOpen size={18} /></div><div><span>{subjectLabels[review.subject] || review.subject}</span><h3>{review.scope}</h3><p>{review.segmentCount} 段 · {review.characterCount?.toLocaleString('zh-CN') || '—'} 字符</p></div><ChevronRight size={17} /></button>
}

function PlanView({ plans, dailyPlan }: { plans: PlanSummary[]; dailyPlan: DailyPlan | null }) {
  const [selected, setSelected] = useState(plans.find((plan) => plan.today)?.id || plans[0]?.id)
  const [content, setContent] = useState('')
  const [linkNotice, setLinkNotice] = useState<string | null>(null)
  const documentPane = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!selected) return
    const controller = new AbortController()
    setContent('')
    fetch(`/api/plans/${selected}`, { signal: controller.signal })
      .then((value) => value.json())
      .then((value) => setContent(value.content))
      .catch((error) => { if (error.name !== 'AbortError') setLinkNotice('计划文件读取失败，请稍后重试。') })
    return () => controller.abort()
  }, [selected])

  const openPlanLink = useCallback((href: string) => {
    let normalized = href
    try { normalized = decodeURIComponent(href) } catch { /* keep the original href */ }
    normalized = normalized.replace(/^file:\/\//i, '').replace(/\\/g, '/').replace(/[?#].*$/, '')
    const target = plans.find((plan) => {
      const relativePath = plan.relativePath.replace(/\\/g, '/')
      return normalized === plan.filename || normalized.endsWith(`/${plan.filename}`) || normalized.endsWith(`/${relativePath}`)
    })
    if (!target) {
      setLinkNotice(`当前链接未纳入计划文件列表：${normalized.split('/').at(-1) || normalized}`)
      window.setTimeout(() => setLinkNotice(null), 3600)
      return
    }
    setLinkNotice(null)
    setSelected(target.id)
    documentPane.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [plans])

  const [calendarMode, setCalendarMode] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState(() => dailyPlan?.days.find((day) => day.date === new Date().toISOString().slice(0, 10))?.date || dailyPlan?.days[0]?.date || '')
  const currentDay = dailyPlan?.days.find((day) => day.date === selectedDate) || dailyPlan?.days[0]
  const selectedDateObject = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()
  const monthStart = new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth(), 1, 12)
  const monthOffset = (monthStart.getDay() + 6) % 7
  const monthLength = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 12).getDate()
  const monthCells = [...Array(monthOffset).fill(null), ...Array.from({ length: monthLength }, (_, index) => {
    const date = new Date(monthStart); date.setDate(index + 1)
    return date.toISOString().slice(0, 10)
  })]
  const weekDays = dailyPlan?.days.filter((day) => {
    if (!selectedDate) return false
    const anchor = new Date(`${selectedDate}T12:00:00`)
    const mondayOffset = (anchor.getDay() + 6) % 7
    const monday = new Date(anchor); monday.setDate(anchor.getDate() - mondayOffset)
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
    const date = new Date(`${day.date}T12:00:00`)
    return date >= monday && date <= sunday
  }) || []
  const taskColumns: Array<[keyof DailyPlan['days'][number], string]> = [['math2', '数学二'], ['ds408', '408'], ['english2', '英语二'], ['politics', '政治']]
  const shiftDate = (days: number) => { const next = new Date(selectedDateObject); next.setDate(next.getDate() + days); const iso = next.toISOString().slice(0, 10); const nearest = dailyPlan?.days.reduce((best, day) => Math.abs(new Date(`${day.date}T12:00:00`).getTime() - next.getTime()) < Math.abs(new Date(`${best}T12:00:00`).getTime() - next.getTime()) ? day.date : best, dailyPlan?.days[0]?.date || iso); setSelectedDate(nearest || iso) }
  const dailyCalendar = dailyPlan ? <section className="daily-plan panel"><div className="daily-plan-head"><div><span className="eyebrow">DAILY EXECUTION CALENDAR</span><h2>每日计划</h2><p>按月、按周浏览；从现有精确执行计划拆分，原始计划作为下方明细。</p></div><div className="calendar-controls"><button className={calendarMode === 'day' ? 'active' : ''} onClick={() => setCalendarMode('day')}>日视图</button><button className={calendarMode === 'week' ? 'active' : ''} onClick={() => setCalendarMode('week')}>周视图</button></div></div><div className="calendar-navigation"><button onClick={() => shiftDate(calendarMode === 'day' ? -1 : -7)}>‹</button><strong>{calendarMode === 'day' ? `${selectedDateObject.getFullYear()}年${selectedDateObject.getMonth() + 1}月` : `${weekDays[0]?.date || selectedDate} — ${weekDays.at(-1)?.date || selectedDate}`}</strong><button onClick={() => shiftDate(calendarMode === 'day' ? 1 : 7)}>›</button></div>{calendarMode === 'day' && <div className="month-calendar"><div className="month-weekdays">{['一','二','三','四','五','六','日'].map((day) => <span key={day}>{day}</span>)}</div><div className="month-grid">{monthCells.map((date, index) => date ? <button key={date} className={selectedDate === date ? 'active' : ''} onClick={() => setSelectedDate(date)}><strong>{Number(date.slice(-2))}</strong>{dailyPlan.days.some((day) => day.date === date) && <i />}</button> : <span key={`blank-${index}`} />)}</div></div>}{calendarMode === 'day' && currentDay && <div className="day-calendar"><div className="selected-day"><span className="eyebrow">{currentDay.date}</span><h3>{currentDay.label} 学习安排</h3></div><div className="daily-task-grid">{taskColumns.map(([key, label]) => <article key={key}><span>{label}</span><p>{currentDay[key] || '暂无安排'}</p></article>)}</div><div className="fixed-schedule"><h3>固定时段</h3>{dailyPlan.fixed.map((item) => <div key={item.time}><time>{item.time}</time><span>{item.content}</span></div>)}</div></div>}{calendarMode === 'week' && <div className="week-calendar">{weekDays.map((day) => <article key={day.date} className={day.date === selectedDate ? 'selected' : ''} onClick={() => setSelectedDate(day.date)}><header><strong>{day.label}</strong><span>{day.date}</span></header>{taskColumns.map(([key, label]) => <div key={key}><b>{label}</b><p>{day[key] || '暂无安排'}</p></div>)}</article>)}</div>}</section> : null
  return <div className="plan-page">{dailyCalendar}<div className="split-view"><aside className="collection-list"><div className="collection-heading"><span className="eyebrow">PLAN FILES</span><h2>计划文件</h2></div>{plans.map((plan) => <button key={plan.id} className={selected === plan.id ? 'selected' : ''} onClick={() => { setSelected(plan.id); setLinkNotice(null); documentPane.current?.scrollTo({ top: 0, behavior: 'auto' }) }}><FileText size={16} /><div><strong>{plan.title}</strong><span>{plan.today ? '含今日任务' : plan.filename}</span></div><ChevronRight size={15} /></button>)}</aside><section className="document-pane" ref={documentPane}><div className="document-toolbar"><div><span className="eyebrow">READ ONLY · LIVE</span><p>{plans.find((plan) => plan.id === selected)?.relativePath}</p></div><span className="badge neutral">只读源文件</span></div>{linkNotice && <div className="document-notice" role="status">{linkNotice}</div>}<Suspense fallback={<LoadingInline />}><Markdown content={content} onLocalLink={openPlanLink} /></Suspense></section></div></div>
}

function KnowledgeView({ units, catalogs, revision }: { units: Unit[]; catalogs: Snapshot['catalogs']; revision: number }) {
  const [mode, setMode] = useState<'subjects' | 'types'>('subjects')
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [status, setStatus] = useState('all')
  const [kind, setKind] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState<{ id: string; system?: string } | null>(null)
  const [typeIndex, setTypeIndex] = useState<QuestionTypeIndex | null>(null)
  const [openType, setOpenType] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/question-types', { signal: controller.signal }).then((response) => response.json()).then(setTypeIndex).catch(() => {})
    return () => controller.abort()
  }, [revision])
  const filtered = useMemo(() => units.filter((unit) => (subject === 'all' || unit.subject === subject) && (status === 'all' || unit.status === status) && `${unit.title} ${unit.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [units, query, subject, status])
  const filteredTypes = useMemo(() => (typeIndex?.types || []).filter((item) =>
    (subject === 'all' || item.subject === subject) && (kind === 'all' || item.kind === kind) &&
    `${item.title} ${item.unitTitle} ${item.records.flatMap((record) => [record.summary, ...record.questionRefs]).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [typeIndex, subject, kind, query])
  if (selectedUnit) return <KnowledgeReader unitId={selectedUnit.id} initialSystem={selectedUnit.system} refreshKey={revision} close={() => { setSelectedUnit(null); window.scrollTo({ top: 0, behavior: 'auto' }) }} />
  return <div className="knowledge-page">
    <section className="knowledge-intro"><div><span className="eyebrow">THREE-SYSTEM KNOWLEDGE BASE</span><h2>知识、方法、薄弱点与题源逐题库</h2><p>按科目进入章节的三系统；已处理的30讲、36讲和李林880题目会在章节内的“题源逐题库”回看，不另起复盘卡。</p></div><span>{mode === 'subjects' ? `${units.length} 个单元` : `${typeIndex?.totals.types || 0} 类题型`}</span></section>
    <nav className="knowledge-mode-tabs" aria-label="知识库访问方式"><button className={mode === 'subjects' ? 'active' : ''} onClick={() => { setMode('subjects'); setQuery(''); setSubject('all') }}><LibraryBig size={17} /><div><strong>按科目</strong><span>科目 → 章节 → 三系统</span></div></button><button className={mode === 'types' ? 'active' : ''} onClick={() => { setMode('types'); setQuery(''); setSubject('all') }}><Tags size={17} /><div><strong>按题型</strong><span>题型 → 单题记录 → 薄弱点</span></div></button></nav>
    <section className="filter-bar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={mode === 'subjects' ? '搜索章节或关键词' : '搜索题型、题号或记录内容'} /></label><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="all">全部科目</option>{catalogs.map((item) => <option key={item.subject} value={item.subject}>{item.label}</option>)}</select>{mode === 'subjects' ? <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="organized">已整理</option><option value="partially-organized">已有复盘</option><option value="skeleton">待整理</option></select> : <select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">全部记录类型</option><option value="method">题型方法</option><option value="knowledge">知识与语言证据</option><option value="boundary">边界与冲突</option></select>}<span className="result-count">{mode === 'subjects' ? `${filtered.length} 个单元` : `${filteredTypes.length} 类题型`}</span></section>
    {mode === 'subjects' ? <section className="unit-table"><div className="unit-head"><span>章节</span><span>状态</span><span>复盘</span><span>更新时间</span></div>{filtered.map((unit) => <button className="unit-row" key={unit.id} onClick={() => { setSelectedUnit({ id: unit.id }); window.scrollTo({ top: 0, behavior: 'auto' }) }}><div><span className="unit-subject">{subjectLabels[unit.subject] || unit.subject}</span><h3>{unit.title}</h3><p>{unit.keywords.slice(0, 4).join(' · ') || '等待课程内容'}</p></div><div><span className={`status-pill status-${unit.status}`}>{statusLabel(unit.status)}</span></div><strong>{unit.acceptedCount || unit.reviewRefs.length || 0}</strong><time>{formatTime(unit.updatedAt, true)}</time></button>)}</section> : <QuestionTypeLibrary types={filteredTypes} openType={openType} setOpenType={setOpenType} openUnit={(id, system) => { setSelectedUnit({ id, system }); window.scrollTo({ top: 0, behavior: 'auto' }) }} />}
  </div>
}

function QuestionTypeLibrary({ types, openType, setOpenType, openUnit }: { types: QuestionTypeGroup[]; openType: string | null; setOpenType: (id: string | null) => void; openUnit: (id: string, system: string) => void }) {
  if (!types.length) return <Empty text="没有匹配到题型记录。" />
  const kindLabel = { method: '题型方法', knowledge: '知识证据', boundary: '边界 / 冲突' }
  return <section className="question-type-list">{types.map((item) => {
    const expanded = openType === item.id
    const weaknessCount = item.relatedWeaknesses.length + item.unitWeaknesses.length
    const weaknessLabel = item.relatedWeaknesses.length
      ? `${item.relatedWeaknesses.length} 个题号直接关联`
      : `${item.unitWeaknesses.length} 个同章薄弱点`
    return <article className={`question-type-card ${expanded ? 'expanded' : ''}`} key={item.id}><button className="question-type-summary" onClick={() => setOpenType(expanded ? null : item.id)} aria-expanded={expanded}><span className={`type-kind type-kind-${item.kind}`}>{kindLabel[item.kind]}</span><div><span className="unit-subject">{subjectLabels[item.subject] || item.subject} · {item.unitTitle}</span><h3>{item.title}</h3><p>{item.records[0]?.summary}</p></div><div className="type-counts"><strong>{item.records.length}</strong><span>条记录</span>{weaknessCount > 0 && <em><Target size={12} />{weaknessLabel}</em>}</div><ChevronRight size={17} /></button>{expanded && <div className="question-type-detail"><div className="record-stack"><h4>历史单题与题型记录</h4>{item.records.map((record) => <article className="question-record" key={record.id}><div><span>{record.recordType}</span><time>{formatTime(record.recordedAt, true)}</time></div><p>{record.summary}</p>{record.questionRefs.length ? <ul>{record.questionRefs.map((ref) => <li key={ref}>{ref}</li>)}</ul> : <small>该条历史增量未单列题号</small>}<footer><code>{record.sourceFile}</code><button onClick={() => openUnit(item.unitId, item.kind === 'method' ? 'methods' : 'knowledge')}>打开三系统原文<ChevronRight size={14} /></button></footer></article>)}</div><aside className="weakness-stack"><h4><Target size={15} />真实薄弱点</h4>{item.relatedWeaknesses.map((weakness) => <WeaknessCard key={weakness.record_id} item={weakness} label="题号直接关联" open={() => openUnit(item.unitId, 'weaknesses')} />)}{item.unitWeaknesses.map((weakness) => <WeaknessCard key={weakness.record_id} item={weakness} label="同章节已确认" open={() => openUnit(item.unitId, 'weaknesses')} />)}{!weaknessCount && <p className="no-weakness">本题型目前没有用户作答或追问形成的真实薄弱点。通用易错点不会在这里冒充个人薄弱点。</p>}</aside></div>}</article>
  })}</section>
}

function WeaknessCard({ item, label, open }: { item: Activity; label: string; open: () => void }) {
  return <article className="weakness-card"><span>{label}</span><strong>{item.title}</strong><p>{item.summary}</p>{item.question_refs?.length ? <small>{item.question_refs.join(' · ')}</small> : null}<button onClick={open}>查看薄弱点原文<ChevronRight size={13} /></button></article>
}

function KnowledgeReader({ unitId, initialSystem, refreshKey, close }: { unitId: string; initialSystem?: string; refreshKey: number; close: () => void }) {
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null)
  const [activeSystem, setActiveSystem] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { setDetail(null); setActiveSystem(initialSystem || null) }, [unitId, initialSystem])
  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    fetch(`/api/knowledge/${encodeURIComponent(unitId)}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(`知识文件读取失败 (${response.status})`); return response.json() })
      .then((value: KnowledgeDetail) => {
        setDetail(value)
        setActiveSystem((current) => current && value.systems.some((system) => system.key === current)
          ? current
          : value.systems.find((system) => system.activityCount > 0)?.key || value.systems[0]?.key || null)
      })
      .catch((caught) => { if (caught.name !== 'AbortError') setError(caught instanceof Error ? caught.message : '知识文件读取失败') })
    return () => controller.abort()
  }, [unitId, refreshKey])
  if (error) return <div className="knowledge-reader"><div className="knowledge-reader-header"><button className="back-button" onClick={close}><ArrowLeft size={16} />返回知识库</button></div><Empty text={error} /></div>
  if (!detail) return <div className="knowledge-reader"><LoadingInline /></div>
  const system = detail.systems.find((candidate) => candidate.key === activeSystem) || detail.systems[0]
  return <section className="knowledge-reader"><header className="knowledge-reader-header"><button className="back-button" onClick={close}><ArrowLeft size={16} />返回知识库</button><div><span className="eyebrow">{subjectLabels[detail.subject] || detail.subject} · KNOWLEDGE LIBRARY</span><h2>{detail.title}</h2><p>{detail.path}</p></div><span className={`status-pill status-${detail.status}`}>{detail.activityCount} 条确认记录</span></header><div className="knowledge-reader-layout"><aside className="system-list"><span className="eyebrow">KNOWLEDGE SYSTEMS</span>{detail.systems.map((item) => <button key={item.key} className={item.key === system?.key ? 'active' : ''} onClick={() => setActiveSystem(item.key)}><div><strong>{item.title}</strong><span>{item.filename}</span></div><em>{item.activityCount}</em></button>)}</aside><article className="system-document"><div className="system-document-meta"><div><span className="eyebrow">READ ONLY · LIVE</span><p>{system?.relativePath}</p></div><span>{system?.activityCount ? `${system.activityCount} 条活动记录` : '暂无确认增量'}</span></div>{system ? <Suspense fallback={<LoadingInline />}><Markdown content={system.content} /></Suspense> : <Empty text="该章节尚未建立三系统文件。" />}</article><DocumentOutline content={system?.content || ''} /></div></section>
}

type ReviewGroup = 'math2' | '408' | 'english2' | 'politics'

const reviewGroups: Array<{ id: ReviewGroup; label: string; caption: string }> = [
  { id: 'math2', label: '数学二', caption: '高等数学与线性代数' },
  { id: '408', label: '408', caption: '数据结构、计组、操作系统与计网' },
  { id: 'english2', label: '英语二', caption: '按年份归档的完整真题' },
  { id: 'politics', label: '政治', caption: '按模块和章节归档' },
]

function reviewGroup(review: ReviewSummary): ReviewGroup {
  return review.subject.startsWith('408.') ? '408' : review.subject as ReviewGroup
}

function reviewDisplayName(review: ReviewSummary, units: Unit[]) {
  const unit = units.find((candidate) => candidate.id === review.unitId)
  const chapter = review.unitId.match(/\.ch(\d+)$/)?.[1]
  if (review.subject === 'math2') {
    const course = review.unitId.includes('linear-algebra') ? '线性代数' : '高等数学'
    return chapter ? `${course} · 第 ${Number(chapter)} 章 · ${unit?.title || review.scope}` : `${course} · ${unit?.title || review.scope}`
  }
  if (review.subject.startsWith('408.')) {
    const course = (subjectLabels[review.subject] || review.subject).replace('408 · ', '')
    return chapter ? `${course} · 第 ${Number(chapter)} 章 · ${unit?.title || review.scope}` : `${course} · ${unit?.title || review.scope}`
  }
  if (review.subject === 'english2') {
    const year = review.unitId.match(/20\d{2}/)?.[0] || review.scope.match(/20\d{2}/)?.[0]
    return year ? `英语二真题 · ${year} 年整卷` : `英语二 · ${review.scope}`
  }
  return `政治 · ${unit?.title || review.scope.split('｜')[0]}`
}

type DocumentIndexItem = { text: string; href: string; level?: number }

function slugHeading(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
}

function documentIndex(content: string) {
  const headings: DocumentIndexItem[] = []
  const links: DocumentIndexItem[] = []
  const seenHeadings = new Set<string>()
  const seenLinks = new Set<string>()
  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,3})\s+(.+?)\s*#*$/)
    if (heading) {
      const text = heading[2].trim()
      const href = `#${slugHeading(text)}`
      if (!seenHeadings.has(href)) {
        seenHeadings.add(href)
        headings.push({ text, href, level: heading[1].length })
      }
    }
    const link = line.match(/^\s*[-*]\s+\[([^\]]+)\]\(#([^\)]+)\)/)
    if (link) {
      const text = link[1].trim()
      const href = `#${link[2].trim()}`
      if (!seenLinks.has(href)) {
        seenLinks.add(href)
        links.push({ text, href })
      }
    }
  }
  return { headings, links }
}

function DocumentOutline({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  const { headings, links } = useMemo(() => documentIndex(content), [content])
  const questionLinks = links.filter((item) => /例|题|example|choice|solution|fill|zhangyu|lilin|q\d/i.test(item.text))
  const indexLinks = questionLinks.length ? questionLinks : links
  if (!headings.length && !indexLinks.length) return null
  return <>
    <button className="document-outline-trigger" aria-label="打开题目索引" onClick={() => setOpen(true)}><ListTree size={15} />索引</button>
    <aside className={`document-outline ${open ? 'is-open' : ''}`} aria-label="正文快速索引">
      <div className="document-outline-head"><div><span className="eyebrow">QUICK INDEX</span><strong>快速索引</strong></div><button className="document-outline-close" aria-label="关闭索引" onClick={() => setOpen(false)}><X size={16} /></button></div>
      {headings.length > 0 && <nav className="document-outline-nav"><span>章节导航</span>{headings.map((item) => <a key={`heading-${item.href}`} className={`outline-level-${item.level || 1}`} href={item.href} onClick={() => setOpen(false)}>{item.text}</a>)}</nav>}
      {indexLinks.length > 0 && <nav className="document-outline-nav document-outline-questions"><span>题目索引 · {indexLinks.length}</span>{indexLinks.map((item) => <a key={`question-${item.href}`} href={item.href} onClick={() => setOpen(false)}>{item.text}</a>)}</nav>}
    </aside>
  </>
}

function ReviewsView({ reviews, units }: { reviews: ReviewSummary[]; units: Unit[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<ReviewGroup>('math2')
  const [detail, setDetail] = useState<ReviewDetail | null>(null)
  const [query, setQuery] = useState('')
  const [metaOpen, setMetaOpen] = useState(false)
  const selected = reviews.find((review) => review.id === selectedId)
  const primaryReviews = reviews.filter((review) => !review.isAddendum)
  // Implicit Li Lin/30讲/36讲 records are read from the chapter knowledge
  // library, never exposed as review-artifact tabs.
  const attachments: ReviewSummary[] = []
  const activeArtifact = reviews.find((review) => review.id === activeArtifactId) || selected
  const activeMeta = reviewGroups.find((group) => group.id === activeGroup)!
  const groupedReviews = primaryReviews.filter((review) => reviewGroup(review) === activeGroup)
  useEffect(() => { setDetail(null); if (activeArtifactId) fetch(`/api/reviews/${activeArtifactId}`).then((value) => value.json()).then(setDetail) }, [activeArtifactId])
  const visibleContent = useMemo(() => {
    if (!detail || !query) return detail?.content || ''
    const lines = detail.content.split(/\r?\n/)
    const matched = lines.map((line, index) => line.toLowerCase().includes(query.toLowerCase()) ? index : -1).filter((index) => index >= 0)
    const included = new Set<number>()
    for (const index of matched) for (let offset = Math.max(0, index - 2); offset <= Math.min(lines.length - 1, index + 4); offset += 1) included.add(offset)
    return [...included].sort((a, b) => a - b).map((index) => lines[index]).join('\n') || `没有找到“${query}”`
  }, [detail, query])
  const openReview = (id: string) => {
    setSelectedId(id)
    setActiveArtifactId(id)
    setQuery('')
    setMetaOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
  const closeReview = () => {
    setSelectedId(null)
    setActiveArtifactId(null)
    setDetail(null)
    setQuery('')
    setMetaOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  if (!selected) return <section className="review-library"><div className="library-heading"><div><span className="eyebrow">ACCEPTED REVIEWS</span><h2>复盘成品</h2><p>这里只展示章节或年份复盘；题源逐题记录请从知识库进入。</p></div><span>{primaryReviews.length} 份完整成品</span></div><nav className="review-subject-nav" aria-label="复盘科目" role="tablist">{reviewGroups.map((group) => { const count = primaryReviews.filter((review) => reviewGroup(review) === group.id).length; return <button key={group.id} role="tab" aria-selected={activeGroup === group.id} className={activeGroup === group.id ? 'active' : ''} onClick={() => setActiveGroup(group.id)}><span>{group.label}</span><small>{group.caption}</small><em>{count}</em></button> })}</nav><div className="review-level-heading"><div><span className="eyebrow">{activeGroup.toUpperCase()} REVIEW LIBRARY</span><h3>{activeMeta.label}复盘</h3></div><span>{groupedReviews.length} 个章节或年份</span></div><div className="review-library-grid">{groupedReviews.map((review) => <button key={review.id} onClick={() => openReview(review.id)}><div className="review-status"><ShieldCheck size={15} /><span>{review.artifactStatus}</span></div><strong>{reviewDisplayName(review, units)}</strong><p>{review.scope}</p><small>{review.segmentCount} 段 · {review.characterCount?.toLocaleString('zh-CN') || '—'} 字符 · {formatTime(review.acceptedAt, true)}</small><ChevronRight size={17} /></button>)}</div></section>

  return <section className="review-reader-page"><div className="reader-sticky"><div className="reader-header"><button className="back-button" onClick={closeReview}><ArrowLeft size={16} />返回{activeMeta.label}</button><div className="reader-title"><div className="reader-badges"><span className="badge success"><FileCheck2 size={13} />已接受</span><span className="badge neutral">{activeArtifact?.artifactStatus}</span></div><h2>{reviewDisplayName(selected, units)}</h2><p>{activeArtifact?.scope} · {activeArtifact?.manifestPath}</p></div><button className={`icon-button ${metaOpen ? 'active' : ''}`} aria-label="查看完整性信息" onClick={() => setMetaOpen(!metaOpen)}><ListTree size={18} /></button></div>{attachments.length > 0 && <nav className="review-artifact-tabs" aria-label="章节复盘组成"><button className={activeArtifactId === selected.id ? 'active' : ''} onClick={() => { setActiveArtifactId(selected.id); setQuery(''); setMetaOpen(false) }}>主复盘</button>{attachments.map((attachment) => <button key={attachment.id} className={activeArtifactId === attachment.id ? 'active' : ''} onClick={() => { setActiveArtifactId(attachment.id); setQuery(''); setMetaOpen(false) }}>后续补充 · {attachment.scope.replace(/^.*?｜/, '')}</button>)}</nav>}<div className="reader-tools"><label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="在当前正文中筛选（如：冲突、覆盖审计）" /></label>{query && <button className="text-button" onClick={() => setQuery('')}>清除</button>}</div></div><div className="reader-layout"><article className="review-document">{detail ? <Suspense fallback={<LoadingInline />}><Markdown content={visibleContent} /></Suspense> : <LoadingInline />}{detail && <div className="reader-end"><span>当前正文已到底</span><button className="back-button" onClick={closeReview}><ArrowLeft size={16} />返回{activeMeta.label}</button></div>}</article><DocumentOutline content={detail?.content || ''} />{metaOpen && detail && <ManifestPanel detail={detail} close={() => setMetaOpen(false)} />}</div></section>
}

function ManifestPanel({ detail, close }: { detail: ReviewDetail; close: () => void }) {
  const manifest = detail.manifest
  return <aside className="manifest-panel"><div className="manifest-head"><div><span className="eyebrow">ARTIFACT PROVENANCE</span><h3>完整性清单</h3></div><button className="icon-button" onClick={close}><X size={17} /></button></div><dl><div><dt>状态</dt><dd>{manifest.artifact_status}</dd></div><div><dt>验收时间</dt><dd>{formatTime(manifest.accepted_at, true)}</dd></div><div><dt>正文字符</dt><dd>{manifest.assembled_character_count?.toLocaleString('zh-CN')}</dd></div><div><dt>段数</dt><dd>{manifest.segment_count}</dd></div></dl><div className="hash-card"><Hash size={14} /><code>{manifest.assembled_normalized_sha256}</code></div><h4>会话段来源</h4><div className="segment-list">{manifest.segments?.map((segment: any) => <div key={segment.sequence}><span>{segment.sequence}</span><div><strong>{segment.scope}</strong><small>{segment.character_count?.toLocaleString('zh-CN')} 字符 · r{segment.revision}</small><code>{segment.normalized_sha256.slice(0, 12)}…</code></div></div>)}</div>{manifest.source_status && <><h4>来源状态</h4><pre>{JSON.stringify(manifest.source_status, null, 2)}</pre></>}</aside>
}

function LoadingInline() { return <div className="loading-inline"><RefreshCw size={18} />正在拼入完整正文…</div> }
function Empty({ text }: { text: string }) { return <div className="empty-state"><CircleDot size={18} /><p>{text}</p></div> }

export default App
