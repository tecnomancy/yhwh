import { Err, Ok, type Result } from '@tecnomancy/alchemy/result'

// Exodus 14:19–21 — three verses of 72 letters each. See docs/MANIFESTO.md.
export const SHEM = 72

export const trySync = <T>(fn: () => T): Result<T, Error> => {
  try {
    // alchemy-exempt: boundary wrapper, this IS the alchemy adapter for throwing libs
    return Ok(fn())
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)))
  }
}

export const tryAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
  try {
    // alchemy-exempt: boundary wrapper for promise-rejecting APIs
    return Ok(await fn())
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)))
  }
}
