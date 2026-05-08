---
kind: ralph
id: hwh-watch
version: 0.1.0
status: active
owner: example
tags:
  - loop
description: Auto-loop that re-lints the specs/ tree on a fixed cadence and reports diagnostics back.
cadence_min: 5
tick_skill: hwh-lint
report_skills:
  - hwh-lint
pause_flag_path: /tmp/hwh-watch.paused
---

# hwh-watch ralph loop

Cron-driven loop. Each tick invokes `hwh-lint`. Stops when `pause_flag_path` exists. Circuit breaker after 3 failures in 15 min window (defaults).
