---
kind: flow
id: grant-privilege
version: 0.1.0
status: active
owner: example
tags:
  - privilege
  - approval
description: Coordinator approves a privilege grant request, director ratifies, registry updates.
actors:
  - coordinator
  - director
triggers:
  - request_received
---

# Grant Privilege Flow

```mermaid
sequenceDiagram
  participant coordinator
  participant director
  coordinator->>director: forward approved request
  director-->>coordinator: ratification
```

The coordinator forwards an approved request, director ratifies and persists state.
