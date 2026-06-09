---
description: "Use when starting work, creating commits, or pushing code. Enforce task branches, protect main, and apply the project's git branch workflow automatically."
name: "Git Branch Workflow"
applyTo: "**"
---
# Git Branch Workflow

- Treat `main` as stable and deployable at all times.
- For every new task, work in a dedicated branch: `feature/*`, `bugfix/*`, `hotfix/*`, `refactor/*`, or `experiment/*`.
- Never commit directly to `main` unless the user explicitly instructs otherwise.
- If work starts while checked out on `main`, create the correct task branch before the first commit.
- If `main` is clean, update it from `origin/main` before creating the new branch.
- If `main` already has uncommitted task changes, create a branch from the current HEAD and continue there.
- Keep commits focused and use clear imperative English commit messages unless the user explicitly requests another commit convention.
