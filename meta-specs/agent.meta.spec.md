---
kind: meta-spec
id: agent
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Agent specs declare a Claude Code subagent — system prompt, tool grants, model, and optional aura metadata.
target_kind: agent
fields:
  - name: description
    type: string
    required: true
    description: One-line agent description (10+ chars).
  - name: tools
    type:
      array: string
    required: true
    description: Tool grants this agent receives. Skills referencing this agent must request a subset.
  - name: model
    type: predicate
    predicate: enum:opus|sonnet|haiku
    required: true
    description: Claude model class.
  - name: aura
    type:
      ref: agent-aura
    required: false
    description: Optional flavor record (doctrine, resonance, index). All sub-fields optional.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: system_prompt
cross_refs: []
examples:
  - id: einstein
    raw: specs/__fixtures__/good/agent.einstein.spec.md
  - id: coordinator
    raw: specs/__fixtures__/good/agent.coordinator.spec.md
---

# Agent meta-spec

Agents are the primary actors invoked from skills and flows. Their `tools` declaration is consumed by `cross/skill-tool-not-on-agent` to verify any skill citing this agent does not request privileges the agent does not hold.
