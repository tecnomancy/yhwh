import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'

export type Predicate = (value: unknown) => Result<void, string>

const isString = (v: unknown): v is string => typeof v === 'string'

const re =
  (pattern: RegExp, msg: string): Predicate =>
  (v) =>
    isString(v) && pattern.test(v) ? Ok(undefined) : Err(msg)

export const PREDICATES: Readonly<Record<string, Predicate>> = {
  'kebab-id': re(/^[a-z][a-z0-9-]*$/, 'expected kebab-case id'),
  semver: re(/^\d+\.\d+\.\d+$/, 'expected semver MAJOR.MINOR.PATCH'),
  iso8601: re(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/,
    'expected ISO8601 datetime',
  ),
  glob: (v) => (isString(v) && v.length > 0 ? Ok(undefined) : Err('expected non-empty glob')),
  string: (v) => (isString(v) ? Ok(undefined) : Err('expected string')),
  number: (v) => (typeof v === 'number' ? Ok(undefined) : Err('expected number')),
  boolean: (v) => (typeof v === 'boolean' ? Ok(undefined) : Err('expected boolean')),
}

export const enumPredicate =
  (values: readonly string[]): Predicate =>
  (v) =>
    isString(v) && values.includes(v) ? Ok(undefined) : Err(`expected one of: ${values.join(', ')}`)

export const resolvePredicate = (id: string): Predicate => {
  if (id.startsWith('enum:')) return enumPredicate(id.slice(5).split('|'))
  return PREDICATES[id] ?? ((_v) => Err(`unknown predicate: ${id}`))
}
