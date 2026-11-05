# Project Guidelines — e-commerce mobile frontend

These rules apply to every contributor, human or AI agent, working on `e-commerce-MOBILE-FRONT`, the React Native mobile frontend. Related repositories provide integration context:

| Repository | Scope |
|---|---|
| `e-commerce-WEB-FRONT` | Web front-end |
| `e-commerce-MOBILE-FRONT` | Mobile front-end |
| `e-commerce-BACK` | Back-end / API |
| `e-commerce-INFRA` | Infrastructure, CI/CD, deployment |

`CLAUDE.md` and `AGENT.md` must stay identical **within this repository**. Update both together. Mobile-specific guidance must not be copied into the web, backend, or infrastructure repositories automatically.

## Mobile implementation contract

### Prepared design is the source of truth

- Implement the system design already prepared for this project. Follow its architecture, application flows, service boundaries, authentication model, API contracts, and data ownership.
- Follow the prepared UI design system for colors, typography, spacing, icons, components, and screen layouts wherever those artifacts are provided. Do not confuse a system architecture document with a visual specification.
- Before implementation, locate and read the relevant design documents, diagrams, mockups, and API specifications. Record their actual paths or links in the implementation notes or PR; do not invent a design file location.
- At the time this guidance was customized, the workspace contained these two guidance files and an empty `mobile/` directory. No prepared design artifact or application manifest was available to verify. This is a snapshot, not a permanent description: inspect the current repository before each task.
- If a required design artifact is unavailable, request its location before making decisions that depend on it. Continue independent work where possible. Do not create a replacement architecture or visual identity from assumptions.
- Reuse approved design tokens and shared components. Put repeated visual values in the existing theme/token layer rather than duplicating them across screens.
- When native platform behavior requires a design adaptation, document the reason and keep the intended flow and visual hierarchy. Raise material design or contract conflicts before changing them.

### Stack and project structure

- **React Native is the required mobile framework.** Build native mobile screens, not a browser UI wrapped in a WebView.
- Inspect `mobile/` and the repository root for the application manifest, lockfile, configuration, and existing structure before adding files. Extend the established app instead of creating a second scaffold.
- Use TypeScript for new application code and typed component props, navigation parameters, and API boundaries. Avoid `any`; validate untrusted data at boundaries.
- Follow the prepared design and installed project configuration for Expo versus bare React Native, routing, state management, styling, networking, and testing. Do not select or replace these libraries solely from personal preference.
- Use the package manager indicated by the lockfile and the versions established by the project. Do not add dependencies or upgrade the framework without an explicit request.
- Keep screens focused on composing UI and connecting behavior. Keep reusable UI, feature logic, API access, and platform adapters separate using the existing folder conventions; do not impose a new directory tree without evidence.
- Use functional components and hooks. Keep effects scoped, clean up subscriptions, and handle cancellation or stale responses when screens unmount or inputs change.
- Use React Native primitives and the existing component library. Do not use DOM elements, browser storage, or browser-only APIs in native code.

### Mobile UX and accessibility

- Cover loading, empty, error, retry, success, and offline states where relevant; do not leave screens dependent on a happy-path API response.
- Respect safe areas, keyboard visibility, platform back behavior, and the configured navigation model. Keep inputs and primary actions usable on small screens.
- Support text scaling, accessible labels and roles, adequate contrast, and usable touch targets. Do not communicate state by color alone.
- Preserve form input after recoverable errors and prevent duplicate submissions. Show actionable messages without exposing internal errors or credentials.
- Follow approved navigation and authentication flows, including session expiry and deep links when specified. Do not introduce routes or permissions outside the requested feature.
- Use virtualized lists for large catalogs and order lists, stable item keys, and appropriately sized images. Measure performance before adding memoization or other optimization complexity.
- Verify changed behavior on Android and iOS where supported by the project. Clearly report any platform that could not be exercised.

### API integration, authentication, and commerce

- Integrate with `e-commerce-BACK` through the documented API contracts. Keep request configuration, authentication handling, and error mapping in the established API layer, not duplicated across screens.
- Treat backend prices, discounts, stock, shipping costs, order totals, payment status, and authorization decisions as authoritative. Client validation improves UX but never replaces server validation.
- Preserve the API's monetary representation and currency semantics. Avoid floating-point calculations for payable amounts; use approved formatting for display.
- Follow the prepared authentication design. If it specifies OIDC/OAuth, use the approved native client flow and redirect configuration; never embed a client secret in the app.
- Store sensitive session material only through the project's approved platform-backed secure storage. Do not place credentials in plain persistent storage, logs, analytics, or committed fixtures.
- Mobile bundles and client environment variables are inspectable. Keep backend secrets and privileged operations on the server; provide only placeholders in `.env.example`.
- Handle expired sessions, network failures, timeouts, and API validation errors consistently. Clear user-specific cached data on logout or account changes.
- Do not blindly retry checkout, payment, or order-creation requests. Use the backend's documented idempotency and recovery behavior to prevent duplicate operations.
- Do not persist raw payment details. Use only the payment flow and provider integration approved in the system design.
- Keep mocks explicit and confined to development/tests; never silently substitute mock data for a failed production request.

### Validation and completion

- Discover commands from the actual package scripts and CI configuration. Run commands from the application directory; do not invent `npm` scripts or claim a scaffold exists before checking.
- For code changes, run the relevant typecheck, lint, tests, and available build checks. Add focused tests for changed behavior using the established test tools.
- For UI changes, compare the result against the prepared design and exercise relevant loading/error states, keyboard behavior, navigation, and accessibility. Attach screenshots or recordings to the PR when available.
- Prioritize coverage for authentication/session handling, cart changes, checkout submission, and API failure recovery when those features are in scope.
- Never claim native builds or simulator/device checks passed unless they ran. If the environment lacks a required SDK, simulator, device, or signing setup, report the precise validation gap.
- For documentation-only changes, review the diff, check formatting, and verify `AGENT.md` and `CLAUDE.md` remain identical; application tests are unnecessary.
- Finish with the changed files, behavior delivered, checks actually run, and remaining blockers or platform gaps. Do not publish builds, submit to stores, or trigger OTA updates without an explicit request.

---

## 1. Branching model

```
main      ●───────────────●──────────────●────────   (production — tagged releases only)
           \             ↑ v1.0.0       ↑ v1.0.1
dev         ●──●──●──●───●──────●──●────●──────────   (integration)
               ↑     ↑          ↑
feature/*   ───┘     │          │
fix/*       ─────────┘          │
hotfix/*   (from main) ─────────┴─→ main + dev
```

### Permanent branches

| Branch | Role | Rules |
|---|---|---|
| `main` | **Production.** Always reflects what is (or is about to be) deployed in prod. | Never commit directly. Only receives merges from `dev` (releases) or `hotfix/*`. Every release on `main` is tagged. |
| `dev` | **Integration.** All finished work is merged here first. | Never commit directly. Only receives merges from work branches through a Pull Request. Must always build and pass tests. |

### Work branches

Always created **from `dev`** (except hotfixes), and always merged back **into `dev`** via a Pull Request.

| Prefix | Use for | Example |
|---|---|---|
| `feature/` | New functionality | `feature/cart-checkout` |
| `fix/` | Non-urgent bug fix | `fix/price-rounding` |
| `refactor/` | Code restructuring, no behaviour change | `refactor/auth-service` |
| `docs/` | Documentation only | `docs/api-readme` |
| `chore/` | Tooling, dependencies, config | `chore/upgrade-node-22` |
| `test/` | Adding or fixing tests | `test/order-service` |
| `ci/` | CI/CD pipeline changes | `ci/add-lint-step` |
| `hotfix/` | **Urgent prod fix** — created from `main` | `hotfix/payment-crash` |

Branch naming rules:
- lowercase, words separated by hyphens: `feature/user-login`, not `Feature/UserLogin`
- short and descriptive (max ~50 chars)
- optionally include the issue number: `feature/42-user-login`
- one branch = one topic. Delete the branch once merged.

---

## 2. Workflows

### Feature / fix (normal flow)

```bash
git switch dev
git pull origin dev
git switch -c feature/my-feature

# ... work, commit often with conventional commits ...

git fetch origin
git rebase origin/dev          # keep the branch up to date, resolve conflicts locally
git push -u origin feature/my-feature
# open a Pull Request: feature/my-feature → dev
```

### Release (dev → main)

1. Make sure `dev` is green (build + tests pass) and contains everything planned for the release.
2. Open a Pull Request **`dev` → `main`** titled `release: vX.Y.Z`.
3. Once approved, merge it with a **merge commit** (no squash — keep the history of `dev`).
4. Tag the merge commit on `main` and push the tag (see §4) when explicitly authorized. Verify the mobile CI release configuration before assuming what the tag triggers.

### Hotfix (urgent prod bug)

```bash
git switch main
git pull origin main
git switch -c hotfix/short-description
# fix + commit (fix: ...)
git push -u origin hotfix/short-description
```

1. Open a PR **`hotfix/*` → `main`**, merge it, then tag with a **PATCH** bump (e.g. `v1.4.0` → `v1.4.1`).
2. **Immediately** merge `main` back into `dev` (or open a PR `hotfix/*` → `dev`) so the fix is not lost at the next release.

---

## 3. Conventional Commits

All commit messages **must** follow the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<optional scope>): <short description>

<optional body>

<optional footer(s)>
```

### Types

| Type | When to use | Version impact |
|---|---|---|
| `feat` | A new feature | MINOR |
| `fix` | A bug fix | PATCH |
| `docs` | Documentation only | — |
| `style` | Formatting, whitespace, no code change | — |
| `refactor` | Code change that neither fixes a bug nor adds a feature | — |
| `perf` | Performance improvement | PATCH |
| `test` | Adding or correcting tests | — |
| `build` | Build system or external dependencies | — |
| `ci` | CI configuration and scripts | — |
| `chore` | Other changes that don't modify src or tests | — |
| `revert` | Reverts a previous commit | — |

A breaking change is marked with `!` after the type/scope **and/or** a `BREAKING CHANGE:` footer → **MAJOR** version bump.

### Rules

- Description in **English**, **imperative mood**, lowercase, no final period: `add cart page`, not `Added cart page.`
- Subject line ≤ **72 characters**.
- Scope is optional but encouraged, and should be a module/area name: `feat(cart): ...`, `fix(auth): ...`
- Body explains **what and why**, not how. Wrap at 72 characters. Separate from subject by a blank line.
- Reference issues in the footer: `Closes #12`, `Refs #34`.
- One logical change per commit. Don't mix a refactor and a feature in the same commit.
- Never commit commented-out code, debug logs, or unrelated formatting changes.

### Examples

```
feat(cart): add quantity selector on product line
```
```
fix(api): return 404 when product does not exist

Previously the endpoint returned 500 because the null result
was not handled.

Closes #27
```
```
feat(auth)!: replace session cookies with JWT

BREAKING CHANGE: clients must now send the Authorization header.
```
```
chore(deps): bump express from 4.19.2 to 4.21.0
```

---

## 4. Tags, versioning & deployment

- Versioning follows [Semantic Versioning](https://semver.org/): `vMAJOR.MINOR.PATCH` (e.g. `v1.3.0`).
  - **MAJOR**: breaking change (`!` / `BREAKING CHANGE`)
  - **MINOR**: new backwards-compatible feature (`feat`)
  - **PATCH**: backwards-compatible fix (`fix`, `perf`, hotfixes)
- **Tags are only created on `main`**, on the release/hotfix merge commit. Never tag `dev` or a work branch.
- Inspect the mobile CI configuration to determine what a `v*` tag triggers. A release tag, signed native build, store submission, store rollout, and OTA update are distinct steps; do not assume a tag publishes the app.
- Keep the app's user-visible version and platform build identifiers consistent with the configured mobile release process. Store credentials and signing material must remain outside version control.
- Always use **annotated** tags:

```bash
git switch main
git pull origin main
git tag -a v1.2.0 -m "release: v1.2.0"
git push origin v1.2.0
```

- Never delete, move or re-use a pushed tag. If a release is broken, fix it and publish a new PATCH version.
- Each repository is versioned independently. Coordinate releases when a change spans several repos (e.g. BACK API change + WEB-FRONT usage): release the back-end first, then the fronts.
- Pre-releases, if needed, use a suffix: `v1.2.0-rc.1`.

---

## 5. Pull Requests

- Every change goes through a Pull Request. **No direct pushes to `main` or `dev`.**
- Target branch: `dev` for all work branches; `main` only for releases (`dev` → `main`) and hotfixes.
- PR title follows the Conventional Commits format: `feat(cart): add quantity selector`.
- PR description must include:
  - **What** changed and **why**
  - **How to test** it
  - Linked issue(s): `Closes #12`
  - Screenshots for UI changes (WEB-FRONT / MOBILE-FRONT)
- At least **1 approval** from another team member before merging. Don't approve your own PR.
- CI must be green before merging.
- Keep PRs small and focused (ideally < 400 lines changed). Split large work into several PRs.
- Merge strategy:
  - work branch → `dev`: **Squash and merge** (the squashed commit message must be a valid conventional commit)
  - `dev` → `main`: **Merge commit**
  - `hotfix/*` → `main`: **Squash and merge**
- Delete the source branch after merge.

---

## 6. General Git best practices

- `git pull` before starting work; rebase your branch on `origin/dev` regularly to limit conflicts.
- Prefer `git rebase` on **your own** work branches; **never rewrite history** of `main`, `dev`, or a branch someone else is working on.
- **Never `git push --force`** to `main` or `dev`. On your own branch, use `git push --force-with-lease` only.
- Commit small and often; push at least once a day so work isn't lost.
- Review your diff before committing: `git diff --staged`.
- **Never commit secrets** (API keys, passwords, tokens, `.env` files, private keys, kubeconfigs, Terraform state). Use `.env.example` with placeholder values. If a secret is committed, consider it leaked: rotate it immediately and tell the team.
- Keep `.gitignore` up to date (`node_modules/`, build output, `.env`, IDE files, OS files, `*.tfstate`, ...).
- Don't commit generated files, build artifacts or large binaries.
- Resolve merge conflicts locally, then run the build and tests before pushing.

---

## 7. Rules specific to AI agents (Claude, Copilot, Codex, ...)

AI agents working in these repositories **must**:

1. Follow every rule in this file (branching, conventional commits, PRs, tags).
2. **Never commit or push directly to `main` or `dev`.** Always create a work branch from `dev` (or from `main` for a hotfix) with the correct prefix.
3. **Never create, move, delete or push tags**, and never trigger a deployment, unless a human explicitly asks for it in the current conversation.
4. **Never force-push**, rewrite shared history, or delete remote branches unless explicitly asked.
5. Never merge a Pull Request themselves unless explicitly asked.
6. Write commit messages and PR titles in Conventional Commits format.
7. Keep changes scoped to the task. No drive-by refactors or unrelated formatting.
8. Run the validation appropriate to the change as described in the mobile implementation contract, and report failures or unavailable checks honestly.
9. Never commit secrets or `.env` files; never print secret values in logs or PR descriptions.
10. When unsure about a destructive or irreversible action, stop and ask a human.
11. Keep `CLAUDE.md` and `AGENT.md` identical; if one is updated, update the other in the same commit.

---

## 8. Quick reference

```bash
# start work
git switch dev && git pull && git switch -c feature/xxx

# commit
git commit -m "feat(scope): short description"

# update branch with latest dev
git fetch origin && git rebase origin/dev

# push & open PR to dev
git push -u origin feature/xxx

# release (after dev → main PR is merged)
git switch main && git pull && git tag -a vX.Y.Z -m "release: vX.Y.Z" && git push origin vX.Y.Z
```
