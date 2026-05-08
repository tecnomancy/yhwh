---
kind: harness
id: hwh-ci
version: 0.1.0
status: active
owner: example
tags:
  - ci
description: Continuous integration harness that lints all specs on every commit and reports diagnostics.
dispatches:
  - hwh-lint
state_file: .hwh/ci-state.json
gates:
  - grant-privilege
---

# hwh-ci harness

Triggered by pre-commit hook + GitHub Action. Dispatches `hwh-lint` over the staged specs and gates against the canonical flow `grant-privilege`.
