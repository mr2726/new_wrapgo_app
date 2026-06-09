---
name: git-branch-management
description: 'Manage git branches with a clean workflow. Use when starting a new task, creating feature or bugfix branches, protecting main, or preparing task branches before commit and push.'
argument-hint: 'Describe the task, for example: start bugfix branch for login validation'
user-invocable: true
---

# Git Branch Management

## Goal
Keep `main` stable and deployable.
Every new feature, bug fix, refactor, hotfix, or experiment must be developed in its own branch.

## Branch Naming Convention
- Feature: `feature/<task-name>`
- Bug fix: `bugfix/<task-name>`
- Critical production fix: `hotfix/<task-name>`
- Refactoring: `refactor/<task-name>`
- Experiment: `experiment/<task-name>`

Examples:
- `feature/auth`
- `feature/dashboard`
- `bugfix/login-error`
- `hotfix/security`
- `refactor/api`
- `experiment/new-ui`

## Start Workflow
When a new task starts:
1. Switch to `main`.
2. Update `main` from `origin/main`.
3. Create a task branch using the correct prefix.
4. Do all development only inside that branch.

Commands:
- `git checkout main`
- `git pull origin main`
- `git checkout -b feature/task-name`

## Commit Rules
- Keep commits small and focused.
- Prefer clear imperative English messages.
- Avoid vague messages like `update`, `fix`, `123`, or `changes`.

Good examples:
- `Add authentication`
- `Implement payment flow`
- `Fix login validation`
- `Refactor user service`

## Finish Workflow
1. `git add -A`
2. `git commit -m "Add authentication"`
3. `git push origin feature/auth`
4. Create a Pull Request into `main`.

## Rules
- Never work directly on `main`.
- One branch equals one logical task.
- Do not mix unrelated work in one branch.
- Always branch from the latest `main`.
- Delete merged branches after merge when safe.

## Notes For Automation
- If the current branch is `main` and the task is new, create a task branch before editing or committing.
- If the working tree already has local task changes on `main`, create a branch from the current HEAD before committing those changes.
- Infer a short kebab-case task slug from the user request when the branch name is not given.
- Only stay on `main` if the user explicitly instructs that behavior.
