import { crossValidate, loadProjectSpec } from '../src/core/builder/self-describe.js'

const main = async (): Promise<number> => {
  const spec = await loadProjectSpec()
  if (!spec) {
    console.error('builder-cross-check: failed to load specs/lib/yhwh.spec.md')
    return 1
  }
  const ds = crossValidate(spec)
  if (ds.length === 0) {
    console.log('builder cross-check OK — project spec describes the runtime completely.')
    return 0
  }
  console.log(`builder cross-check ${ds.filter((d) => d.level === 'error').length} error(s):`)
  for (const d of ds) {
    console.log(`  [${d.level}] ${d.rule_id}: ${d.message}`)
  }
  return ds.some((d) => d.level === 'error') ? 1 : 0
}

process.exit(await main())
