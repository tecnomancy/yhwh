---
kind: meta-spec
id: agent-aura
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Optional flavor metadata attached to an agent — doctrine, resonance, index. All fields optional.
target_kind: agent-aura
fields:
  - name: doctrine
    type: string
    required: false
    description: Free-form doctrine label.
  - name: resonance
    type:
      array: string
    required: false
    description: Resonance keywords.
  - name: index
    type:
      array: number
    required: false
    description: Numeric index sequence.
body_layout: []
cross_refs: []
examples: []
---

# agent-aura record

Used by AgentSpec.aura to type the optional flavor metadata as a real record.
