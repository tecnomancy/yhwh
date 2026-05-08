---
kind: meta-spec
id: validator-decl
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Validator declaration inside a project spec. Used by ProjectSpec.validators[].
target_kind: validator-decl
fields:
  - name: id
    type: string
    required: true
    description: Diagnostic rule_id (e.g. cross/flow-actor-not-found).
  - name: layer
    type: predicate
    predicate: enum:syntax|structural|semantic|meta-conformance|cross|fixed-point
    required: true
    description: Validation layer this validator belongs to.
body_layout: []
cross_refs: []
examples: []
---

# validator-decl record
