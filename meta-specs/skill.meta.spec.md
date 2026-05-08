---
kind: meta-spec
id: skill
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Skill specs declare a Claude Code skill — argument hint, invocability, agent and tool requirements.
target_kind: skill
fields:
  - name: description
    type: string
    required: true
    description: One-line skill description (10+ chars).
  - name: argument_hint
    type: string
    required: false
    description: Inline hint shown in CLI help, e.g. "[wave-number]".
  - name: user_invocable
    type: boolean
    required: true
    default: false
    description: Whether the skill is exposed via slash command. Harnesses can only dispatch invocable skills.
  - name: requires_agents
    type:
      array: kebab-id
    required: false
    description: Agent ids this skill needs to execute.
  - name: requires_tools
    type:
      array: string
    required: false
    description: Tool grants the executing agent must hold.
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: instructions
cross_refs:
  - rule_id: cross/skill-agent-not-found
    description: Every requires_agents entry must resolve to a registered agent.
    source:
      kind: skill
      field: requires_agents
    target:
      kind: agent
      field: id
    level: error
  - rule_id: cross/skill-tool-not-on-agent
    description: Every requires_tools entry must be a subset of every required agent's tools.
    source:
      kind: skill
      field: requires_tools
    target:
      kind: agent
      field: id
    level: error
examples:
  - id: hwh-lint
    raw: specs/__fixtures__/good/skill.hwh-lint.spec.md
---

# Skill meta-spec

Skills are how the operator (or a harness) invokes work. The `requires_*` fields are the contract: the engine refuses to lint a skill that asks for tools its agents don't hold.
