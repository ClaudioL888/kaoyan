import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { normalizeMathDelimiters } from './math-delimiters'

function slug(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
}

type MarkdownProps = {
  content: string
  compact?: boolean
  onLocalLink?: (href: string) => void
  hideInlineQuestionIndex?: boolean
}

function removeInlineQuestionIndex(content: string) {
  return content
    .replace(/\n##\s+分组索引\s*\n(?:\s*[-*]\s+\[[^\n]+\]\(#[^)]+\)\s*\n?)+/g, '\n')
    .replace(/\n\*\*本组题目索引[:：]\*\*\s*\n(?:\s*[-*]\s+\[[^\n]+\]\(#[^)]+\)\s*\n?)+/g, '\n')
}

export default function Markdown({ content, compact = false, onLocalLink, hideInlineQuestionIndex = false }: MarkdownProps) {
  const sourceContent = hideInlineQuestionIndex ? removeInlineQuestionIndex(content) : content
  const normalizedContent = normalizeMathDelimiters(sourceContent)
  return (
    <div className={`markdown ${compact ? 'markdown--compact' : ''}`}>
      <ReactMarkdown
        skipHtml
        urlTransform={(url) => /^[A-Za-z]:[\\/]/.test(url) ? url : defaultUrlTransform(url)}
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{
          h1: ({ children }) => <h1 id={slug(String(children))}>{children}</h1>,
          h2: ({ children }) => <h2 id={slug(String(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slug(String(children))}>{children}</h3>,
          a: ({ href, children }) => {
            const target = href || ''
            const isWebLink = /^(https?:|mailto:)/i.test(target)
            const isHeadingLink = target.startsWith('#')
            if (onLocalLink && target && !isWebLink && !isHeadingLink) {
              return <a href={target} onClick={(event) => { event.preventDefault(); onLocalLink(target) }}>{children}</a>
            }
            return <a href={target} target={isWebLink ? '_blank' : undefined} rel={isWebLink ? 'noreferrer' : undefined}>{children}</a>
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  )
}
