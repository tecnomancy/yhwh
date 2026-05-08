---
kind: meta-spec
id: command-arg
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: Positional argument of a CLI command. Used by CommandDecl.args[].
target_kind: command-arg
fields:
  - name: name
    type: string
    required: true
    description: Argument name.
  - name: required
    type: boolean
    required: false
    default: false
    description: Whether the argument is required.
  - name: description
    type: string
    required: false
    default: ""
    description: Help text.
body_layout: []
cross_refs: []
examples: []
---

# command-arg record
