function replaceOutsideInlineCode(line: string) {
  let output = ''
  let index = 0
  let codeFence = ''

  while (index < line.length) {
    if (line[index] === '`') {
      let end = index + 1
      while (line[end] === '`') end += 1
      const run = line.slice(index, end)
      if (!codeFence) codeFence = run
      else if (codeFence === run) codeFence = ''
      output += run
      index = end
      continue
    }

    if (!codeFence) {
      const delimiter = line.startsWith('\\(', index)
        ? { close: '\\)', replacement: '$' }
        : line.startsWith('\\[', index)
          ? { close: '\\]', replacement: '$$' }
          : null
      if (delimiter) {
        const closeAt = line.indexOf(delimiter.close, index + 2)
        const nextCode = line.indexOf('`', index + 2)
        if (closeAt >= 0 && (nextCode < 0 || closeAt < nextCode)) {
          output += delimiter.replacement + line.slice(index + 2, closeAt) + delimiter.replacement
          index = closeAt + 2
          continue
        }
      }
    }

    output += line[index]
    index += 1
  }
  return output
}

function promoteInlineMathCode(line: string) {
  return line.replace(/`([^`\n]+)`/g, (full, value: string) => {
    const looksLikeMath = /(?:[A-Za-z][A-Za-z0-9_']*\s*[=<>≤≥]|\b(?:arctan|arcsin|arccos|sin|cos|tan|ln|log|lim|dy|dx)\b|[A-Za-z]\s*\^|[A-Za-z]\s*\{|\\(?:frac|sqrt|int|sum|lim)|[∫Σ]|[₀₁₂₃₄₅₆₇₈₉])/u.test(value)
    return looksLikeMath ? `$${value}$` : full
  })
}

export function normalizeMathDelimiters(content: string) {
  let fenceCharacter = ''
  let fenceLength = 0

  return content.split(/\r?\n/).map((line) => {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (fence) {
      const marker = fence[1]
      const character = marker[0]
      if (!fenceCharacter) {
        fenceCharacter = character
        fenceLength = marker.length
      } else if (character === fenceCharacter && marker.length >= fenceLength) {
        fenceCharacter = ''
        fenceLength = 0
      }
      return line
    }
    if (fenceCharacter) return line
    if (line.trim() === '\\[') return line.replace('\\[', () => '$$')
    if (line.trim() === '\\]') return line.replace('\\]', () => '$$')
    return promoteInlineMathCode(replaceOutsideInlineCode(line))
  }).join('\n')
}
