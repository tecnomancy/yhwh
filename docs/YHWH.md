# YHWH — A Self-Referential Build Model

> Y · Hydrate · Weave · Hatch.
>
> The model emerges from itself, gains semantic body, weaves execution, hatches into manifestation.

YHWH is the conceptual core of this repository. The internal project id is `yhwh` — read as a four-phase sequence: **Y** (self-referential fixed point), **H**ydrate (bytes into typed structure), **W**eave (structure into validated graph), **H**atch (graph into runtime artefacts). The four-letter Tetragrammaton is used here as a mnemonic for that sequence, not as a religious invocation.

## What this engine does today

- Interprets a spec or natural-language intent.
- Composes from a seed (`meta-specs/`, `specs/lib/`, fixtures, predicate registry).
- Identifies missing parts via cross-rule analysis and `hwh doctor` drift detection.
- Estimates what still needs to be created and turns the result into an executable, derived spec.
- Validates through three rule layers (schema, structural, cross-spec), then canonicalises and hatches into runtime artefacts.
- Gates commits via husky and CI; reports SHA-256 self-host equality across sandboxes.

## What this engine does **not** do

This is a deliberate honesty floor:

- It does **not** learn from inputs.
- It does **not** autonomously improve itself between runs.
- It does **not** evolve its grammar without an operator authoring meta-specs.
- It does **not** synthesise new primitives — the predicate registry is closed (see Lemma 4.4 in `SELF-HOST-PROOF.md`).

What the system *does* converge toward is **self-compilation through specs**: every iteration shrinks the surface that is not derivable from `M` (the meta-spec corpus). The ceiling, reached at v1.0.0, is the point at which only the predicate registry and the host runtime remain handwritten.

## The four phases

### Y — λY, the self-referential origin

> The Y combinator. The fixed point. The system whose name and substrate are the same act.

```
λY  =  λf. (λx. f (x x)) (λx. f (x x))

λY f  =  f (λY f)            -- the fixed-point equation
```

The first letter of the model *is* `λY` — Curry's untyped fixed-point operator (Curry & Feys, *Combinatory Logic* I, 1958). Given any `f`, `λY f` is an `x` with `x = f x`. The regress is closed by structural duplication `x x` at the lambda level. `λY` is the canonical formal name of *self-reference computed without an external base*.

`yhwh` realises `λY` at the type-system level. The compiler `C` is typed by `G`; `G` is the output of `C`; the equation `G = C[G](M)` is the typed analogue of `λY f = f (λY f)`, with `G* := C(M)` as its unique fixed point. Theorem 5.1 in [`SELF-HOST-PROOF.md`](SELF-HOST-PROOF.md) proves it. One-step convergence (Lemma 4.5) and acyclic primitive recursion (Lemma 4.4) replace the untyped recursion-via-self-application that makes the bare `λY` ill-typed in System F: `yhwh`'s `Y` phase is the *typed, terminating, byte-stable* shadow of `λY`, restricted to a primitive-recursive transducer.

The `Y` phase is the meta-circular fixed point: the compiler's runtime types are the compiler's own output, parameterised by canonical source `M`. Empirically verified across two physical sandboxes by SHA-256 equality across four independent measurements.

| Concern | Implementation |
|---|---|
| Compiler `C: M → G` | `src/core/meta/codegen-ts.ts:generateAllModules` |
| Type-derivation runtime | `src/core/meta/compile.ts` (the `{ref}` resolver via `z.lazy`) |
| Bootstrap atom | `meta-specs/meta-spec.meta.spec.md` (the meta-meta-spec) |
| Materialised fixed point `G*` | `src/core/schema/_generated/` (20 modules) |
| Closed primitive set | `src/core/meta/predicates.ts` |
| Empirical witness | `scripts/self-host-proof.ts` (4-phase SHA-256, bound 2⁻³⁸⁴) |
| Formal proof | `docs/SELF-HOST-PROOF.md` (5 lemmas + theorem + corollaries) |

**Invariant.** `τ(M, G₀) = (M, C(M))` for any `G₀`; `τ(M, C(M)) = (M, C(M))`. One-step convergence; idempotent thereafter.

### Hydrate — intention gains body

> Latent textual intent becomes typed structure.

The `Hydrate` phase lifts authored markdown into a typed semantic model. This is the boundary between human prose and machine grammar.

| Concern | Implementation |
|---|---|
| Bytes → CommonMark + frontmatter + mermaid | `src/core/parse.ts`, `src/core/ast/from-markdown.ts` |
| AST tagging | `src/core/ast/classify.ts` |
| AST → typed `Spec` | `src/core/semantic/load.ts` |
| Canonical form (`parse ∘ render` fixed point) | `src/core/canonicalize/{render,frontmatter-printer,block-printer,mermaid-printer,key-order}.ts` |
| Husky drift gate | `.husky/pre-commit` runs `hwh canonicalize --check` on staged specs |

**Invariant.** `render(parse(f)) ≡ f` for every `f` in `specs/lib/`, `meta-specs/`, and the good-fixture set. Verified by `tests/canonicalize.test.ts`.

### Weave — composition into operational graph

> Validated nodes become an executable composition. Agents acquire skills; skills request tools; flows resolve actors; harnesses dispatch; ralphs schedule; entities anchor invariants.

The `Weave` phase is where the hydrated specs become a coherent operational graph rather than a flat collection.

| Concern | Implementation |
|---|---|
| Kind-typed graph index | `src/core/graph.ts` |
| Three-layer validator | `src/core/rules/{schema,structural,cross}-rules.ts` |
| Cross-rules (12) | `cross/{duplicate-id, flow-actor-not-found, skill-agent-not-found, skill-tool-not-on-agent, harness-skill-not-found, harness-dispatch-not-invocable, ralph-tick-not-found, ralph-report-not-found, flow-cycle, entity-invariant-syntax, entity-invariant-skill-not-found, entity-invariant-flow-not-found}` |
| Builder cross-validator | `src/core/builder/{runtime-manifest,self-describe}.ts` (`cross/builder-{command,generator,validator}-{missing,orphan}`) |
| Composition meta-specs | `meta-specs/{harness,ralph,project}.meta.spec.md` |
| Invariant DSL parser | `src/core/invariants.ts` (`field:from → field:to via skill.<id>`) |

**Invariant.** Every cross-reference resolves; no dangling actor, no orphan dispatch, no cycle, no privilege violation. The validated graph is a directed acyclic structure that is convertible to an execution plan without further synthesis.

### Hatch — manifestation into runtime

> The validated woven graph leaves the engine and materialises as deliverables.

The `Hatch` phase is eclosion. What was a typed model becomes byte-stable artefacts on disk and (with explicit consent) entries in the operator's live runtime.

| Concern | Implementation |
|---|---|
| Registry emit (JSON + TS) | `src/core/emit/registry.ts` → `dist/registry.{json,ts}` |
| Type re-export | `src/core/emit/types.ts` → `dist/types.ts` |
| Claude Code codegen | `src/core/emit/codegen.ts` → `dist/codegen/{agents,skills}/*.md` |
| Apply to live runtime (idempotent) | `src/cli/apply.ts` — dry-run by default; `--apply` writes; respects `<!-- hwh:managed -->` marker |
| Drift detection | `src/cli/doctor.ts` — orphan / missing / unmanaged classifier |
| SDD wave loop | `src/cli/wave.ts`, `.wave/state.json`, `.wave/wave-N-progress.md` |
| Reproducible timestamps | `SOURCE_DATE_EPOCH` honoured in registry generator |

**Invariants.** (a) Hatched artefacts are byte-stable for the same hydrated input. (b) `hwh apply` never overwrites files lacking the `<!-- hwh:managed -->` marker — operator-edited content is preserved. (c) `SOURCE_DATE_EPOCH` makes `dist/registry.json` reproducible across machines.

## How the four phases compose

```mermaid
flowchart LR
  IN[(meta-specs/, specs/lib/, fixtures)]
  Y[Y · self-reference<br/>compile.ts + codegen-ts.ts<br/>→ _generated/ as G*]
  H[Hydrate · parse + canonicalize<br/>parse.ts, ast/, semantic/load.ts]
  W[Weave · graph + cross-rules<br/>graph.ts, rules/, builder/]
  HA[Hatch · emit + apply<br/>emit/, apply.ts, doctor.ts, wave.ts]
  OUT[(dist/, ~/.claude/{agents,skills})]

  Y -. provides typed shape .-> H
  IN --> H --> W --> HA --> OUT
  HA -. wave loop iterates .-> IN
```

The diagram captures the strict ordering: `Y` provides the typed grammar; `Hydrate` parses and canonicalises against that grammar; `Weave` validates cross-references; `Hatch` materialises. The wave loop closes the cycle by inviting the operator to author further specs and re-enter at `Hydrate`.

## Wave history mapped to phases

| Wave | Phase principally exercised | Outcome |
|---|---|---|
| 1 Real AST | Hydrate | mdast-based DocumentAst with byte-accurate ranges |
| 2 Canonical fixed-point | Hydrate | `parse ∘ render` idempotent; husky drift gate |
| 3 Author meta-specs | Y | the meta-meta-spec as bootstrap atom |
| 4 Compile zod from meta-specs | Y | derived schemas + parity gate |
| 5 Builder self-description | Weave | project spec ↔ runtime cross-check |
| 6 Seed retirement (logical) | Y | runtime validates from `_generated/` by default |
| 7 Physical seed retirement | Y | `_bootstrap/` isolated; strip-test green |
| 8 Records as meta-specs | Y + Weave | every record type derivable from `M`; full strip survives |

The `Hatch` phase has been incrementally productionised since wave 0 (`hwh build`, `hwh apply`, `hwh doctor`, `hwh watch`). It does not have its own bootstrap milestone because hatching is the engine's terminal act, not an internal layer to be retired.

## Naming and branding boundaries

- **Repository, project id, model.** All three share the name `yhwh`. The repo is `tecnomancy/yhwh`. The project id in the canonical project spec is `yhwh` (`specs/lib/yhwh.spec.md`). The four-phase model is `yhwh`. One name, three roles, no semantic drift.
- **Architectural pattern in the formal proof.** Treated as the `YHWH arch` in [`SELF-HOST-PROOF.md`](SELF-HOST-PROOF.md). The `arch` suffix denotes the proven *structural pattern* — the six structural conditions enumerated in §7.3 of the proof.
- **CLI binary.** `hwh` — the operational tool. Independent of the model: a build engine command, stable across renames. Compare to how `git` is the tool while a project has its own name.
- **Tecnomancy.** The parent ecosystem / GitHub organisation. `yhwh` is one repo within it; not equivalent to the org. The philosophical scaffolding linking the practice (`tecnomancy`) to the model (`yhwh`) is in [`MANIFESTO.md`](MANIFESTO.md).
- **Tecnometron.** A planned QA-oriented workflow subsystem in the same org; out of scope for this repo. The boundary is intentional: `yhwh` is the meta-definition, `tecnometron` is the validator on top of any system, including this one.

The four-phase vocabulary (`Y`, `Hydrate`, `Weave`, `Hatch`) is the **internal architectural language**. It is exposed in this document and in the README's high-level overview, but not pushed into source-file names — module names stay technical (`parse.ts`, `graph.ts`, `emit/`) so that contributors browsing the tree see implementation, not metaphor. The metaphor lives at the documentation layer.

## What exists, what is partial, what is future

### Exists

- All four phases are implemented end-to-end. The pipeline `Hydrate → Weave → Hatch` runs on every `hwh lint` / `hwh build`.
- The `Y` phase is materialised as `_generated/` and proved a fixed point under iteration (see `docs/SELF-HOST-PROOF.md`, Theorem 5.1).
- `bun test` covers all four phases (48 tests, 145 expects, default + `RUN_FROM_BOOTSTRAP=1`).
- CI gates: typecheck, lint, parity, builder cross-check, strip-bootstrap test, self-host proof, canonical drift check.

### Partial

- The wave loop (`hwh wave`) is operator-driven: the engine reports progress, the operator (or a `/loop` cron) authors the next wave's tick. There is no automatic synthesis of new specs from missing-parts diagnostics.
- The mermaid printer in the canonical layer trims raw blocks rather than re-emitting from a richer mermaid AST. Documented in wave-2 progress as a deliberate Wave-3+ refinement.
- The predicate registry is closed; adding a primitive requires an explicit code change and a re-verification of Lemma 4.4 in the proof.

### Future (not currently implemented; do not claim)

- Autonomous learning from operator corrections.
- Self-evolution of the meta-spec grammar without operator authoring.
- An inline `record` primitive in the meta-spec language (today every record requires its own meta-spec file under `_records/`).
- AI-assisted spec authoring (`hwh ai "draft a flow for X"`).
- Tecnometron — workflow QA layer.

## Glossary

| Term | Meaning in this repo |
|---|---|
| **Y** | The self-referential origin. Compiler whose types are its own output. Lemmas 4.1–4.5, Theorem 5.1 in `SELF-HOST-PROOF.md`. |
| **Hydrate** | Lifting raw markdown intent into a typed semantic model. `parse.ts` + `ast/` + `semantic/`. |
| **Weave** | Composing the hydrated specs into a validated operational graph. `graph.ts` + `rules/`. |
| **Hatch** | Materialising the woven graph as runtime artefacts. `emit/` + `apply.ts`. |
| **Seed** | The set of inputs the engine composes from: `meta-specs/`, `specs/lib/`, fixtures, predicate registry, host runtime. |
| **Hydrated spec** | A typed `Spec` value produced by `loadSpec(documentAst)`. |
| **Woven graph** | A `Graph` value (from `graph.ts`) carrying every typed spec keyed by id, with cross-references resolved. |
| **Hatched artefact** | A file in `dist/` or `~/.claude/`. |
| **Meta-spec** | A `kind: meta-spec` document under `meta-specs/`. Describes another kind. |
| **Record** | A `kind: meta-spec` document under `meta-specs/_records/` whose `target_kind` is referenced via `{ref: <kind>}` in another meta-spec. |
| **Bootstrap atom** | The single primitive set that is not derivable from `M`: the predicate registry. Treated as axiom in the formal proof. |
| **Fixed point** | `G* := C(M)` such that `τ(M, G*) = (M, G*)`. |
| **Canonical form** | The unique markdown representative of a semantic model, fixed under `parse ∘ render`. |

## Reading order for new contributors

1. This document — the model in one place.
2. [`SELF-HOST-PROOF.md`](SELF-HOST-PROOF.md) — the formal proof of the `Y` phase.
3. [`../README.md`](../README.md) — operator-facing quickstart and command reference.
4. [`../src/core/schema/README.md`](../src/core/schema/README.md) — layout of the typed runtime (`_generated/` vs `_bootstrap/`).
5. [`../meta-specs/README.md`](../meta-specs/README.md) — how meta-specs are authored.

---

*Y is the Y combinator. Hydrate gives intention body. Weave composes. Hatch makes real. The model is its own ground.*
