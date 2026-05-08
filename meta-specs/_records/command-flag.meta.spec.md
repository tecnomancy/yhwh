---
kind: meta-spec
id: command-flag
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Flag declaration of a CLI command. Used by CommandDecl.flags[].
target_kind: command-flag
fields:
  - name: name
    type: string
    required: true
    description: Flag name including leading dashes (e.g. --json).
  - name: takes_value
    type: boolean
    required: false
    default: false
    description: Whether the flag consumes a following value.
body_layout: []
cross_refs: []
examples: []
---

# command-flag record
