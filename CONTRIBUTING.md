# Contributing

This document exists to enforce a consistent CI and deploy workflow.

## Branch Policy

- Treat `main` as the production branch.
- Do not push directly to `main`.
- Use a short-lived branch: `feature/<name>`, `fix/<name>`, or `chore/<name>`.

## Pull Request Rules

- Open a PR into `main`.
- Keep each PR focused on one change.
- Include a short summary of what changed and why.
- Add screenshots for UI changes.

## Required Checks (Before Merge)

Run locally before creating or merging a PR:

```bash
npm run lint
npm run build
```

- The GitHub Actions CI workflow must pass before merge.
- Do not merge if CI is red.

## CI and Production Deploy

- CI workflow: `.github/workflows/ci.yml`
- Production deploy workflow: `.github/workflows/deploy-self-hosted.yml`
- Deploy script used by workflow: `scripts/deploy.sh`
- Any commit merged into `main` is expected to auto-deploy.

## Commit Messages

Use clear, descriptive commit messages:

- `fix(weather): handle missing location result`
- `docs(ci): tighten contributing rules`
