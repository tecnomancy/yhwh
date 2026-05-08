---
kind: skill
id: hwh-lint
version: 0.1.0
status: active
owner: example
tags:
  - hwh
  - lint
description: Lint yhwh spec files. Runs schema, structural and cross-ref rules.
argument_hint: "[path]"
user_invocable: true
requires_agents:
  - einstein
requires_tools:
  - Bash
  - Read
---

# hwh-lint

Run `hwh lint <path>` against the target directory. Exits 0 on zero errors, 1 otherwise.
