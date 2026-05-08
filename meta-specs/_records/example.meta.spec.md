---
kind: meta-spec
id: example
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Pointer to a canonical fixture file demonstrating this kind. Used by MetaSpec.examples[].
target_kind: example
fields:
  - name: id
    type: kebab-id
    required: true
    description: Spec id of the example fixture.
  - name: raw
    type: string
    required: true
    description: Repo-relative path to the fixture file.
body_layout: []
cross_refs: []
examples: []
---

# example record

Used to wire a meta-spec to one or more concrete fixture files.
