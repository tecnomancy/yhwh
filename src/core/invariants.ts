import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'

export type InvariantRef = { kind: 'skill' | 'flow'; id: string }

export type Invariant = {
  field: string
  from: string
  to: string
  via: InvariantRef | null
  raw: string
}

const RE =
  /^([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z0-9_-]+)\s*(?:→|->|=>)\s*\1:([a-zA-Z0-9_-]+)(?:\s+via\s+(skill|flow)\.([a-z][a-z0-9-]*))?$/

export const parseInvariant = (raw: string): Result<Invariant, string> => {
  const m = RE.exec(raw.trim())
  if (!m)
    return Err(
      `invariant must match "<field>:<from> → <field>:<to> [via skill.<id>|flow.<id>]" — got: ${raw}`,
    )
  const [, field, from, to, kind, id] = m
  return Ok({
    field: field ?? '',
    from: from ?? '',
    to: to ?? '',
    via: kind && id ? { kind: kind as 'skill' | 'flow', id } : null,
    raw,
  })
}

export const parseInvariants = (
  raws: string[],
): { ok: Invariant[]; errors: { raw: string; reason: string }[] } => {
  const ok: Invariant[] = []
  const errors: { raw: string; reason: string }[] = []
  for (const r of raws) {
    const p = parseInvariant(r)
    if (p.ok) ok.push(p.value)
    else errors.push({ raw: r, reason: p.error })
  }
  return { ok, errors }
}
