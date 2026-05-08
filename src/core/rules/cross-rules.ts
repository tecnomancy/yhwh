import type { Diagnostic } from '../diagnostics.js'
import type { Graph } from '../graph.js'
import { checkFlowActorsExist, checkFlowNextNoCycles } from './cross-rules/actors.js'
import {
  checkHarnessDispatchUserInvocable,
  checkHarnessDispatchesSkills,
} from './cross-rules/dispatches.js'
import { checkEntityInvariants } from './cross-rules/entity-invariants.js'
import { checkRalphTickAndReports } from './cross-rules/ralph.js'
import {
  checkSkillRequiredAgents,
  checkSkillToolsSubsetOfAgents,
} from './cross-rules/requires-tools.js'

export {
  checkEntityInvariants,
  checkFlowActorsExist,
  checkFlowNextNoCycles,
  checkHarnessDispatchesSkills,
  checkHarnessDispatchUserInvocable,
  checkRalphTickAndReports,
  checkSkillRequiredAgents,
  checkSkillToolsSubsetOfAgents,
}

export const validateCrossRefs = (g: Graph): Diagnostic[] => [
  ...checkFlowActorsExist(g),
  ...checkSkillRequiredAgents(g),
  ...checkSkillToolsSubsetOfAgents(g),
  ...checkHarnessDispatchesSkills(g),
  ...checkHarnessDispatchUserInvocable(g),
  ...checkRalphTickAndReports(g),
  ...checkFlowNextNoCycles(g),
  ...checkEntityInvariants(g),
]
