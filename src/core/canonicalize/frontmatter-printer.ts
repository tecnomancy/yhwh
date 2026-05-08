import YAML from 'yaml'
import { reorder } from './key-order.js'

export const printFrontmatter = (data: Record<string, unknown>): string => {
  const ordered = reorder(data)
  const yaml = YAML.stringify(ordered, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
    defaultStringType: 'PLAIN',
    doubleQuotedAsJSON: false,
  })
  return `---\n${yaml.trimEnd()}\n---\n`
}
