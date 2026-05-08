---
kind: meta-spec
id: flow
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Flow specs describe a business process — actors, triggers, next-flows, and a required mermaid diagram.
target_kind: flow
fields:
  - name: description
    type: string
    required: true
    description: One-line flow description (10+ chars).
  - name: actors
    type:
      array: kebab-id
    required: false
    description: Agents that participate in this flow.
  - name: triggers
    type:
      array: string
    required: false
    description: Free-form event names that initiate the flow.
  - name: next
    type:
      array: kebab-id
    required: false
    description: Successor flow ids. Cycle detection runs over this graph.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (mermaid block)
    required: true
    reader: mermaid
    emits_to: diagram
cross_refs:
  - rule_id: cross/flow-actor-not-found
    description: Every actor entry must resolve to a registered agent.
    source:
      kind: flow
      field: actors
    target:
      kind: agent
      field: id
    level: error
  - rule_id: cross/flow-cycle
    description: The directed graph formed by `next` must be acyclic.
    source:
      kind: flow
      field: next
    target:
      kind: flow
      field: id
    level: error
  - rule_id: structural/flow-needs-mermaid
    description: Flow body must contain at least one mermaid block.
    source:
      kind: flow
      field: diagram
    target:
      kind: flow
      field: id
    level: error
examples:
  - id: grant-privilege
    raw: specs/__fixtures__/good/flow.grant-privilege.spec.md
---

# Flow meta-spec

Flows compose actors and triggers into an executable sequence. The mermaid diagram is the human-readable record; the `actors` and `next` lists are the machine-checkable graph.
