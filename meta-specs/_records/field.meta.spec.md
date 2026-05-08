---
kind: meta-spec
id: field
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: A frontmatter field declaration inside a meta-spec. Used by MetaSpec.fields[].
target_kind: field
fields:
  - name: name
    type: string
    required: true
    description: Field key as it appears in YAML frontmatter.
  - name: type
    type: unknown
    required: true
    description: Primitive name string OR composite — {array}, {ref}, {enum}.
  - name: required
    type: boolean
    required: false
    default: true
    description: Whether the field must be present in conformant specs.
  - name: default
    type: unknown
    required: false
    description: Default value applied when the field is omitted.
  - name: predicate
    type: string
    required: false
    description: Predicate id (kebab-id, semver, iso8601, glob, or enum:a|b|c).
  - name: description
    type: string
    required: true
    description: Human description of the field.
  - name: examples
    type:
      array: unknown
    required: false
    description: Example values that should be accepted.
body_layout: []
cross_refs: []
examples: []
---

# field record

Each entry in MetaSpec.fields[] conforms to this record meta-spec. The runtime resolves `{ref: field}` by inlining this schema.
