---
kind: ralph
id: bad-tick
version: 0.1.0
status: draft
owner: example
description: Ralph loop pointing at a tick_skill that is not registered. Triggers cross/ralph-tick-not-found.
cadence_min: 5
tick_skill: missing-skill
pause_flag_path: /tmp/bad-tick.paused
---

# Bad tick
