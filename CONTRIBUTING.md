# Contributing

## Branching model

Keep `main` releasable. Start each change from an up-to-date `main` and use a short, prefixed branch name:

```bash
git switch main
git pull --ff-only
git switch -c feature/short-description
```

Use `feature/`, `fix/`, `docs/`, or `chore/`. Commit focused changes with a Conventional Commit prefix (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Avoid direct pushes to `main`.

## Pull requests

Open a pull request from the feature branch into `main`. Keep PRs focused, explain user impact, complete the PR checklist, and include screenshots for UI changes. The CI workflow must pass lint and production build checks before merge. Use a squash merge to keep `main` history readable, then delete the merged branch.

For a hosted repository, protect `main` in GitHub repository settings with a pull request requirement, one approval where collaborators are available, required `CI / Lint and production build` status, resolved review conversations, and blocked force pushes/deletion. Enable automatically deleting merged head branches.

## Local checks

```bash
npm run lint
npm run format:check
npm run build
```

Run `docker compose up -d`, `npm run seed`, and `npm run dev:full` to check the MongoDB-backed path. The browser falls back to sample tickets when MongoDB is unavailable.
