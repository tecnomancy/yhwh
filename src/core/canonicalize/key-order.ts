export const ENVELOPE_KEYS = ['kind', 'id', 'version', 'status', 'owner', 'tags'] as const

export const KIND_KEYS: Readonly<Record<string, readonly string[]>> = {
  agent: ['description', 'tools', 'model', 'aura'],
  skill: ['description', 'argument_hint', 'user_invocable', 'requires_agents', 'requires_tools'],
  flow: ['description', 'actors', 'triggers', 'next'],
  entity: ['description', 'fields', 'invariants'],
  harness: ['description', 'cron', 'dispatches', 'state_file', 'gates'],
  ralph: [
    'description',
    'cadence_min',
    'tick_skill',
    'report_skills',
    'pause_flag_path',
    'circuit_breaker',
  ],
  project: [
    'description',
    'canonical_spec',
    'inputs',
    'validators',
    'generators',
    'commands',
    'waves_state_file',
  ],
  'meta-spec': ['description', 'target_kind', 'fields', 'body_layout', 'cross_refs', 'examples'],
}

export const orderedKeys = (data: Record<string, unknown>): string[] => {
  const kind = typeof data.kind === 'string' ? data.kind : ''
  const known = [...ENVELOPE_KEYS, ...(KIND_KEYS[kind] ?? [])]
  const present = known.filter((k) => k in data)
  const extras = Object.keys(data)
    .filter((k) => !known.includes(k))
    .sort()
  return [...present, ...extras]
}

export const reorder = (data: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const k of orderedKeys(data)) {
    out[k] = data[k]
  }
  return out
}
