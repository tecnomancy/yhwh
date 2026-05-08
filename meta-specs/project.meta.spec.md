---
kind: meta-spec
id: project
version: 0.1.0
status: active
owner: example
tags:
  - meta
  - l3
description: Project specs (L3) self-describe a build pipeline — inputs, validators, generators, commands.
target_kind: project
fields:
  - name: description
    type: string
    required: true
    description: One-line project description (10+ chars).
  - name: canonical_spec
    type: string
    required: false
    description: Path to the canonical project spec file (this file).
  - name: inputs
    type:
      array:
        ref: input-decl
    required: false
    description: Records of {id, glob, kinds[]} declaring source globs and admitted kinds.
  - name: validators
    type:
      array:
        ref: validator-decl
    required: false
    description: Records of {id, layer} matching runtime rule ids and layer ids (syntax/structural/semantic/meta-conformance/cross/fixed-point).
  - name: generators
    type:
      array:
        ref: generator-decl
    required: false
    description: Records of {id, consumes, output_path, description}.
  - name: commands
    type:
      array:
        ref: command-decl
    required: false
    description: Records of {name, args[], flags[], description}.
  - name: waves_state_file
    type: string
    required: false
    description: Path to the SDD wave state json (defaults to .wave/state.json).
body_layout:
  - heading: (h1 title)
    required: true
    reader: plain
    emits_to: title
  - heading: (free body)
    required: false
    reader: plain
    emits_to: overview
cross_refs: []
examples:
  - id: yhwh
    raw: specs/lib/yhwh.spec.md
---

# Project meta-spec

A `kind: project` spec is the L3 self-description: it declares what the engine consumes, validates, generates, and exposes. Wave 5 will cross-validate the runtime against this spec — every CLI verb must have a `commands[]` entry; every rule_id must have a `validators[]` entry; every emitted artefact must have a `generators[]` entry.

Today this is the canonical anchor for the SDD wave workflow. Tomorrow, the meta-compiler reads it to drive the runtime itself.
