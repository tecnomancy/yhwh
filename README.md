# yhwh

A self-referential build model: **Y · Hydrate · Weave · Hatch**.

```
Y = λf. (λx. f (x x)) (λx. f (x x))                  Y f  =  f (Y f)
```

The first letter is the **Y combinator** (Curry & Feys, *Combinatory Logic* I, 1958) — the canonical name of self-reference computed without an external base case. yhwh materialises this fixed-point equation at the type-system level: the compiler `C` is typed by `G`, and `G = C(M)` is the output of `C` — proved unique, byte-stable, and sandbox-replicable in [`docs/SELF-HOST-PROOF.md`](docs/SELF-HOST-PROOF.md) (Theorem 5.1). The fixed point is a **type-erasure fixed point** in the static compilation model: `G*` typechecks `C` at compile-time and is erased before runtime. This is structurally weaker than a runtime-reflective evaluator (SICP §4.1) and structurally weaker than Smith 1984's reflective tower; the novelty claim is narrower: deterministic, byte-stable, B-independent, cross-substrate replicability.

The repo implements a spec/workflow engine that takes authored markdown intent and produces validated, typed, byte-stable runtime artefacts. The model name `YHWH` is read as a four-phase sequence — `Y` (self-reference), `Hydrate` (intent into structure), `Weave` (structure into composition), `Hatch` (composition into runtime). The internal project id is `yhwh`. The architectural pattern is formally proven as an **idempotent self-describing codegen with type-erasure fixed point** (see [`docs/SELF-HOST-PROOF.md`](docs/SELF-HOST-PROOF.md), Theorem 5.1).

> **Honest floor.** The system does **not** learn, does **not** autonomously evolve, and does **not** synthesise new primitives. What it does is described and mapped to code in [`docs/YHWH.md`](docs/YHWH.md). What it provably does is in [`docs/SELF-HOST-PROOF.md`](docs/SELF-HOST-PROOF.md) (5 lemmas + theorem + physical-realisation argument, with an 18-reference bibliography). The philosophical scaffolding — *tecnomancy* as practice, the four-phase derivation, three principles, structural rhyme with the Tetragrammaton, references to Aristotle, Spinoza, Heidegger, Scholem, Curry — is in [`docs/MANIFESTO.md`](docs/MANIFESTO.md).

[![version](https://img.shields.io/badge/version-1.0.0-blue)](docs/SELF-HOST-PROOF.md) [![tests](https://img.shields.io/badge/bun_test-63%2F0-brightgreen)](#verification) [![parity](https://img.shields.io/badge/parity-OK_37_files-brightgreen)](#verification) [![canonical](https://img.shields.io/badge/canonical-31_files_clean-brightgreen)](#verification) [![self--host](https://img.shields.io/badge/self--host-SHA_c8de4d84...-brightgreen)](docs/SELF-HOST-PROOF.md)

> badges reflect state at v1.0.0; live status: see CI.

---

## The four phases

| Phase | Role | Key code |
|---|---|---|
| **Y** | self-referential origin; compiler whose types are its own output | `src/core/meta/{compile,codegen-ts}.ts`, `src/core/schema/_generated/`, `meta-specs/meta-spec.meta.spec.md` |
| **Hydrate** | bytes → typed semantic model; canonical form is a fixed point | `src/core/parse.ts`, `src/core/ast/`, `src/core/semantic/load.ts`, `src/core/canonicalize/` |
| **Weave** | hydrated nodes → validated operational graph (12 cross-rules + builder cross-check) | `src/core/graph.ts`, `src/core/rules/`, `src/core/builder/` |
| **Hatch** | woven graph → runtime artefacts (`dist/`, `~/.claude/{agents,skills}`) | `src/core/emit/`, `src/cli/{build,apply,doctor,watch,wave}.ts` |

Full mapping with invariants, proofs, and what-exists-vs-future in [`docs/YHWH.md`](docs/YHWH.md).

---

## Quickstart

**Prerequisites:** [Bun](https://bun.sh) runtime. If not installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then:

```bash
bun install
bun test                                            # 63/0 (default + RUN_FROM_BOOTSTRAP=1)
bun run hwh lint specs/__fixtures__/good/           # 8 specs, 0 diagnostics
bun run hwh canonicalize specs/__fixtures__/good/ --check
bun run hwh codegen-ts                              # regenerate src/core/schema/_generated/
bun run hwh build specs/__fixtures__/good/ --codegen
bun run scripts/self-host-proof.ts                  # the Y-phase witness — 4-phase SHA-256
```

---

## Commands

| Command | Phase | Purpose |
|---|---|---|
| `hwh lint <path…> [--json]` | Hydrate + Weave | three-layer validation: zod schema, structural rules, cross-spec graph |
| `hwh canonicalize <path…> [--check\|--write]` | Hydrate | render markdown from the semantic model; fixed-point under `parse ∘ render` |
| `hwh codegen-ts [--dry-run]` | Y | emit `src/core/schema/_generated/<kind>.ts` from `meta-specs/` |
| `hwh build <path…> [--codegen] [--force]` | Hatch | emit `dist/registry.{json,ts}` + `dist/types.ts`; optional codegen of Claude artefacts |
| `hwh new <kind> <id> [--force]` | Hydrate | scaffold a spec template for one of nine kinds |
| `hwh watch <path…> [--debounce-ms N]` | Hatch | re-lint on `.spec.md` change; write `dist/diagnostics.json` |
| `hwh apply [--apply]` | Hatch | idempotent write of `dist/codegen/*` to `~/.claude/`; respects `<!-- hwh:managed -->` |
| `hwh doctor [<path>…]` | Hatch | drift detection between specs and `~/.claude/{agents,skills}` |
| `hwh wave [status\|next\|tick [N]]` | (cycle) | spec-driven wave coordination; reads `.wave/state.json` |

---

## Spec kinds

Eight discriminated kinds plus eleven internal record types under `meta-specs/_records/`:

```yaml
---
kind: agent | skill | flow | entity | harness | ralph | project | meta-spec
id: kebab-case-unique
version: 0.1.0
status: draft | active | deprecated
owner: <handle>
tags: [ … ]
---
```

| Kind | Frontmatter extra | Cross-refs |
|---|---|---|
| **agent** | `tools[]`, `model`, `aura?` | tool catalogue |
| **skill** | `argument_hint`, `user_invocable`, `requires_agents[]`, `requires_tools[]` | agents exist; tools subset of agent.tools |
| **flow** | `actors[]`, `triggers[]`, `next[]` | actors are agents; no cycles in `next`; mermaid required |
| **entity** | `fields[]`, `invariants[]` | invariants reference real skills/flows |
| **harness** *(meta)* | `cron?`, `dispatches[]`, `state_file`, `gates[]` | dispatches are skills with `user_invocable=true`; gates are flows |
| **ralph** *(meta)* | `cadence_min`, `tick_skill`, `report_skills[]`, `pause_flag_path`, `circuit_breaker` | tick + report skills exist |
| **project** *(L3)* | `inputs[]`, `validators[]`, `generators[]`, `commands[]` | cross-validates against runtime manifest |
| **meta-spec** *(L2)* | `target_kind`, `fields[]`, `body_layout[]`, `cross_refs[]`, `examples[]` | bootstrap atom; describes other specs |

### Invariant mini-DSL

```
status:approved → status:active via skill.<id>
phase:open -> phase:closed via flow.<id>
state:a → state:b
```

Parsed and cross-checked: `via skill.X` requires `X` exist as a skill in the graph.

---

## Verification

`yhwh` is verified at six levels, all CI-enforced (`.github/workflows/hwh.yml`):

| Property | Tool | Guarantee |
|---|---|---|
| Parse / lint / cross-rules | `bun test` + `hwh lint` | 63 tests / 0 fail / 145 expects, both default and `RUN_FROM_BOOTSTRAP=1` |
| Canonical fixed point | `hwh canonicalize --check` | `render(parse(f)) ≡ f` for all spec files; idempotent |
| Schema parity | `scripts/parity-handwritten-vs-meta.ts` | Handwritten and derived schemas accept identical fixture set across 37 files |
| Builder self-description | `scripts/builder-cross-check.ts` | Project spec exhaustively describes runtime CLI / generators / validators |
| Source-level retirement | `scripts/strip-bootstrap-test.ts` | Deleting `src/core/schema/_bootstrap/` entirely; runtime still validates and canonicalises |
| Self-host fixed point | `scripts/self-host-proof.ts` | 4-phase SHA-256 reproducibility across two physical sandboxes; collision-resistance bound 2⁻³⁸⁴ |

Formal proof of the Y-phase fixed point: [`docs/SELF-HOST-PROOF.md`](docs/SELF-HOST-PROOF.md).

---

## Wave-based development

Spec-driven development uses *waves* (one canonical spec + a JSON state file + per-wave progress checkboxes). Wave history mapped to phases:

| Wave | Phase | Status | Tag | Outcome |
|---|---|---|---|---|
| 0 PoC seed | all | done | — | Bun + Biome + husky + alchemy-first; parse, 6 kinds, mermaid, 9 cross-rules, codegen, CLI |
| 1 Real AST | Hydrate | done | — | `mdast-util-from-markdown`; `DocumentAst` with byte-accurate ranges |
| 2 Canonical fixed-point | Hydrate | done | — | `hwh canonicalize` + husky drift gate; `render(parse(·))` idempotent |
| 3 Author meta-specs | Y | done | — | 9 meta-specs (envelope + 8 kinds); meta-meta as bootstrap atom |
| 4 Compile zod from meta-specs + parity | Y | done | — | `compile.ts` derives runtime schemas; parity script + CI gate |
| 5 Builder self-description | Weave | done | — | project spec describes runtime; cross-check gate |
| 6 Seed retirement (logical) | Y | done | `bootstrap-complete` | default validation flows from meta-specs |
| 7 Physical seed retirement | Y | done | `bootstrap-complete-physical` | handwritten zod isolated to `_bootstrap/`; strip-test green |
| 8 Records as meta-specs | Y + Weave | done | `bootstrap-complete-source` | every record type derivable from `M`; `_generated/` typed end-to-end; full strip survives |

The wave loop is drivable autonomously via `hwh wave next` + `/loop 10m` (cron-driven coder ticks).

---

## Layout

```
yhwh/
├── README.md                            ← this file
├── docs/
│   ├── YHWH.md                          ← the model — Y · Hydrate · Weave · Hatch with code mapping
│   └── SELF-HOST-PROOF.md               ← formal proof of the Y phase (5 lemmas + theorem)
├── src/
│   ├── core/
│   │   ├── ast/{types,from-markdown,classify}.ts                                  # Hydrate
│   │   ├── canonicalize/{render,frontmatter-printer,mermaid-printer,…}.ts         # Hydrate
│   │   ├── meta/{compile,codegen-ts,load-meta,predicates,runtime-schema}.ts       # Y
│   │   ├── schema/
│   │   │   ├── _generated/      ← G* — emitted by codegen-ts                      # Y
│   │   │   ├── _bootstrap/      ← parity reference; isolated since wave 7
│   │   │   ├── README.md
│   │   │   └── index.ts
│   │   ├── rules/{schema,structural,cross}-rules.ts                                # Weave
│   │   ├── emit/{registry,types,codegen}.ts                                        # Hatch
│   │   ├── builder/{runtime-manifest,self-describe}.ts                             # Weave
│   │   └── {parse,mermaid,graph,lint,diagnostics,safe,invariants,wave}.ts
│   └── cli/{lint,build,new,watch,apply,doctor,canonicalize,codegen-ts,wave}.ts
├── meta-specs/                          ← M (canonical source)
│   ├── envelope.meta.spec.md
│   ├── {agent,skill,flow,entity,harness,ralph,project,meta-spec}.meta.spec.md
│   └── _records/                        ← record types (wave 8)
├── specs/
│   ├── lib/                             ← production specs (husky-gated)
│   ├── self/                            ← dogfood; currently empty, so `hwh build specs/self/` emits 0 artefacts (no spec files authored yet)
│   └── __fixtures__/{good,bad,bad-cross}/
├── scripts/                             ← parity, builder-cross-check, strip, self-host-proof, check-fp
├── tests/                               ← 63 bun tests + golden snapshots
└── .github/workflows/hwh.yml            ← CI: typecheck, lint, canonical, parity, builder, strip, self-host, build
```

---

## Theoretical context

The four-phase model sits in a precise position relative to the literature on self-hosted compilers, definitional interpreters, and reflective systems:

- **Stronger than** Reynolds (1972) [definitional interpreters] and Steele (1978) [Rabbit Scheme self-host] on the byte-stability and substrate-independence axes.
- **Weaker than** Smith (1984) [3-Lisp reflective tower] — single-level reflection, not infinite tower.
- **Orthogonal to** Turing-completeness — the spec language is intentionally primitive-recursive (Kleene 1936), keeping validation, canonicalisation, parity, and the self-host theorem decidable.

Full motivation, lemmas, theorem, and a 17-reference bibliography (Bratman 1961, Reynolds 1972, Steele 1978, Abelson & Sussman 1985, Smith 1984, Curry & Feys 1958, Tarski 1955, Hofstadter 1979, Church 1936, Turing 1937, Knaster 1928, NIST FIPS 180-4, Spinoza 1677, …) live in [`docs/SELF-HOST-PROOF.md`](docs/SELF-HOST-PROOF.md).

---

## Reproduction

```bash
git clone https://github.com/tecnomancy/yhwh.git
cd yhwh
bun install --frozen-lockfile
bun run typecheck && bun test && RUN_FROM_BOOTSTRAP=1 bun test
bun run scripts/parity-handwritten-vs-meta.ts
bun run scripts/builder-cross-check.ts
bun run scripts/strip-bootstrap-test.ts
bun run scripts/self-host-proof.ts        # the Y-phase witness
```

Expected hash: `c8de4d84a908e8a641ac7e70619338f2a4548808028368c0168dc3c006224419` (constant across all four phases of the self-host proof).

---

## Naming and ecosystem boundaries

- This repository (`yhwh`) is the meta-definition and self-referential build model.
- `tecnomancy` (the GitHub organisation) is the parent ecosystem; `yhwh` is one of its repositories, not the whole brand.
- A planned QA-oriented workflow subsystem will be `tecnometron` — out of scope here.
- The internal project id stays `yhwh` — Y · Hydrate · Weave · Hatch — for stability of `specs/lib/yhwh.spec.md` and CI references; this is implementation-side naming and is not exposed in operator-facing copy.

The four-phase vocabulary (`Y`, `Hydrate`, `Weave`, `Hatch`) lives in documentation. Source modules retain technical names so that contributors browsing `src/core/` see implementation, not metaphor.

---

## Conventions

- Design principles: alchemy-first (Result/Option/pipe), tacit / point-free, HOC-side-effects, Bun-first.
- Boundary I/O (`Bun.file`, `YAML.parse`) wrapped in `src/core/safe.ts` with explicit `// alchemy-exempt:` annotations.
- Linter output is human-formatted by default; `--json` switches to machine-parseable.
- `hwh apply` never touches files lacking the `<!-- hwh:managed -->` marker — operator-edited content is preserved.
- Husky pre-commit gate runs `hwh lint specs/lib/` and `hwh canonicalize --check` on every staged `.spec.md`.

---

## License

MIT.
