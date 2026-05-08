---
kind: meta-spec
id: envelope
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - envelope
description: The universal envelope every spec carries. All kinds inherit these 6 frontmatter keys plus a body Title heading.
target_kind: envelope
fields:
  - name: kind
    type: predicate
    predicate: enum:agent|skill|flow|entity|harness|ralph|project|meta-spec
    required: true
    description: Discriminator that selects the per-kind meta-spec for further validation.
  - name: id
    type: kebab-id
    required: true
    description: Globally unique kebab-case identifier. Stable across renames.
  - name: version
    type: semver
    required: true
    description: Semver MAJOR.MINOR.PATCH. Monotonic vs git HEAD (Phase 8 stretch).
  - name: status
    type: predicate
    predicate: enum:draft|active|deprecated
    required: true
    description: Lifecycle marker. Draft suppresses some cross-rules; deprecated still resolves but warns on each reference.
  - name: owner
    type: string
    required: true
    description: Maintainer handle.
  - name: tags
    type:
      array: string
    required: false
    description: Free-form taxonomy tags. Used for filtering, never for resolution.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
cross_refs: []
examples: []
---

# Envelope

Every spec, regardless of kind, opens with this YAML block plus an h1 title in the body.

The envelope is intentionally minimal: enough to identify, version, classify, and own a spec. All semantics specific to a kind live in extension keys validated by the per-kind meta-spec.
