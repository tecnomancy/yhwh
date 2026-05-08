---
kind: meta-spec
id: entity
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Entity specs model a domain entity — typed fields and parseable transition invariants.
target_kind: entity
fields:
  - name: description
    type: string
    required: true
    description: One-line entity description (10+ chars).
  - name: fields
    type:
      array: unknown
    required: true
    description: User-facing entity field records. Free-form to allow domain-specific shapes; not bound to the meta-spec field record.
  - name: invariants
    type:
      array: string
    required: false
    description: Strings parsed by the invariants mini-DSL — "field:from → field:to [via skill.id|flow.id]".
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (mermaid block)
    required: false
    reader: mermaid
    emits_to: diagram
cross_refs:
  - rule_id: cross/entity-invariant-syntax
    description: Each invariant string must parse with the invariant mini-DSL.
    source:
      kind: entity
      field: invariants
    target:
      kind: entity
      field: id
    level: error
  - rule_id: cross/entity-invariant-skill-not-found
    description: An invariant `via skill.X` requires X to be a registered skill.
    source:
      kind: entity
      field: invariants
    target:
      kind: skill
      field: id
    level: error
  - rule_id: cross/entity-invariant-flow-not-found
    description: An invariant `via flow.X` requires X to be a registered flow.
    source:
      kind: entity
      field: invariants
    target:
      kind: flow
      field: id
    level: error
examples:
  - id: privilege
    raw: specs/__fixtures__/good/entity.privilege.spec.md
---

# Entity meta-spec

Entities are the typed nouns the rest of the graph operates on. Invariants are mini-DSL transition predicates: `status:approved → status:active via skill.hwh-lint` declares both a permitted transition and the skill required to perform it.
