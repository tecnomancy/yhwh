---
kind: meta-spec
id: input-decl
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Source input declaration inside a project spec. Used by ProjectSpec.inputs[].
target_kind: input-decl
fields:
  - name: id
    type: kebab-id
    required: true
    description: Stable id of this input source.
  - name: glob
    type: glob
    required: true
    description: File glob that selects the source files.
  - name: kinds
    type:
      array: string
    required: false
    description: Spec kinds admitted by this input.
body_layout: []
cross_refs: []
examples: []
---

# input-decl record

One entry per source glob in a project spec.
