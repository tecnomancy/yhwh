---
kind: meta-spec
id: ralph
version: 0.1.0
status: active
owner: example
tags:
  - meta
description: Ralph specs (meta) describe an auto-loop — cadence, tick skill, report skills, pause flag, circuit breaker.
target_kind: ralph
fields:
  - name: description
    type: string
    required: true
    description: One-line ralph description (10+ chars).
  - name: cadence_min
    type: number
    required: true
    description: Loop cadence in minutes. Bounds 2..60.
  - name: tick_skill
    type: kebab-id
    required: true
    description: Skill invoked on each tick.
  - name: report_skills
    type:
      array: kebab-id
    required: false
    description: Skills invoked at the end of each cycle to report progress.
  - name: pause_flag_path
    type: string
    required: true
    description: Filesystem path that, when present, halts the loop.
  - name: circuit_breaker
    type: unknown
    required: false
    description: Object with max_failures (default 3) and window_min (default 15).
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: tick_prompt
cross_refs:
  - rule_id: cross/ralph-tick-not-found
    description: tick_skill must resolve to a registered skill.
    source:
      kind: ralph
      field: tick_skill
    target:
      kind: skill
      field: id
    level: error
  - rule_id: cross/ralph-report-not-found
    description: Each report_skills entry must resolve to a registered skill.
    source:
      kind: ralph
      field: report_skills
    target:
      kind: skill
      field: id
    level: error
examples:
  - id: hwh-watch
    raw: specs/__fixtures__/good/ralph.hwh-watch.spec.md
---

# Ralph meta-spec

Ralph is the heartbeat. A spec carries everything needed to run a long-lived loop without ad-hoc shell scripts: cadence, what to invoke, how to pause, when to break the circuit.
