# Contributing

1. Use Node 18 or newer (`nvm use`).
2. `npm install`, then `npm run dev`.
3. Create a branch: `feature/<issue-id>-short-name` or `fix/<issue-id>-short-name`.
4. Write tests first for core changes (`src/core/__tests__`).
5. Before opening a PR: `npm run format && npm run typecheck && npm run coverage && npm run build`.
6. Use Conventional Commit messages. Update `CHANGELOG.md` under "Unreleased".

**Definition of Done:** acceptance criteria met · tests added · CI green · docs/changelog updated · reviewed by one person.
