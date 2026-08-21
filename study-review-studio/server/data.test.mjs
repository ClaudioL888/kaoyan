import test from 'node:test'
import assert from 'node:assert/strict'
import { filterSupersededReviews, loadKnowledgeUnit, loadQuestionTypeIndex, loadReview, loadSnapshot } from './data.mjs'

test('new review manifests can supersede old review cards without deleting evidence', () => {
  const reviews = [
    { id: 'old', supersedesReviewIds: [] },
    { id: 'new', supersedesReviewIds: ['old'] },
  ]
  assert.deepEqual(filterSupersededReviews(reviews).map((review) => review.id), ['new'])
})

test('snapshot exposes the live four-subject knowledge system', async () => {
  const snapshot = await loadSnapshot()
  assert.equal(snapshot.totals.units, 62)
  assert.ok(snapshot.totals.activities >= 98)
  assert.ok(snapshot.reviews.length >= 9)
  assert.ok(snapshot.plans.length >= 5)
  assert.ok(snapshot.catalogs.some((catalog) => catalog.subject === 'math2'))
  assert.ok(snapshot.catalogs.some((catalog) => catalog.subject === 'english2'))
  assert.ok(snapshot.reviews.some((review) => review.scope.includes('数二高数第一章') && review.artifactStatus === 'exact-assembled'))
  assert.ok(snapshot.reviews.some((review) => review.scope.includes('数二高数第二章') && review.artifactStatus === 'exact-assembled'))
  assert.ok(snapshot.reviews.some((review) => review.scope.includes('2010年英语二整卷') && review.artifactStatus === 'exact-assembled'))
  assert.ok(snapshot.reviews.some((review) => review.scope.includes('数据结构第一章') && review.artifactStatus === 'exact-assembled'))
  const lilin = snapshot.reviews.find((review) => review.scope.includes('李林880'))
  assert.ok(lilin?.isAddendum)
  assert.deepEqual(lilin.appliesToUnitIds, ['math2.calculus.ch01', 'math2.calculus.ch02', 'math2.calculus.ch03'])
  assert.equal(snapshot.totals.reviews, snapshot.reviews.filter((review) => !review.isAddendum).length)
})

test('assembled review resolves to its exact markdown', async () => {
  const review = await loadReview('2026-08-21_1315_2011-full-paper')
  assert.ok(review)
  assert.equal(review.manifest.artifact_status, 'exact-assembled')
  assert.equal(review.manifest.segment_count, 9)
  assert.match(review.content, /2011 年英语二/)
})

test('migrated review resolves through its native integrity manifest', async () => {
  const snapshot = await loadSnapshot()
  const legacy = snapshot.reviews.find((review) => review.scope.includes('2010年英语二整卷'))
  assert.ok(legacy)
  assert.equal(legacy.artifactStatus, 'exact-assembled')
  const detail = await loadReview(legacy.id)
  assert.ok(detail)
  assert.equal(detail.manifest.artifact_status, 'exact-assembled')
  assert.equal(detail.manifest.segment_count, 2)
  assert.match(detail.content, /2010/)
})

test('knowledge units expose the real subject-specific systems', async () => {
  const math = await loadKnowledgeUnit('math2.calculus.ch02')
  assert.ok(math)
  assert.ok(math.systems.slice(0, 3).map((system) => system.key).every((key, index) => key === ['knowledge', 'methods', 'weaknesses'][index]))
  assert.ok(math.systems.some((system) => system.key === 'source-questions'))
  assert.ok(math.activityCount > 0)
  assert.match(math.systems.find((system) => system.key === 'methods').content, /数列|极限/)

  const mathCh01 = await loadKnowledgeUnit('math2.calculus.ch01')
  const ch01SourceQuestions = mathCh01.systems.find((system) => system.key === 'source-questions')
  assert.ok(ch01SourceQuestions)
  assert.match(ch01SourceQuestions.content, /基础选择题 001/)
  assert.match(ch01SourceQuestions.content, /单调函数/)

  const mathCh03 = await loadKnowledgeUnit('math2.calculus.ch03')
  const ch03SourceQuestions = mathCh03.systems.find((system) => system.key === 'source-questions')
  assert.ok(ch03SourceQuestions)
  assert.match(ch03SourceQuestions.content, /张宇36讲 · 第3章 · 例3\.1/)
  assert.doesNotMatch(ch03SourceQuestions.content, /Zhangyu-36 Ch03 Example/i)

  const english = await loadKnowledgeUnit('english2.reading-a')
  assert.ok(english)
  assert.deepEqual(english.systems.map((system) => system.key), ['knowledge', 'methods', 'rules', 'weaknesses'])

  const dataStructures = await loadKnowledgeUnit('408.data-structures.ch01')
  assert.ok(dataStructures)
  assert.deepEqual(dataStructures.systems.map((system) => system.key), ['knowledge', 'methods', 'weaknesses'])
  assert.ok(dataStructures.activityCount > 0)

  const politics = await loadKnowledgeUnit('politics.marxism')
  assert.ok(politics)
  assert.deepEqual(politics.systems.map((system) => system.key), ['knowledge', 'boundaries', 'methods', 'weaknesses'])
})

test('question-type index exposes source-linked records and only explicit weaknesses', async () => {
  const index = await loadQuestionTypeIndex()
  assert.ok(index.totals.types > 30)
  assert.equal(index.totals.weaknesses, 4)
  assert.ok(index.types.some((group) => group.title.includes('有限项n次根取最大项')))
  assert.ok(index.types.some((group) => group.subject === '408.data-structures' && group.records.some((record) => record.questionRefs.length)))
  assert.ok(index.types.every((group) => group.records.every((record) => record.sourceFile)))
  assert.ok(index.types.flatMap((group) => [...group.relatedWeaknesses, ...group.unitWeaknesses]).every((item) => item.record_type === 'user-weakness'))
})
