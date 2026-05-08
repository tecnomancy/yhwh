---
kind: entity
id: bad-invariant
version: 0.1.0
status: draft
owner: example
description: Entity with invariant referencing an unknown skill — triggers cross/entity-invariant-skill-not-found.
fields:
  - name: id
    type: string
  - name: status
    type: string
invariants:
  - status:active → status:closed via skill.no-such-skill
  - this is not a valid invariant syntax
---

# Bad invariant

First invariant references missing skill. Second is unparseable syntax.
