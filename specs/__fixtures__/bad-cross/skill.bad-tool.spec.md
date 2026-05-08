---
kind: skill
id: bad-tool
version: 0.1.0
status: active
owner: example
description: Requires a tool not granted to the requested agent. Triggers cross/skill-tool-not-on-agent.
user_invocable: true
requires_agents:
  - alpha
requires_tools:
  - Bash
---

# bad-tool

alpha has only [Read]; this skill requires Bash. Cross-ref linter must catch.
