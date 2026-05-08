---
kind: meta-spec
id: meta-spec
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - bootstrap
description: The bootstrap atom — describes what a valid meta-spec looks like. Parsed forever by the handwritten zod, then by itself for parity.
target_kind: meta-spec
fields:
  - name: description
    type: string
    required: true
    description: What kind this meta-spec describes (10+ chars).
  - name: target_kind
    type: string
    required: true
    description: The discriminator value of the kind this meta-spec describes (e.g. "agent", "flow", "meta-spec").
  - name: fields
    type:
      array:
        ref: field
    required: false
    description: Records of {name, type, required?, default?, predicate?, description, examples?} declaring frontmatter shape.
  - name: body_layout
    type:
      array:
        ref: body-section
    required: false
    description: Records of {heading, required, reader, emits_to} declaring required body sections.
  - name: cross_refs
    type:
      array:
        ref: cross-ref
    required: false
    description: Records of {rule_id, description, source, target, level} declaring cross-spec rules in data form.
  - name: examples
    type:
      array:
        ref: example
    required: false
    description: Records of {id, raw} pointing at canonical fixture files for this kind.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: rationale
cross_refs: []
examples:
  - id: agent
    raw: meta-specs/agent.meta.spec.md
  - id: skill
    raw: meta-specs/skill.meta.spec.md
---

# Meta-spec meta-spec — the bootstrap atom

This document describes itself. It is parsed by the handwritten zod schema in `src/core/schema/meta-spec.ts` (and only by it, until a meta-meta-meta-compiler exists, which is out of scope).

Every other meta-spec in this directory conforms to the rules listed in this file. Wave 4's parity test will assert that compiling this meta-spec into a runtime zod schema, and using that schema to validate every other meta-spec, produces the same accept/reject set as the handwritten `MetaSpecSchema`.

Once that parity holds, this file is no longer special: it is just the smallest fixed point that the rest of the system bootstraps from.
