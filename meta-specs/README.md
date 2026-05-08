# meta-specs/

Each `*.meta.spec.md` declares what a valid spec of a given `kind` looks like — its frontmatter fields, required body sections, cross-references, and worked examples.

## Bootstrap atom rule

`meta-spec.meta.spec.md` is the **fixed bootstrap atom**: it describes meta-specs themselves. The runtime parses it with the *handwritten* `MetaSpec` zod (`src/core/schema/meta-spec.ts`). Every other meta-spec is parsed by the same schema, but only the meta-meta-spec is allowed to be self-referential without breaking the dependency graph.

This is the single place where self-hosting accepts a primitive. Everything else flows from data.

## Contents

| File | Target kind | Notes |
|---|---|---|
| `envelope.meta.spec.md` | (n/a — universal) | Documents the 6 envelope keys every spec inherits |
| `agent.meta.spec.md` | `agent` | tools, model, aura |
| `skill.meta.spec.md` | `skill` | argument_hint, user_invocable, requires_agents, requires_tools |
| `flow.meta.spec.md` | `flow` | actors, triggers, next, mermaid required |
| `entity.meta.spec.md` | `entity` | fields, invariants (mini-DSL) |
| `harness.meta.spec.md` | `harness` | cron, dispatches, state_file, gates |
| `ralph.meta.spec.md` | `ralph` | cadence_min, tick_skill, report_skills, pause_flag_path, circuit_breaker |
| `project.meta.spec.md` | `project` | inputs, validators, generators, commands |
| `meta-spec.meta.spec.md` | `meta-spec` | the bootstrap atom (self-describing) |

## Wave 3 → Wave 4 transition

Wave 3 *authors* these documents. Wave 4 will write `src/core/meta/compile.ts` that consumes them and emits runtime zod schemas, then run a parity test against the handwritten zod set in `src/core/schema/`. Once parity holds for the full fixture set, the handwritten zod becomes redundant (Wave 6 retires it).

## Rules

- All meta-specs lint clean as `kind: meta-spec`.
- All meta-specs are canonical (`hwh canonicalize meta-specs/ --check` exits 0).
- Each `MetaField` in a meta-spec corresponds 1:1 to a `z.object` key in the handwritten zod for `target_kind`. Wave 4 will enforce this with a parity test.
