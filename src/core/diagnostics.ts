export type DiagnosticLevel = 'error' | 'warning' | 'info'

export type Diagnostic = {
  spec_id: string | null
  file: string
  line: number
  rule_id: string
  level: DiagnosticLevel
  message: string
  suggestion?: string
}

export const formatHuman = (d: Diagnostic): string => {
  const where = `${d.file}:${d.line}`
  const id = d.spec_id ? ` [${d.spec_id}]` : ''
  const tail = d.suggestion ? `\n    suggestion: ${d.suggestion}` : ''
  return `${d.level.toUpperCase()}  ${d.rule_id}${id}\n  at ${where}\n  ${d.message}${tail}`
}

export const hasError = (ds: Diagnostic[]): boolean => ds.some((d) => d.level === 'error')

export const sortDiagnostics = (ds: Diagnostic[]): Diagnostic[] =>
  [...ds].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
