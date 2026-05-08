---
kind: meta-spec
id: envelope-field
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Reserved alias for the field record when it lives inside the envelope meta-spec. Identical shape to field.
target_kind: envelope-field
fields:
  - name: name
    type: string
    required: true
    description: Field key.
  - name: type
    type: unknown
    required: true
    description: Primitive or composite.
  - name: required
    type: boolean
    required: false
    default: true
    description: Required by default.
  - name: predicate
    type: string
    required: false
    description: Predicate id.
  - name: description
    type: string
    required: true
    description: Human description.
body_layout: []
cross_refs: []
examples: []
---

# envelope-field record

Pure alias of `field` for the envelope target_kind. Kept distinct in case the envelope meta-spec evolves separately.
