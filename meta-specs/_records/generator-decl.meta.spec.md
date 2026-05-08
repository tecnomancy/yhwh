---
kind: meta-spec
id: generator-decl
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Generator declaration inside a project spec. Used by ProjectSpec.generators[].
target_kind: generator-decl
fields:
  - name: id
    type: kebab-id
    required: true
    description: Generator id.
  - name: consumes
    type: predicate
    predicate: enum:spec|graph|meta
    required: true
    description: What this generator consumes.
  - name: output_path
    type: string
    required: true
    description: Output path (may include placeholders like <id>).
  - name: description
    type: string
    required: true
    description: Human description.
body_layout: []
cross_refs: []
examples: []
---

# generator-decl record
