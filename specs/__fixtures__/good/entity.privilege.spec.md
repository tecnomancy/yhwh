---
kind: entity
id: privilege
version: 0.1.0
status: active
owner: example
tags:
  - domain
description: Privilege record granted to a registered party. Status transitions are audit-tracked.
fields:
  - name: id
    type: string
  - name: holder_id
    type: string
  - name: status
    type: enum:requested|approved|active|revoked
  - name: granted_at
    type: iso8601
    required: false
invariants:
  - status:approved → status:active via skill.hwh-lint
---

# Privilege

Domain entity. Status machine modeled below.

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> approved
  approved --> active
  active --> revoked
```
