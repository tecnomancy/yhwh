---
kind: meta-spec
id: cross-ref
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Declarative cross-spec rule. Used by MetaSpec.cross_refs[].
target_kind: cross-ref
fields:
  - name: rule_id
    type: string
    required: true
    description: Diagnostic id emitted when this rule fires (e.g. cross/flow-actor-not-found).
  - name: description
    type: string
    required: true
    description: Human description of the invariant.
  - name: source
    type: unknown
    required: true
    description: Object with kind and field naming where the reference originates.
  - name: target
    type: unknown
    required: true
    description: Object with kind and field (always id) naming where the reference resolves.
  - name: level
    type: predicate
    predicate: enum:error|warning
    required: false
    default: error
    description: Diagnostic severity.
body_layout: []
cross_refs: []
examples: []
---

# cross-ref record

Each entry in MetaSpec.cross_refs[]. Wave 4+ compiles these into runtime cross-rules.
