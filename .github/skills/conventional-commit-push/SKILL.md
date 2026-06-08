---
name: conventional-commit-push
description: 'Create git commit messages using Conventional Commits v1.0.0 and push safely to GitHub. Use for add/commit/push, commit formatting, and branch push workflows.'
argument-hint: 'Describe what changed and target branch, for example: added auth validation, branch main'
user-invocable: true
---

# Conventional Commit Push

## When To Use
- Need to commit and push current changes.
- Need commit message in Conventional Commits format.
- Need predictable and safe push workflow for GitHub.

## Commit Format
Use this exact structure:

<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]

Rules from Conventional Commits v1.0.0:
- Type is required.
- Description must be short and meaningful.
- Scope is optional and is wrapped in parentheses.
- Breaking changes use `!` before colon or footer `BREAKING CHANGE: ...`.

Common types:
- feat: new feature
- fix: bug fix
- docs: documentation only
- refactor: code change without feature or fix
- test: tests only
- chore: maintenance tasks
- ci: CI configuration
- perf: performance improvements

## Procedure
1. Check repository state:
   - `git status --short`
   - `git branch --show-current`
   - `git remote -v`
2. Infer best commit type from actual file changes.
3. Build message in Conventional Commits format.
4. Stage changes:
   - `git add -A`
5. Commit:
   - `git commit -m "<type>(<scope>): <description>"`
6. Push:
   - `git push origin <current-branch>`

## Safety Rules
- Never run `git push --force` or `git push --force-with-lease` unless explicitly requested.
- Do not rewrite git history by default.
- If no changes are staged after `git add -A`, stop and report "nothing to commit".
- If push is rejected, report exact reason and propose next safe command.

## Quick Examples
- `feat(auth): add email verification in signup flow`
- `fix(ui): prevent crash when settings is empty`
- `docs(readme): add setup steps for Expo v54`
- `refactor(service): split supabase client creation`
- `feat(api)!: rename login endpoint`

With breaking footer:

feat(api): rename login endpoint

BREAKING CHANGE: /login moved to /auth/login.
