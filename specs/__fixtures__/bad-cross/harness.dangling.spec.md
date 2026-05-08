---
kind: harness
id: dangling
version: 0.1.0
status: draft
owner: example
description: Harness dispatching a skill that does not exist in the registry. Triggers cross/harness-skill-not-found.
dispatches:
  - no-such-skill
state_file: .hwh/dangling.json
---

# Dangling harness
