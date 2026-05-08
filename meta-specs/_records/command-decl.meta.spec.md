---
kind: meta-spec
id: command-decl
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - record
description: CLI command declaration inside a project spec. Used by ProjectSpec.commands[].
target_kind: command-decl
fields:
  - name: name
    type: string
    required: true
    description: Verb shown in hwh --help.
  - name: args
    type:
      array: unknown
    required: false
    description: Positional arguments — Wave 8+ refs command-arg.
  - name: flags
    type:
      array: unknown
    required: false
    description: Flag declarations — Wave 8+ refs command-flag.
  - name: description
    type: string
    required: false
    default: ""
    description: Help text.
body_layout: []
cross_refs: []
examples: []
---

# command-decl record

Note: until the compiler implements nested {ref} chains in arrays, args/flags stay typed as unknown[]. The non-record fields and the record itself are now self-described.
