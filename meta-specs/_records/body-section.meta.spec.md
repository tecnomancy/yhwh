---
kind: meta-spec
id: body-section
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: A required body section declaration inside a meta-spec. Used by MetaSpec.body_layout[].
target_kind: body-section
fields:
  - name: heading
    type: string
    required: true
    description: Heading text or pseudo-marker like (h1 title) or (mermaid block).
  - name: required
    type: boolean
    required: false
    default: false
    description: Whether the section must appear in the body.
  - name: reader
    type: predicate
    predicate: enum:plain|list|table|mermaid|steps
    required: true
    description: Block reader to invoke for this section.
  - name: emits_to
    type: string
    required: true
    description: Semantic field name that receives the parsed payload.
body_layout: []
cross_refs: []
examples: []
---

# body-section record

Each entry in MetaSpec.body_layout[]. Drives per-kind body classification.
