---
kind: flow
id: malformed-flow
version: 0.1.0
status: draft
owner: example
description: Flow with mermaid block missing recognized kind — triggers structural/mermaid-invalid.
actors:
  - einstein
---

# Malformed flow

```mermaid
this is not a valid mermaid header
einstein -> nobody
```
