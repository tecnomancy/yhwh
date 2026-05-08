# CLAUDE.md — yhwh

A self-referential build model: Y · Hydrate · Weave · Hatch. Spec markdown → typed semantic model → validated graph → canonical artefacts in `dist/` and `~/.claude/`. CLI binary: `hwh`. Husky gate on every commit. Philosophy: `docs/MANIFESTO.md`. Formal proof of Y: `docs/SELF-HOST-PROOF.md`.

Design principles: alchemy-first (Result/Option/pipe), tacit / point-free, HOC-side-effects, Bun-first.

## Scope

- **Production specs:** `specs/lib/**/*.spec.md` — linted by husky gate, canonical source.
- **Fixtures:** `specs/__fixtures__/{good,bad,bad-cross}/` — exercise the linter, intentionally break rules. Not linted by husky.
- **Dogfood:** `specs/self/` — yhwh describing itself (optional, not required by gate).
- Source format: frontmatter YAML + body MD + mermaid.
- Kinds: `agent | skill | flow | entity | harness | ralph`.
- Output: `dist/types.ts`, `dist/registry.json`, `dist/diagnostics.json`. Optional codegen to `~/.claude/agents/*.md` and `~/.claude/skills/*/SKILL.md` (idempotent, marker `<!-- hwh:managed -->`).

## Conventions

- Each spec has `kind`, `id` (kebab-case globally unique), `version` (monotonic semver), `status`, `owner`, `tags`.
- Cross-refs always by `id` — never by path.
- Tests in `tests/`, fixtures in `specs/__fixtures__/{good,bad}/`. Each `bad/` file violates exactly 1 rule (asserted via snapshot).
- Dogfood: `specs/self/` describes yhwh itself (agent + skill + harness + ralph).

## CLI

```
hwh lint <path>           # 3 layers: schema, structural, cross-refs
hwh lint --staged         # husky integration
hwh build <path>          # full pipeline -> dist/
hwh build <path> --codegen
hwh new <kind> <id>       # scaffold
hwh doctor                # diff specs vs artefacts in ~/.claude/
hwh watch <path>          # incremental re-lint
```

## Tech

- Bun 1.1+, TS strict bundler, ESM.
- `@tecnomancy/alchemy` (Result/pipe). No try/catch in new code (alchemy-exempt: `<reason>` on same line when unavoidable).
- `zod` per kind. `yaml` for frontmatter. mdast custom (Bun native + regex for mermaid blocks in PoC; replace with `unified` when deps are justified).
- Biome for format + lint TS.

## Do not

- Do not emit anything outside `dist/` or `~/.claude/` (explicit codegen only).
- Do not create planning markdowns (only specs and fixtures).
- No comments explaining what. Only why when non-obvious.
