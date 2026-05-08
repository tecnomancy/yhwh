# src/core/schema/ — layout post Wave 8

## Tree

```
src/core/schema/
├── README.md              ← this file
├── index.ts               ← public surface: BOTH values and types from _generated/
├── _generated/            ← canonical, emitted by `bun run hwh codegen-ts` from meta-specs/
│   ├── envelope.ts        ← KIND, ID, SEMVER, STATUS, Envelope, type Kind
│   ├── agent.ts skill.ts flow.ts entity.ts harness.ts ralph.ts project.ts meta-spec.ts
│   ├── (records) field, body-section, cross-ref, example,
│   │             input-decl, validator-decl, generator-decl,
│   │             command-decl, command-arg, command-flag,
│   │             agent-aura, envelope-field
│   └── index.ts           ← discriminatedUnion of the 8 spec kinds + type re-exports
└── _bootstrap/            ← parity reference only (Wave 6 origin, Wave 7 isolation)
    ├── envelope.ts agent.ts skill.ts flow.ts entity.ts harness.ts ralph.ts project.ts meta-spec.ts
    └── index.ts           ← rebuilds the handwritten union for parity test + RUN_FROM_BOOTSTRAP=1
```

## What changed in Wave 8

- **Records as meta-specs.** Every record type used by the engine — `Field`, `BodySection`, `CrossRef`, `Example`, `InputDecl`, `ValidatorDecl`, `GeneratorDecl`, `CommandDecl`, `CommandArg`, `CommandFlag`, `AgentAura`, `EnvelopeField` — is now described by a meta-spec under `meta-specs/_records/<name>.meta.spec.md`. The compiler resolves `{ref: <kind>}` via `z.lazy` against a registry built before the union pass.
- **Envelope is no longer special.** `meta-specs/envelope.meta.spec.md` is processed by the same pipeline; `bun run hwh codegen-ts` writes `_generated/envelope.ts` with `KIND`, `ID`, `SEMVER`, `STATUS`, `Envelope`, and `type Kind`.
- **`src/core/schema/index.ts` does not import from `_bootstrap/`.** Both runtime values AND TypeScript types come from `_generated/`. `AgentSpec.aura` is now a typed `AgentAura | undefined` (was `unknown`). `MetaSpec.fields` is `Field[]` (was `unknown[]`).
- **`schema-rules.ts` reads `Envelope` from `_generated/envelope.js`** for the partial check.
- **`scripts/strip-bootstrap-test.ts` deletes the entire `_bootstrap/` directory** (not just the per-kind files), patches `runtime-schema.ts`, the parity script, and the parity test to point at `_generated/`, runs `hwh lint` + `hwh canonicalize --check` against the good fixtures. Both exit 0. Wired into CI.

## What `_bootstrap/` is for today

Two narrow uses keep the directory in tree:

1. **Parity** — `scripts/parity-handwritten-vs-meta.ts` and `tests/parity.test.ts` import the handwritten `SpecSchema` from `_bootstrap/index.js` to assert it agrees with the derived schema across every fixture. If we delete `_bootstrap/`, parity becomes trivial (handwritten == derived). The test stays meaningful because it catches drift during refactors of the codegen.
2. **`RUN_FROM_BOOTSTRAP=1`** — `src/core/meta/runtime-schema.ts` returns the handwritten `SpecSchema` under this env flag. Used by the legacy CI job and as an escape hatch.

The strip test proves these are the *only* uses. With them patched out, the directory can vanish.

## Tag history

| tag | what it locks down |
|---|---|
| `bootstrap-complete` (Wave 6) | runtime validation flows from meta-specs by default |
| `bootstrap-complete-physical` (Wave 7) | per-kind handwritten zod isolated to `_bootstrap/` |
| `bootstrap-complete-source` (Wave 8) | every record is a meta-spec; runtime is data-derived end-to-end; `_bootstrap/` exists only for the parity reference and the RUN_FROM_BOOTSTRAP=1 fallback |

## Smoke check

```bash
bun run hwh codegen-ts                              # regenerate _generated/
bun run scripts/parity-handwritten-vs-meta.ts       # 37 files agree
bun run scripts/builder-cross-check.ts              # project spec ↔ runtime
bun test                                            # 48/0
RUN_FROM_BOOTSTRAP=1 bun test                       # 48/0
bun run scripts/strip-bootstrap-test.ts             # _bootstrap/ deleted, runtime green
bun run hwh canonicalize specs/lib/ specs/__fixtures__/good/ meta-specs/ --check
```

## Future direction (out of scope)

- Replace the parity test with a snapshot of "what the handwritten zod would look like" (regenerated alongside `_generated/`). At that point `_bootstrap/` deletes cleanly.
- Add a meta-spec inline `record` primitive to avoid creating a meta-spec file per anonymous nested record.
