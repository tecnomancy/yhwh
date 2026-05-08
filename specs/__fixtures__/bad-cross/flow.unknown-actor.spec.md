---
kind: flow
id: unknown-actor
version: 0.1.0
status: draft
owner: example
description: Flow declaring an actor with no matching agent spec. Triggers cross/flow-actor-not-found.
actors:
  - alpha
  - ghost-actor
---

# Unknown actor flow

```mermaid
sequenceDiagram
  participant alpha
  participant ghost_actor
  alpha->>ghost_actor: ping
```
