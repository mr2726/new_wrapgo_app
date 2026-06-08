---
name: readme-maintainer
description: 'Update README.md content and keep navigation links correct. Use when user asks: update README, add docs, add links, refresh table of contents, sync README after code changes.'
argument-hint: 'Describe what changed and which sections must be added or updated in README.md'
user-invocable: true
---

# README Maintainer

## Purpose
Keep `README.md` accurate and easy to navigate.

## When To Use
- User asks to update or refresh README.
- New components, pages, services, or files were added.
- User asks to add links, anchors, or table of contents.

## Required Output
1. Update relevant README sections based on current code.
2. Ensure `## Navigation` contains links for each major block and component/page/backend entry.
3. Add missing links when new sections appear.
4. Keep naming consistent with existing README headings.

## Workflow
1. Read current `README.md` and collect headings.
2. Compare headings with navigation links.
3. Add or update links so each important heading is discoverable.
4. Update documentation text for changed files and behavior.
5. Keep examples and prop docs aligned with code.

## Guardrails
- Do not invent APIs that do not exist in code.
- Keep edits minimal and structured.
- Preserve existing README style unless user asks for redesign.
