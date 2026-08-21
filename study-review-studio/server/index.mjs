import express from 'express'
import chokidar from 'chokidar'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'
import { KB_ROOT, PLAN_ROOT, loadKnowledgeUnit, loadPlan, loadQuestionTypeIndex, loadReview, loadSnapshot } from './data.mjs'

const app = express()
const port = Number(process.env.PORT || 4173)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const clients = new Set()
let revision = 1
let pendingTimer

app.disable('x-powered-by')
app.get('/api/health', (_request, response) => response.json({ ok: true, revision }))
app.get('/api/snapshot', async (_request, response, next) => {
  try { response.json({ revision, ...(await loadSnapshot()) }) } catch (error) { next(error) }
})
app.get('/api/plans/:id', async (request, response, next) => {
  try {
    const result = await loadPlan(request.params.id)
    if (!result) return response.status(404).json({ error: 'Plan not found' })
    response.json(result)
  } catch (error) { next(error) }
})
app.get('/api/knowledge/:id', async (request, response, next) => {
  try {
    const result = await loadKnowledgeUnit(request.params.id)
    if (!result) return response.status(404).json({ error: 'Knowledge unit not found' })
    response.json(result)
  } catch (error) { next(error) }
})
app.get('/api/question-types', async (_request, response, next) => {
  try { response.json(await loadQuestionTypeIndex()) } catch (error) { next(error) }
})
app.get('/api/reviews/:id', async (request, response, next) => {
  try {
    const result = await loadReview(request.params.id)
    if (!result) return response.status(404).json({ error: 'Review not found' })
    response.json(result)
  } catch (error) { next(error) }
})
app.get('/api/events', (request, response) => {
  response.setHeader('Content-Type', 'text/event-stream')
  response.setHeader('Cache-Control', 'no-cache')
  response.setHeader('Connection', 'keep-alive')
  response.flushHeaders()
  response.write(`event: ready\ndata: ${JSON.stringify({ revision })}\n\n`)
  clients.add(response)
  request.on('close', () => clients.delete(response))
})

function broadcast(kind, changedPath) {
  revision += 1
  const payload = JSON.stringify({ revision, kind, path: changedPath, at: new Date().toISOString() })
  for (const client of clients) client.write(`event: change\ndata: ${payload}\n\n`)
}

const watcher = chokidar.watch([KB_ROOT, PLAN_ROOT], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 180, pollInterval: 50 },
  ignored: /(^|[/\\])(?:\.git|__pycache__|\.stage-a-tmp)([/\\]|$)/,
})
watcher.on('all', (kind, changedPath) => {
  clearTimeout(pendingTimer)
  pendingTimer = setTimeout(() => broadcast(kind, path.basename(changedPath)), 140)
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')))
  app.use((_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')))
} else {
  const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
})

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Study Review Studio: http://127.0.0.1:${port}`)
})

async function shutdown() {
  await watcher.close()
  server.close(() => process.exit(0))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
